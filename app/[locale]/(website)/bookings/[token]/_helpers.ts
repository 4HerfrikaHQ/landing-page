import { computeSlots } from "@/app/[locale]/(website)/careers-corner/[slug]/_helpers";
import { db } from "@/src/db";
import { availability } from "@/src/db/schema/tables/availability";
import {
	type BookingHostingMode,
	bookings,
} from "@/src/db/schema/tables/bookings";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { selectBookingCalendarProvider } from "@/src/lib/booking-calendar-host";
import {
	createMentorCalendarEvent,
	deleteMentorCalendarEvent,
	replaceMentorCalendarEvent,
	stableCalendarAttemptKey,
} from "@/src/lib/google-calendar";
import {
	createOrgGoogleCalendarEvent,
	deleteOrgGoogleCalendarEvent,
} from "@/src/lib/org-google-calendar";
import { ActionError } from "@/src/lib/safe-action";
import { formatInTimeZone } from "date-fns-tz";
import { and, eq, gte, lt, ne } from "drizzle-orm";
import { Resend } from "resend";

const FROM = "4herfrika <hello@4herfrika.org>";

export function fmt(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "EEEE, MMM d, yyyy 'at' HH:mm zzz");
}

export function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
}

/** Loads booking + mentor (+mentor user) after the action token is verified. */
export async function loadRescheduleContext(bookingId: string) {
	const [booking] = await db
		.select()
		.from(bookings)
		.where(eq(bookings.id, bookingId))
		.limit(1);
	if (!booking || booking.status === "cancelled") {
		throw new ActionError("Booking not active");
	}

	const [mentorRow] = await db
		.select({ mentor: mentors, user: users })
		.from(mentors)
		.leftJoin(users, eq(users.id, mentors.user_id))
		.where(eq(mentors.id, booking.mentor_id))
		.limit(1);
	const mentor = mentorRow?.mentor;
	const mentorUser = mentorRow?.user;
	if (!mentor) throw new ActionError("Mentor missing");
	if (!mentorUser?.email) throw new ActionError("Mentor email missing");
	const mentorEmail = mentorUser.email;

	const [settingsRow] = await db
		.select()
		.from(mentorBookingSettings)
		.where(eq(mentorBookingSettings.mentor_id, mentor.id))
		.limit(1);
	if (!settingsRow) throw new ActionError("Mentor booking settings missing");
	const settings = settingsRow;

	return { booking, mentor, mentorUser, mentorEmail, settings };
}

/** Throws if the requested new slot isn't a valid available slot for the mentor. */
export async function validateNewSlot(params: {
	mentorId: string;
	bookingId: string;
	newStartUtc: Date;
}) {
	const { mentorId, bookingId, newStartUtc } = params;

	const dayStart = new Date(newStartUtc);
	dayStart.setUTCHours(0, 0, 0, 0);
	const dayEnd = new Date(dayStart);
	dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

	const templates = await db
		.select()
		.from(availability)
		.where(eq(availability.mentor_id, mentorId));
	const existing = await db
		.select({ startUtc: bookings.start_at, endUtc: bookings.end_at })
		.from(bookings)
		.where(
			and(
				eq(bookings.mentor_id, mentorId),
				ne(bookings.status, "cancelled"),
				ne(bookings.id, bookingId),
				gte(bookings.start_at, dayStart),
				lt(bookings.start_at, dayEnd),
			),
		);

	const [settingsRow] = await db
		.select()
		.from(mentorBookingSettings)
		.where(eq(mentorBookingSettings.mentor_id, mentorId))
		.limit(1);
	if (!settingsRow) throw new ActionError("Mentor booking settings missing");
	const settings = settingsRow;

	const slots = computeSlots({
		availabilityTemplates: templates,
		existingBookings: existing,
		settings,
		fromUtc: dayStart,
		toUtc: dayEnd,
		now: new Date(),
	});

	if (!slots.some((s) => s.startUtc === newStartUtc.toISOString())) {
		throw new ActionError("That slot is not available.");
	}

	return { mentorTimezone: templates[0]?.timezone ?? "UTC" };
}

/**
 * Creates the replacement first, then removes the old event. The stable
 * attempt key makes a retry reconcile to the same replacement instead of
 * inserting another Calendar event.
 */
export async function swapMeetEvent(params: {
	mentorId: string;
	oldEventId: string;
	summary: string;
	description: string;
	startAtUtc: Date;
	endAtUtc: Date;
	mentorEmail: string;
	menteeEmail: string;
	attemptKey: string;
	expectedOldAttemptKey: string;
	hostingMode: BookingHostingMode;
}) {
	const calendarParams = {
		oldEventId: params.oldEventId,
		mentorId: params.mentorId,
		summary: params.summary,
		description: params.description,
		startAtUtc: params.startAtUtc,
		endAtUtc: params.endAtUtc,
		mentorEmail: params.mentorEmail,
		menteeEmail: params.menteeEmail,
		attemptKey: params.attemptKey,
		expectedOldAttemptKey: params.expectedOldAttemptKey,
	};
	const provider = selectBookingCalendarProvider(params.hostingMode, {
		mentor_google: {
			createMentorCalendarEvent,
			deleteMentorCalendarEvent,
		},
		org_google: {
			createMentorCalendarEvent: createOrgGoogleCalendarEvent,
			deleteMentorCalendarEvent: async ({ eventId }: { eventId: string }) =>
				deleteOrgGoogleCalendarEvent({ eventId }),
		},
	});
	return replaceMentorCalendarEvent(calendarParams, provider);
}

export { stableCalendarAttemptKey };

/** Cancellation email fan-out (mentee + mentor). */
export async function sendCancellationEmails(params: {
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
