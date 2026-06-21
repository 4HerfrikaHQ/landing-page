import {
	deleteMeetEvent,
	sendBookingConfirmationMentee,
	sendBookingConfirmationMentor,
} from "@/app/[locale]/(website)/careers-corner/[slug]/_actions";
import { buildBookingIcs } from "@/app/[locale]/(website)/careers-corner/[slug]/_helpers";
import {
	sendCancellationEmails,
	siteUrl,
	swapMeetEvent,
	validateNewSlot,
} from "@/app/[locale]/(website)/bookings/[token]/_helpers";
import { db } from "@/src/db";
import { type DbBooking, bookings } from "@/src/db/schema/tables/bookings";
import { signBookingToken } from "@/src/lib/booking-tokens";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Shared reschedule/cancel cores, decoupled from how the booking was loaded
 * (mentee manage-token flow OR mentor dashboard). Callers authorize + load the
 * booking and mentor, then call these. Per the project rule, Google Calendar and
 * Resend I/O happen OUTSIDE the DB transaction, with the Meet event moved/deleted
 * before the row update so a failed update can be compensated by the caller's
 * surrounding error handling (the original token flow's behavior, preserved).
 */

/**
 * Move a booking to a new time: re-validate the slot, swap the Google Meet event,
 * update the row (start/end, bump reschedule_count, reset reminders), and email
 * both parties. Returns the new start/end.
 */
export async function rescheduleBookingCore(params: {
	booking: DbBooking;
	mentorId: string;
	mentorName: string;
	mentorSlug: string;
	mentorEmail: string;
	sessionDurationMinutes: number;
	newStartUtc: Date;
}): Promise<{ startAt: Date; endAt: Date }> {
	const {
		booking,
		mentorId,
		mentorName,
		mentorSlug,
		mentorEmail,
		sessionDurationMinutes,
		newStartUtc,
	} = params;

	const newStart = newStartUtc;
	const newEnd = new Date(newStart.getTime() + sessionDurationMinutes * 60_000);

	const { mentorTimezone } = await validateNewSlot({
		mentorId,
		bookingId: booking.id,
		newStartUtc: newStart,
	});

	const { eventId, meetUrl } = await swapMeetEvent({
		oldEventId: booking.google_event_id,
		summary: `4HerFrika: ${booking.mentee_name} ↔ ${mentorName}`,
		description: `Purpose: ${booking.purpose}`,
		startAtUtc: newStart,
		endAtUtc: newEnd,
		mentorEmail,
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
		summary: `4HerFrika mentorship with ${mentorName}`,
		description: booking.purpose,
		startAtUtc: newStart,
		endAtUtc: newEnd,
		meetUrl,
		mentorName,
		mentorEmail,
		menteeName: booking.mentee_name,
		menteeEmail: booking.mentee_email,
	});

	await Promise.all([
		sendBookingConfirmationMentee({
			mentorName,
			mentorEmail,
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
			sessionDurationMinutes,
		}),
		sendBookingConfirmationMentor({
			mentorName,
			mentorEmail,
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

	revalidatePath(`/careers-corner/${mentorSlug}`);
	return { startAt: newStart, endAt: newEnd };
}

/**
 * Cancel a booking: delete the Google Meet event, mark the row cancelled, and
 * email both parties a CANCEL `.ics`. No-op if already cancelled.
 */
export async function cancelBookingCore(params: {
	booking: DbBooking;
	mentorName: string;
	mentorSlug: string;
	mentorEmail?: string;
	reason?: string;
}): Promise<void> {
	const { booking, mentorName, mentorSlug, mentorEmail, reason } = params;
	if (booking.status === "cancelled") return;

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
				cancel_reason: reason ?? null,
				cancelled_at: new Date(),
			})
			.where(eq(bookings.id, booking.id));
	});

	if (mentorEmail) {
		const ics = buildBookingIcs({
			uid: booking.id,
			method: "CANCEL",
			summary: `4HerFrika mentorship with ${mentorName}`,
			description: booking.purpose,
			startAtUtc: booking.start_at,
			endAtUtc: booking.end_at,
			meetUrl: booking.meet_url,
			mentorName,
			mentorEmail,
			menteeName: booking.mentee_name,
			menteeEmail: booking.mentee_email,
		});
		await sendCancellationEmails({
			mentorName,
			mentorEmail,
			menteeName: booking.mentee_name,
			menteeEmail: booking.mentee_email,
			startAtUtc: booking.start_at,
			menteeTimezone: booking.mentee_timezone,
			reason,
			icsAttachment: ics,
		});
	}

	revalidatePath(`/careers-corner/${mentorSlug}`);
}
