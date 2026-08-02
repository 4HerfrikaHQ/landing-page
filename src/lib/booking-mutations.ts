import {
	sendCancellationEmails,
	siteUrl,
	stableCalendarAttemptKey,
	swapMeetEvent,
	validateNewSlot,
} from "@/app/[locale]/(website)/bookings/[token]/_helpers";
import {
	sendBookingConfirmationMentee,
	sendBookingConfirmationMentor,
} from "@/app/[locale]/(website)/careers-corner/[slug]/_actions";
import { buildBookingIcs } from "@/app/[locale]/(website)/careers-corner/[slug]/_helpers";
import { db } from "@/src/db";
import { type DbBooking, bookings } from "@/src/db/schema/tables/bookings";
import { signBookingToken } from "@/src/lib/booking-tokens";
import {
	deleteMentorCalendarEvent,
	isMentorCalendarError,
	mentorCalendarActionMessage,
} from "@/src/lib/google-calendar";
import { ActionError } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function currentCalendarAttemptKey(booking: DbBooking, mentorId: string) {
	return booking.reschedule_count === 0
		? stableCalendarAttemptKey(
				mentorId,
				"create",
				booking.start_at.toISOString(),
				booking.mentee_email.toLowerCase(),
			)
		: stableCalendarAttemptKey(
				booking.id,
				"reschedule",
				String(booking.reschedule_count),
			);
}

function calendarError(error: unknown): ActionError {
	if (error instanceof ActionError) return error;
	return new ActionError(mentorCalendarActionMessage(error));
}

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
	const newEnd = new Date(
		newStartUtc.getTime() + sessionDurationMinutes * 60_000,
	);
	const { mentorTimezone } = await validateNewSlot({
		mentorId,
		bookingId: booking.id,
		newStartUtc,
	});

	let event: { eventId: string; meetUrl: string };
	try {
		event = await swapMeetEvent({
			mentorId,
			oldEventId: booking.google_event_id,
			summary: `4HerFrika: ${booking.mentee_name} ↔ ${mentorName}`,
			description: `Purpose: ${booking.purpose}`,
			startAtUtc: newStartUtc,
			endAtUtc: newEnd,
			mentorEmail,
			menteeEmail: booking.mentee_email,
			attemptKey: stableCalendarAttemptKey(
				booking.id,
				"reschedule",
				String(booking.reschedule_count + 1),
			),
			expectedOldAttemptKey: currentCalendarAttemptKey(booking, mentorId),
		});
	} catch (error) {
		throw calendarError(error);
	}

	try {
		await db
			.update(bookings)
			.set({
				start_at: newStartUtc,
				end_at: newEnd,
				meet_url: event.meetUrl,
				google_event_id: event.eventId,
				reschedule_count: booking.reschedule_count + 1,
				updated_at: new Date(),
				reminder_24h_sent_at: null,
				reminder_1h_sent_at: null,
			})
			.where(eq(bookings.id, booking.id));
	} catch (error) {
		console.error("[booking-reschedule-db-update-failed]", {
			errorType: error instanceof Error ? error.name : typeof error,
		});
		throw new ActionError(
			"The calendar changed, but the booking could not be saved. Please contact support for manual resolution.",
		);
	}

	const manageToken = signBookingToken({
		bookingId: booking.id,
		action: "manage",
		expiresAt: newStartUtc.getTime(),
	});
	const ics = buildBookingIcs({
		uid: booking.id,
		method: "REQUEST",
		summary: `4HerFrika mentorship with ${mentorName}`,
		description: booking.purpose,
		startAtUtc: newStartUtc,
		endAtUtc: newEnd,
		meetUrl: event.meetUrl,
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
			startAtUtc: newStartUtc,
			endAtUtc: newEnd,
			meetUrl: event.meetUrl,
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
			startAtUtc: newStartUtc,
			endAtUtc: newEnd,
			meetUrl: event.meetUrl,
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
	return { startAt: newStartUtc, endAt: newEnd };
}

export async function cancelBookingCore(params: {
	booking: DbBooking;
	mentorName: string;
	mentorSlug: string;
	mentorEmail?: string;
	reason?: string;
}): Promise<void> {
	const { booking, mentorName, mentorSlug, mentorEmail, reason } = params;
	if (booking.status === "cancelled") return;
	if (!mentorEmail)
		throw new ActionError(
			"Cancellation is unavailable until the mentor calendar is connected.",
		);

	try {
		await deleteMentorCalendarEvent({
			mentorId: booking.mentor_id,
			mentorEmail,
			eventId: booking.google_event_id,
			expectedAttemptKey: currentCalendarAttemptKey(booking, booking.mentor_id),
		});
	} catch (error) {
		if (isMentorCalendarError(error) && error.code === "remote_error") {
			throw new ActionError(
				"The calendar event could not be removed. Please reconnect the mentor calendar or contact support.",
			);
		}
		throw calendarError(error);
	}

	try {
		await db
			.update(bookings)
			.set({
				status: "cancelled",
				cancel_reason: reason ?? null,
				cancelled_at: new Date(),
			})
			.where(eq(bookings.id, booking.id));
	} catch (error) {
		console.error("[booking-cancel-db-update-failed]", {
			errorType: error instanceof Error ? error.name : typeof error,
		});
		throw new ActionError(
			"The calendar event was removed, but the booking could not be updated. Please contact support for manual resolution.",
		);
	}

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
	revalidatePath(`/careers-corner/${mentorSlug}`);
}
