"use server";

import { db } from "@/src/db";
import { availability } from "@/src/db/schema/tables/availability";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { signBookingToken } from "@/src/lib/booking-tokens";
import {
	createMentorCalendarEvent,
	deleteMentorCalendarEvent,
	mentorCalendarActionMessage,
	selectNewBookingCalendarHost,
	stableCalendarAttemptKey,
} from "@/src/lib/google-calendar";
import {
	OrgGoogleCalendarError,
	createOrgGoogleCalendarEvent,
	deleteOrgGoogleCalendarEvent,
	ensureOrgGoogleCalendarConnection,
} from "@/src/lib/org-google-calendar";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { addDays, startOfWeek } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { and, eq, getTableColumns, gte, lt, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/src/lib/email";
import { buildBookingIcs, computeSlots } from "./_helpers";
import { CreateBookingSchema, ListSlotsSchema } from "./_schema";

const FROM = "4herfrika <hello@4herfrika.org>";

function calendarActionError(error: unknown): ActionError {
	if (error instanceof OrgGoogleCalendarError) {
		return new ActionError(
			error.code === "connection_unavailable"
				? "Booking is temporarily unavailable. Please try again later."
				: "The calendar could not complete the requested operation.",
		);
	}
	return new ActionError(mentorCalendarActionMessage(error));
}

async function selectBookingCalendarHost(mentor: {
	id: string;
	email: string;
}) {
	const host = await selectNewBookingCalendarHost({
		mentorId: mentor.id,
		mentorEmail: mentor.email,
	});
	if (host.mode === "org_google") {
		try {
			await ensureOrgGoogleCalendarConnection();
		} catch (error) {
			throw calendarActionError(error);
		}
	}
	return host;
}

function formatInTz(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "EEEE, MMM d, yyyy 'at' HH:mm zzz");
}

function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
}

// Joining with the invited address skips Google's admit screen, so recommend it
// (framed as the smooth path, not a limitation).
function joinTip(email: string): string {
	return `Tip: for the smoothest entry, join with this email (${email}).`;
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
	await sendEmail({
		from: FROM,
		to: p.menteeEmail,
		subject: `Confirmed: your call with ${p.mentorName}`,
		text: `Hi ${p.menteeName},

Your ${p.sessionDurationMinutes}-minute call with ${p.mentorName} is confirmed for ${formatInTz(p.startAtUtc, p.menteeTimezone)}.

Join here: ${p.meetUrl}
${joinTip(p.menteeEmail)}

Need to cancel or reschedule? ${p.manageUrl}

— 4HerFrika`,
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
	await sendEmail({
		from: FROM,
		to: p.mentorEmail,
		subject: `New booking: ${p.menteeName} on ${formatInTz(p.startAtUtc, p.mentorTimezone)}`,
		text: `Hi ${p.mentorName},

You have a new mentee booking.

When: ${formatInTz(p.startAtUtc, p.mentorTimezone)}
Meet: ${p.meetUrl}
${joinTip(p.mentorEmail)}

Mentee: ${p.menteeName} <${p.menteeEmail}>
Purpose: ${p.purpose}

${intakeLines}

— 4HerFrika`,
	});
}

export async function getMentorBySlug(slug: string) {
	const [mentor] = await db
		.select({
			...getTableColumns(mentors),
			name: users.name,
			email: users.email,
		})
		.from(mentors)
		.innerJoin(users, eq(users.id, mentors.user_id))
		.where(and(eq(mentors.slug, slug), eq(mentors.active, true)))
		.limit(1);
	return mentor ?? null;
}

export const listMentorSlots = actionClient
	.schema(ListSlotsSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await getMentorBySlug(parsedInput.mentorSlug);
		if (!mentor) throw new ActionError("Mentor not found");

		const [settingsRow] = await db
			.select()
			.from(mentorBookingSettings)
			.where(eq(mentorBookingSettings.mentor_id, mentor.id))
			.limit(1);
		if (!settingsRow) throw new ActionError("Mentor booking settings missing");
		const settings = settingsRow;

		const availabilityWindows = await db
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
			availabilityTemplates: availabilityWindows,
			existingBookings: existing,
			settings,
			fromUtc,
			toUtc,
			now: new Date(),
		});

		return {
			mentorId: mentor.id,
			mentorTimezone: availabilityWindows[0]?.timezone ?? "UTC",
			slots,
		};
	});

/**
 * Server-side lookup of the first bookable slot over the mentor's full booking
 * horizon (`now → now + max_horizon_days`), applying the same filters the
 * visible grid uses (min_lead_hours, max_horizon_days, buffer, non-cancelled
 * bookings). Returns the slot's ISO start, or null when nothing is bookable.
 *
 * Called directly from the mentor detail server component so the calendar can
 * initialise to the first available week without a client round-trip.
 */
export async function getFirstAvailableSlotUtc(
	mentorSlug: string,
): Promise<string | null> {
	const mentor = await getMentorBySlug(mentorSlug);
	if (!mentor) return null;

	const [settingsRow] = await db
		.select()
		.from(mentorBookingSettings)
		.where(eq(mentorBookingSettings.mentor_id, mentor.id))
		.limit(1);
	if (!settingsRow) return null;
	const settings = settingsRow;

	const availabilityWindows = await db
		.select()
		.from(availability)
		.where(eq(availability.mentor_id, mentor.id));

	const now = new Date();
	const fromUtc = now;
	const toUtc = addDays(now, settings.max_horizon_days);

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
		availabilityTemplates: availabilityWindows,
		existingBookings: existing,
		settings,
		fromUtc,
		toUtc,
		now,
	});

	return slots[0]?.startUtc ?? null;
}

/**
 * Derives the Monday-based week start (ISO) of the mentor's first bookable slot,
 * so a `SlotPicker` can initialise to the first week with availability. Returns
 * null when nothing is bookable, in which case the picker falls back to the
 * current week.
 */
export async function getInitialWeekStart(
	mentorSlug: string,
): Promise<string | null> {
	const firstSlotUtc = await getFirstAvailableSlotUtc(mentorSlug);

	return firstSlotUtc
		? startOfWeek(new Date(firstSlotUtc), { weekStartsOn: 1 }).toISOString()
		: null;
}

export const createBooking = actionClient
	.schema(CreateBookingSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await getMentorBySlug(parsedInput.mentorSlug);
		if (!mentor) throw new ActionError("Mentor not found");
		const mentorEmail = mentor.email;
		const hosting = await selectBookingCalendarHost(mentor);

		const [settingsRow] = await db
			.select()
			.from(mentorBookingSettings)
			.where(eq(mentorBookingSettings.mentor_id, mentor.id))
			.limit(1);
		if (!settingsRow) throw new ActionError("Mentor booking settings missing");
		const settings = settingsRow;

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

		const availabilityWindows = await db
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
			availabilityTemplates: availabilityWindows,
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
		const attemptKey = stableCalendarAttemptKey(
			mentor.id,
			"create",
			startAt.toISOString(),
			parsedInput.mentee_email.toLowerCase(),
		);
		let event: { eventId: string; meetUrl: string };
		try {
			const calendarParams = {
				mentorId: mentor.id,
				mentorEmail,
				menteeEmail: parsedInput.mentee_email,
				summary: `4HerFrika: ${parsedInput.mentee_name} ↔ ${mentor.name}`,
				description: `Purpose: ${parsedInput.purpose}\n\nMentee: ${parsedInput.mentee_name} <${parsedInput.mentee_email}>`,
				startAtUtc: startAt,
				endAtUtc: endAt,
				attemptKey,
				...(hosting.mode === "mentor_google"
					? {
							connection: hosting.connection,
							accessToken: hosting.accessToken,
						}
					: {}),
			};
			event =
				hosting.mode === "mentor_google"
					? await createMentorCalendarEvent(calendarParams)
					: await createOrgGoogleCalendarEvent(calendarParams);
		} catch (error) {
			throw calendarActionError(error);
		}
		const eventId = event.eventId;
		const meetUrl = event.meetUrl;

		// Insert booking inside a transaction. The Google Meet event already exists at
		// this point — if the insert fails we compensate by deleting it so we don't
		// leak orphaned calendar events.
		let booking: typeof bookings.$inferSelect;
		try {
			booking = await db.transaction(async (tx) => {
				const [row] = await tx
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
						hosting_mode: hosting.mode,
					})
					.returning();
				return row;
			});
		} catch (error) {
			console.error("[booking-insert-failed]", {
				errorType: error instanceof Error ? error.name : typeof error,
			});
			if (hosting.mode === "mentor_google") {
				await deleteMentorCalendarEvent({
					mentorId: mentor.id,
					mentorEmail,
					eventId,
					expectedAttemptKey: attemptKey,
				}).catch(() => undefined);
			} else {
				await deleteOrgGoogleCalendarEvent({ eventId }).catch(() => undefined);
			}
			throw new ActionError(
				"Booking could not be saved. Please retry or contact support for calendar resolution.",
			);
		}

		// Side effects — best-effort emails
		const manageToken = signBookingToken({
			bookingId: booking.id,
			action: "manage",
			expiresAt: startAt.getTime(),
		});
		const manageUrl = `${siteUrl()}/bookings/${manageToken}`;
		const mentorTz = availabilityWindows[0]?.timezone ?? "UTC";
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
			await db.transaction(async (tx) => {
				await tx
					.update(bookings)
					.set({ confirmation_sent_at: new Date() })
					.where(eq(bookings.id, booking.id));
			});
		} catch {
			console.error("[booking] confirmation_email_failed");
		}

		revalidatePath(`/careercorner/${mentor.slug}`);
		return { bookingId: booking.id, manageUrl };
	});
