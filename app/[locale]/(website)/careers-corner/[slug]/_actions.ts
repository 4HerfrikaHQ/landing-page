"use server";

import { and, eq, gte, lt, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { formatInTimeZone } from "date-fns-tz";
import { db } from "@/src/db";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { availability } from "@/src/db/schema/tables/availability";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { actionClient, ActionError } from "@/src/lib/safe-action";
import { signBookingToken } from "@/src/lib/booking-tokens";
import { buildBookingIcs, computeSlots } from "./_helpers";
import { CreateBookingSchema, ListSlotsSchema } from "./_schema";

// ---------- Google Meet via Calendar REST API ----------
//
// We hit Google's Calendar API directly with fetch instead of the heavy `googleapis` pkg.
// We exchange the long-lived refresh token for a short-lived access token, cached in
// module scope so concurrent bookings reuse it.

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(): Promise<string> {
	if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
		return cachedAccessToken.token;
	}
	const res = await fetch("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
			client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
			refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN ?? "",
			grant_type: "refresh_token",
		}),
	});
	if (!res.ok) {
		throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
	}
	const json = (await res.json()) as { access_token: string; expires_in: number };
	cachedAccessToken = {
		token: json.access_token,
		expiresAt: Date.now() + json.expires_in * 1000,
	};
	return json.access_token;
}

function googleCalendarId(): string {
	const id = process.env.GOOGLE_ORG_CALENDAR_ID;
	if (!id) throw new Error("GOOGLE_ORG_CALENDAR_ID not set");
	return encodeURIComponent(id);
}

export async function createMeetEvent(params: {
	summary: string;
	description: string;
	startAtUtc: Date;
	endAtUtc: Date;
	mentorEmail: string;
	menteeEmail: string;
}): Promise<{ eventId: string; meetUrl: string }> {
	const token = await getGoogleAccessToken();
	const url = `https://www.googleapis.com/calendar/v3/calendars/${googleCalendarId()}/events?conferenceDataVersion=1&sendUpdates=all`;

	const body = {
		summary: params.summary,
		description: params.description,
		start: { dateTime: params.startAtUtc.toISOString() },
		end: { dateTime: params.endAtUtc.toISOString() },
		attendees: [{ email: params.mentorEmail }, { email: params.menteeEmail }],
		conferenceData: {
			createRequest: {
				requestId: `4hf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				conferenceSolutionKey: { type: "hangoutsMeet" },
			},
		},
	};

	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		throw new Error(
			`Google Calendar events.insert failed: ${res.status} ${await res.text()}`,
		);
	}
	const data = (await res.json()) as {
		id?: string;
		hangoutLink?: string;
		conferenceData?: { entryPoints?: { entryPointType?: string; uri?: string }[] };
	};
	const eventId = data.id;
	const meetUrl =
		data.hangoutLink ??
		data.conferenceData?.entryPoints?.find(
			(e) => e.entryPointType === "video",
		)?.uri;
	if (!eventId || !meetUrl) throw new Error("Failed to create Meet event");
	return { eventId, meetUrl };
}

export async function deleteMeetEvent(eventId: string): Promise<void> {
	const token = await getGoogleAccessToken();
	const url = `https://www.googleapis.com/calendar/v3/calendars/${googleCalendarId()}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;
	const res = await fetch(url, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok && res.status !== 410) {
		// 410 Gone is fine — event already deleted
		throw new Error(
			`Google Calendar events.delete failed: ${res.status} ${await res.text()}`,
		);
	}
}

const FROM = "4herfrika <hello@4herfrika.org>";

function formatInTz(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "EEEE, MMM d, yyyy 'at' HH:mm zzz");
}

function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
}

type ConfirmationCommon = {
	mentorName: string;
	mentorEmail: string;
	menteeName: string;
	menteeEmail: string;
	startAtUtc: Date;
	endAtUtc: Date;
	meetUrl: string;
	menteeTimezone: string;
	mentorTimezone: string;
	purpose: string;
	icsAttachment: string;
};

export async function sendBookingConfirmationMentee(
	p: ConfirmationCommon & { manageUrl: string; sessionDurationMinutes: number },
) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: FROM,
		to: p.menteeEmail,
		subject: `Confirmed: your call with ${p.mentorName}`,
		text: `Hi ${p.menteeName},

Your ${p.sessionDurationMinutes}-minute call with ${p.mentorName} is confirmed for ${formatInTz(p.startAtUtc, p.menteeTimezone)}.

Join here: ${p.meetUrl}

Need to cancel or reschedule? ${p.manageUrl}

— 4HerFrika`,
		attachments: [
			{
				filename: "invite.ics",
				content: Buffer.from(p.icsAttachment).toString("base64"),
			},
		],
	});
}

export async function sendBookingConfirmationMentor(
	p: ConfirmationCommon & {
		intake: Record<string, string | null | undefined>;
	},
) {
	const intakeLines = Object.entries(p.intake)
		.filter(([, v]) => v)
		.map(([k, v]) => `- ${k}: ${v}`)
		.join("\n");
	const resend = new Resend(process.env.RESEND_API_KEY);
	await resend.emails.send({
		from: FROM,
		to: p.mentorEmail,
		subject: `New booking: ${p.menteeName} on ${formatInTz(p.startAtUtc, p.mentorTimezone)}`,
		text: `Hi ${p.mentorName},

You have a new mentee booking.

When: ${formatInTz(p.startAtUtc, p.mentorTimezone)}
Meet: ${p.meetUrl}

Mentee: ${p.menteeName} <${p.menteeEmail}>
Purpose: ${p.purpose}

${intakeLines}

— 4HerFrika`,
		attachments: [
			{
				filename: "invite.ics",
				content: Buffer.from(p.icsAttachment).toString("base64"),
			},
		],
	});
}

export async function getMentorBySlug(slug: string) {
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(and(eq(mentors.slug, slug), eq(mentors.active, true)))
		.limit(1);
	return mentor ?? null;
}

export const listMentorSlots = actionClient
	.schema(ListSlotsSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await getMentorBySlug(parsedInput.mentorSlug);
		if (!mentor) throw new ActionError("Mentor not found");

		const [settings] = await db
			.select()
			.from(mentorBookingSettings)
			.where(eq(mentorBookingSettings.mentor_id, mentor.id))
			.limit(1);
		if (!settings) throw new ActionError("Mentor booking settings missing");

		const templates = await db
			.select()
			.from(availability)
			.where(eq(availability.mentor_id, mentor.id));

		const fromUtc = new Date(parsedInput.fromUtc);
		const toUtc = new Date(parsedInput.toUtc);

		const existing = await db
			.select({ startUtc: bookings.start_at, endUtc: bookings.end_at })
			.from(bookings)
			.where(
				and(
					eq(bookings.mentor_id, mentor.id),
					ne(bookings.status, "cancelled"),
					gte(bookings.start_at, fromUtc),
					lt(bookings.start_at, toUtc),
				),
			);

		const slots = computeSlots({
			availabilityTemplates: templates,
			existingBookings: existing,
			settings,
			fromUtc,
			toUtc,
			now: new Date(),
		});

		return {
			mentorId: mentor.id,
			mentorTimezone: templates[0]?.timezone ?? "UTC",
			slots,
		};
	});

export const createBooking = actionClient
	.schema(CreateBookingSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await getMentorBySlug(parsedInput.mentorSlug);
		if (!mentor) throw new ActionError("Mentor not found");

		const [mentorUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, mentor.user_id))
			.limit(1);
		const mentorEmail = mentorUser?.email;
		if (!mentorEmail) throw new ActionError("Mentor email missing");

		const [settings] = await db
			.select()
			.from(mentorBookingSettings)
			.where(eq(mentorBookingSettings.mentor_id, mentor.id))
			.limit(1);
		if (!settings) throw new ActionError("Mentor booking settings missing");

		const startAt = new Date(parsedInput.startAtUtc);
		const endAt = new Date(
			startAt.getTime() + settings.session_duration_minutes * 60_000,
		);

		// Per-mentee active cap (across all mentors — prevents one person hoarding bookings)
		const [{ activeCount }] = await db
			.select({ activeCount: sql<number>`count(*)::int` })
			.from(bookings)
			.where(
				and(
					eq(bookings.mentee_email, parsedInput.mentee_email),
					eq(bookings.status, "confirmed"),
				),
			);
		if (activeCount >= settings.max_active_bookings_per_mentee) {
			throw new ActionError(
				"You already have an active booking. Please cancel it before booking a new one.",
			);
		}

		// Re-check that the slot is still available
		const dayStart = new Date(startAt);
		dayStart.setUTCHours(0, 0, 0, 0);
		const dayEnd = new Date(dayStart);
		dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

		const templates = await db
			.select()
			.from(availability)
			.where(eq(availability.mentor_id, mentor.id));
		const existing = await db
			.select({ startUtc: bookings.start_at, endUtc: bookings.end_at })
			.from(bookings)
			.where(
				and(
					eq(bookings.mentor_id, mentor.id),
					ne(bookings.status, "cancelled"),
					gte(bookings.start_at, dayStart),
					lt(bookings.start_at, dayEnd),
				),
			);
		const slots = computeSlots({
			availabilityTemplates: templates,
			existingBookings: existing,
			settings,
			fromUtc: dayStart,
			toUtc: dayEnd,
			now: new Date(),
		});
		if (!slots.some((s) => s.startUtc === startAt.toISOString())) {
			throw new ActionError(
				"That slot is no longer available. Please pick another time.",
			);
		}

		// Mint Google Meet event
		const { eventId, meetUrl } = await createMeetEvent({
			summary: `4HerFrika: ${parsedInput.mentee_name} ↔ ${mentor.name}`,
			description: `Purpose: ${parsedInput.purpose}\n\nMentee: ${parsedInput.mentee_name} <${parsedInput.mentee_email}>`,
			startAtUtc: startAt,
			endAtUtc: endAt,
			mentorEmail,
			menteeEmail: parsedInput.mentee_email,
		});

		// Insert booking
		const [booking] = await db
			.insert(bookings)
			.values({
				mentor_id: mentor.id,
				mentee_name: parsedInput.mentee_name,
				mentee_email: parsedInput.mentee_email,
				mentee_gender: parsedInput.mentee_gender,
				purpose: parsedInput.purpose,
				mentee_phone: parsedInput.mentee_phone || null,
				mentee_linkedin: parsedInput.mentee_linkedin || null,
				mentee_country: parsedInput.mentee_country || null,
				mentee_career_stage: parsedInput.mentee_career_stage,
				start_at: startAt,
				end_at: endAt,
				mentee_timezone: parsedInput.menteeTimezone,
				meet_url: meetUrl,
				google_event_id: eventId,
			})
			.returning();

		// Side effects — best-effort emails
		const manageToken = signBookingToken({
			bookingId: booking.id,
			action: "manage",
			expiresAt: startAt.getTime(),
		});
		const manageUrl = `${siteUrl()}/bookings/${manageToken}`;
		const mentorTz = templates[0]?.timezone ?? "UTC";
		const ics = buildBookingIcs({
			uid: booking.id,
			method: "REQUEST",
			summary: `4HerFrika mentorship with ${mentor.name}`,
			description: parsedInput.purpose,
			startAtUtc: startAt,
			endAtUtc: endAt,
			meetUrl,
			mentorName: mentor.name,
			mentorEmail,
			menteeName: parsedInput.mentee_name,
			menteeEmail: parsedInput.mentee_email,
		});

		try {
			await Promise.all([
				sendBookingConfirmationMentee({
					mentorName: mentor.name,
					mentorEmail,
					menteeName: parsedInput.mentee_name,
					menteeEmail: parsedInput.mentee_email,
					startAtUtc: startAt,
					endAtUtc: endAt,
					meetUrl,
					menteeTimezone: parsedInput.menteeTimezone,
					mentorTimezone: mentorTz,
					purpose: parsedInput.purpose,
					icsAttachment: ics,
					manageUrl,
					sessionDurationMinutes: settings.session_duration_minutes,
				}),
				sendBookingConfirmationMentor({
					mentorName: mentor.name,
					mentorEmail,
					menteeName: parsedInput.mentee_name,
					menteeEmail: parsedInput.mentee_email,
					startAtUtc: startAt,
					endAtUtc: endAt,
					meetUrl,
					menteeTimezone: parsedInput.menteeTimezone,
					mentorTimezone: mentorTz,
					purpose: parsedInput.purpose,
					icsAttachment: ics,
					intake: {
						Phone: parsedInput.mentee_phone,
						LinkedIn: parsedInput.mentee_linkedin,
						Country: parsedInput.mentee_country,
						"Career stage": parsedInput.mentee_career_stage,
						Gender: parsedInput.mentee_gender,
					},
				}),
			]);
			await db
				.update(bookings)
				.set({ confirmation_sent_at: new Date() })
				.where(eq(bookings.id, booking.id));
		} catch (e) {
			console.error("[booking] confirmation email failed", e);
		}

		revalidatePath(`/careers-corner/${mentor.slug}`);
		return { bookingId: booking.id, manageUrl };
	});
