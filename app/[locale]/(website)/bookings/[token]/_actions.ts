"use server";

import { and, eq, gte, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { formatInTimeZone } from "date-fns-tz";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { availability } from "@/src/db/schema/tables/availability";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { actionClient, ActionError } from "@/src/lib/safe-action";
import {
	signBookingToken,
	verifyBookingToken,
} from "@/src/lib/booking-tokens";
import {
	createMeetEvent,
	deleteMeetEvent,
	sendBookingConfirmationMentee,
	sendBookingConfirmationMentor,
} from "@/app/[locale]/(website)/careers-corner/[slug]/_actions";
import {
	buildBookingIcs,
	computeSlots,
} from "@/app/[locale]/(website)/careers-corner/[slug]/_helpers";
import { CancelBookingSchema, RescheduleBookingSchema } from "./_schema";

const FROM = "4herfrika <hello@4herfrika.org>";

function fmt(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "EEEE, MMM d, yyyy 'at' HH:mm zzz");
}

function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
}

/** Server-only loader for the manage page. Verifies the token and returns the booking. */
export async function loadBookingFromToken(token: string) {
	const verified = verifyBookingToken(token);
	if (!verified.ok || verified.action !== "manage") {
		return {
			ok: false as const,
			reason: verified.ok ? "wrong_action" : verified.reason,
		};
	}
	const [booking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, verified.bookingId))
		.limit(1);
	if (!booking) return { ok: false as const, reason: "not_found" };
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.id, booking.mentor_id))
		.limit(1);
	return { ok: true as const, booking, mentor };
}

async function sendCancellationEmails(params: {
	mentorName: string;
	mentorEmail: string;
	menteeName: string;
	menteeEmail: string;
	startAtUtc: Date;
	menteeTimezone: string;
	reason?: string;
	icsAttachment: string;
}) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	const recipients = [
		{
			email: params.menteeEmail,
			name: params.menteeName,
			tz: params.menteeTimezone,
		},
		{
			email: params.mentorEmail,
			name: params.mentorName,
			tz: params.menteeTimezone,
		},
	];
	await Promise.all(
		recipients.map((r) =>
			resend.emails.send({
				from: FROM,
				to: r.email,
				subject: `Cancelled: call on ${fmt(params.startAtUtc, r.tz)}`,
				text: `Hi ${r.name},

The call on ${fmt(params.startAtUtc, r.tz)} has been cancelled.${params.reason ? `\n\nReason: ${params.reason}` : ""}

— 4HerFrika`,
				attachments: [
					{
						filename: "cancel.ics",
						content: Buffer.from(params.icsAttachment).toString("base64"),
					},
				],
			}),
		),
	);
}

export const cancelBooking = actionClient
	.schema(CancelBookingSchema)
	.action(async ({ parsedInput }) => {
		const verified = verifyBookingToken(parsedInput.token);
		if (!verified.ok || verified.action !== "manage") {
			throw new ActionError("Invalid link");
		}

		const [booking] = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, verified.bookingId))
			.limit(1);
		if (!booking) throw new ActionError("Booking not found");
		if (booking.status === "cancelled") return { ok: true };

		const [mentor] = await db
			.select()
			.from(mentors)
			.where(eq(mentors.id, booking.mentor_id))
			.limit(1);
		const mentorUser = mentor
			? (
					await db
						.select()
						.from(users)
						.where(eq(users.id, mentor.user_id))
						.limit(1)
				)[0]
			: undefined;

		try {
			await deleteMeetEvent(booking.google_event_id);
		} catch (e) {
			console.warn("[cancel] google delete failed", e);
		}

		await db
			.update(bookings)
			.set({
				status: "cancelled",
				cancel_reason: parsedInput.reason ?? null,
				cancelled_at: new Date(),
			})
			.where(eq(bookings.id, booking.id));

		if (mentor && mentorUser?.email) {
			const ics = buildBookingIcs({
				uid: booking.id,
				method: "CANCEL",
				summary: `4HerFrika mentorship with ${mentor.name}`,
				description: booking.purpose,
				startAtUtc: booking.start_at,
				endAtUtc: booking.end_at,
				meetUrl: booking.meet_url,
				mentorName: mentor.name,
				mentorEmail: mentorUser.email,
				menteeName: booking.mentee_name,
				menteeEmail: booking.mentee_email,
			});
			await sendCancellationEmails({
				mentorName: mentor.name,
				mentorEmail: mentorUser.email,
				menteeName: booking.mentee_name,
				menteeEmail: booking.mentee_email,
				startAtUtc: booking.start_at,
				menteeTimezone: booking.mentee_timezone,
				reason: parsedInput.reason,
				icsAttachment: ics,
			});
		}

		if (mentor) revalidatePath(`/careers-corner/${mentor.slug}`);
		return { ok: true };
	});

export const rescheduleBooking = actionClient
	.schema(RescheduleBookingSchema)
	.action(async ({ parsedInput }) => {
		const verified = verifyBookingToken(parsedInput.token);
		if (!verified.ok || verified.action !== "manage") {
			throw new ActionError("Invalid link");
		}

		const [booking] = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, verified.bookingId))
			.limit(1);
		if (!booking || booking.status === "cancelled") {
			throw new ActionError("Booking not active");
		}

		const [mentor] = await db
			.select()
			.from(mentors)
			.where(eq(mentors.id, booking.mentor_id))
			.limit(1);
		if (!mentor) throw new ActionError("Mentor missing");

		const [mentorUser] = await db
			.select()
			.from(users)
			.where(eq(users.id, mentor.user_id))
			.limit(1);
		if (!mentorUser?.email) throw new ActionError("Mentor email missing");

		const [settings] = await db
			.select()
			.from(mentorBookingSettings)
			.where(eq(mentorBookingSettings.mentor_id, mentor.id))
			.limit(1);
		if (!settings) throw new ActionError("Settings missing");

		const newStart = new Date(parsedInput.newStartAtUtc);
		const newEnd = new Date(
			newStart.getTime() + settings.session_duration_minutes * 60_000,
		);

		const dayStart = new Date(newStart);
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
					ne(bookings.id, booking.id),
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
		if (!slots.some((s) => s.startUtc === newStart.toISOString())) {
			throw new ActionError("That slot is not available.");
		}

		try {
			await deleteMeetEvent(booking.google_event_id);
		} catch (e) {
			console.warn("[reschedule] google delete failed", e);
		}

		const { eventId, meetUrl } = await createMeetEvent({
			summary: `4HerFrika: ${booking.mentee_name} ↔ ${mentor.name}`,
			description: `Purpose: ${booking.purpose}`,
			startAtUtc: newStart,
			endAtUtc: newEnd,
			mentorEmail: mentorUser.email,
			menteeEmail: booking.mentee_email,
		});

		await db
			.update(bookings)
			.set({
				start_at: newStart,
				end_at: newEnd,
				meet_url: meetUrl,
				google_event_id: eventId,
				reschedule_count: booking.reschedule_count + 1,
				updated_at: new Date(),
				reminder_24h_sent_at: null,
				reminder_1h_sent_at: null,
			})
			.where(eq(bookings.id, booking.id));

		const manageToken = signBookingToken({
			bookingId: booking.id,
			action: "manage",
			expiresAt: newStart.getTime(),
		});
		const mentorTz = templates[0]?.timezone ?? "UTC";
		const ics = buildBookingIcs({
			uid: booking.id,
			method: "REQUEST",
			summary: `4HerFrika mentorship with ${mentor.name}`,
			description: booking.purpose,
			startAtUtc: newStart,
			endAtUtc: newEnd,
			meetUrl,
			mentorName: mentor.name,
			mentorEmail: mentorUser.email,
			menteeName: booking.mentee_name,
			menteeEmail: booking.mentee_email,
		});

		await Promise.all([
			sendBookingConfirmationMentee({
				mentorName: mentor.name,
				mentorEmail: mentorUser.email,
				menteeName: booking.mentee_name,
				menteeEmail: booking.mentee_email,
				startAtUtc: newStart,
				endAtUtc: newEnd,
				meetUrl,
				menteeTimezone: booking.mentee_timezone,
				mentorTimezone: mentorTz,
				purpose: booking.purpose,
				icsAttachment: ics,
				manageUrl: `${siteUrl()}/bookings/${manageToken}`,
			}),
			sendBookingConfirmationMentor({
				mentorName: mentor.name,
				mentorEmail: mentorUser.email,
				menteeName: booking.mentee_name,
				menteeEmail: booking.mentee_email,
				startAtUtc: newStart,
				endAtUtc: newEnd,
				meetUrl,
				menteeTimezone: booking.mentee_timezone,
				mentorTimezone: mentorTz,
				purpose: booking.purpose,
				icsAttachment: ics,
				intake: {
					Phone: booking.mentee_phone,
					LinkedIn: booking.mentee_linkedin,
					Country: booking.mentee_country,
					Gender: booking.mentee_gender,
					"Career stage": booking.mentee_career_stage,
				},
			}),
		]);

		revalidatePath(`/careers-corner/${mentor.slug}`);
		return { ok: true };
	});
