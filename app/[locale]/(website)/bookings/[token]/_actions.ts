"use server";

import {
	deleteMeetEvent,
	sendBookingConfirmationMentee,
	sendBookingConfirmationMentor,
} from "@/app/[locale]/(website)/careers-corner/[slug]/_actions";
import { buildBookingIcs } from "@/app/[locale]/(website)/careers-corner/[slug]/_helpers";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { signBookingToken, verifyBookingToken } from "@/src/lib/booking-tokens";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
	loadRescheduleContext,
	sendCancellationEmails,
	siteUrl,
	swapMeetEvent,
	validateNewSlot,
} from "./_helpers";
import { CancelBookingSchema, RescheduleBookingSchema } from "./_schema";

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

		const [mentorRow] = await db
			.select({ mentor: mentors, user: users })
			.from(mentors)
			.leftJoin(users, eq(users.id, mentors.user_id))
			.where(eq(mentors.id, booking.mentor_id))
			.limit(1);
		const mentor = mentorRow?.mentor;
		const mentorUser = mentorRow?.user ?? undefined;

		try {
			await deleteMeetEvent(booking.google_event_id);
		} catch (e) {
			console.warn("[cancel] google delete failed", e);
		}

		await db.transaction(async (tx) => {
			await tx
				.update(bookings)
				.set({
					status: "cancelled",
					cancel_reason: parsedInput.reason ?? null,
					cancelled_at: new Date(),
				})
				.where(eq(bookings.id, booking.id));
		});

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
		const { booking, mentor, mentorUser, settings } =
			await loadRescheduleContext(parsedInput.token);

		const newStart = new Date(parsedInput.newStartAtUtc);
		const newEnd = new Date(
			newStart.getTime() + settings.session_duration_minutes * 60_000,
		);

		const { mentorTimezone } = await validateNewSlot({
			mentorId: mentor.id,
			bookingId: booking.id,
			newStartUtc: newStart,
		});

		const { eventId, meetUrl } = await swapMeetEvent({
			oldEventId: booking.google_event_id,
			summary: `4HerFrika: ${booking.mentee_name} ↔ ${mentor.name}`,
			description: `Purpose: ${booking.purpose}`,
			startAtUtc: newStart,
			endAtUtc: newEnd,
			mentorEmail: mentorUser.email!,
			menteeEmail: booking.mentee_email,
		});

		await db.transaction(async (tx) => {
			await tx
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
		});

		const manageToken = signBookingToken({
			bookingId: booking.id,
			action: "manage",
			expiresAt: newStart.getTime(),
		});
		const ics = buildBookingIcs({
			uid: booking.id,
			method: "REQUEST",
			summary: `4HerFrika mentorship with ${mentor.name}`,
			description: booking.purpose,
			startAtUtc: newStart,
			endAtUtc: newEnd,
			meetUrl,
			mentorName: mentor.name,
			mentorEmail: mentorUser.email!,
			menteeName: booking.mentee_name,
			menteeEmail: booking.mentee_email,
		});

		await Promise.all([
			sendBookingConfirmationMentee({
				mentorName: mentor.name,
				mentorEmail: mentorUser.email!,
				menteeName: booking.mentee_name,
				menteeEmail: booking.mentee_email,
				startAtUtc: newStart,
				endAtUtc: newEnd,
				meetUrl,
				menteeTimezone: booking.mentee_timezone,
				mentorTimezone,
				purpose: booking.purpose,
				icsAttachment: ics,
				manageUrl: `${siteUrl()}/bookings/${manageToken}`,
				sessionDurationMinutes: settings.session_duration_minutes,
			}),
			sendBookingConfirmationMentor({
				mentorName: mentor.name,
				mentorEmail: mentorUser.email!,
				menteeName: booking.mentee_name,
				menteeEmail: booking.mentee_email,
				startAtUtc: newStart,
				endAtUtc: newEnd,
				meetUrl,
				menteeTimezone: booking.mentee_timezone,
				mentorTimezone,
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
