/**
 * Booking reminder cron handler.
 *
 * Schedule lives in Supabase `pg_cron` (the hobby Vercel tier blocks
 * sub-daily crons). Supabase pings this endpoint every 5 minutes with
 * `Authorization: Bearer ${CRON_SECRET}`.
 */

import { db } from "@/src/db";
import { availability } from "@/src/db/schema/tables/availability";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { signBookingToken } from "@/src/lib/booking-tokens";
import { formatInTimeZone } from "date-fns-tz";
import { and, eq, gte, isNull, lt, lte, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FROM = "4herfrika <hello@4herfrika.org>";

function fmt(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "EEEE, MMM d, yyyy 'at' HH:mm zzz");
}

// Joining with the invited address skips Google's admit screen — recommend it
// as the smooth path (kept in sync with the confirmation emails' wording).
function joinTip(email: string): string {
	return `Tip: for the smoothest entry, join with this email (${email}).`;
}

function siteUrl(): string {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
}

export async function GET(req: Request) {
	if (
		req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
	) {
		return NextResponse.json({ ok: false }, { status: 401 });
	}

	const now = Date.now();
	const resend = new Resend(process.env.RESEND_API_KEY);
	const counts = {
		reminder24h: 0,
		reminder1h: 0,
		feedback: 0,
		mentorFollowup: 0,
	};

	// --- 24h reminder (mentee only) ---
	{
		const lower = new Date(now + 23 * 3600_000);
		const upper = new Date(now + 25 * 3600_000);
		const rows = await loadDueBookings("reminder_24h_sent_at", lower, upper);
		for (const b of rows) {
			const manageToken = signBookingToken({
				bookingId: b.id,
				action: "manage",
				expiresAt: b.start_at.getTime(),
			});
			await resend.emails.send({
				from: FROM,
				to: b.mentee_email,
				subject: `Tomorrow: your call with ${b.mentorName}`,
				text: `Hi ${b.mentee_name},

Quick reminder — your call with ${b.mentorName} is tomorrow at ${fmt(b.start_at, b.mentee_timezone)}.

Join: ${b.meet_url}
${joinTip(b.mentee_email)}
Need to reschedule? ${siteUrl()}/bookings/${manageToken}

— 4HerFrika`,
			});
			await db
				.update(bookings)
				.set({ reminder_24h_sent_at: new Date() })
				.where(eq(bookings.id, b.id));
			counts.reminder24h += 1;
		}
	}

	// --- 1h reminder (both) ---
	{
		const lower = new Date(now + 45 * 60_000);
		const upper = new Date(now + 75 * 60_000);
		const rows = await loadDueBookings("reminder_1h_sent_at", lower, upper);
		for (const b of rows) {
			await Promise.all([
				sendMenteeReminder(resend, b),
				sendMentorReminder(resend, b),
			]);
			await db
				.update(bookings)
				.set({ reminder_1h_sent_at: new Date() })
				.where(eq(bookings.id, b.id));
			counts.reminder1h += 1;
		}
	}

	// --- Feedback request (mentee) ---
	{
		const rows = await db
			.select({
				id: bookings.id,
				mentee_name: bookings.mentee_name,
				mentee_email: bookings.mentee_email,
				mentorName: users.name,
			})
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.innerJoin(users, eq(mentors.user_id, users.id))
			.where(
				and(
					eq(bookings.status, "confirmed"),
					isNull(bookings.feedback_email_sent_at),
					lt(bookings.end_at, new Date(now - 30 * 60_000)),
				),
			)
			.limit(100);
		for (const b of rows) {
			const token = signBookingToken({
				bookingId: b.id,
				action: "feedback",
				expiresAt: now + 14 * 24 * 3600_000,
			});
			await resend.emails.send({
				from: FROM,
				to: b.mentee_email,
				subject: `How was your call with ${b.mentorName}?`,
				text: `Hi ${b.mentee_name},

Thanks for booking with 4HerFrika. Would you take a minute to share how the call went?

${siteUrl()}/bookings/${token}/feedback

— 4HerFrika`,
			});
			await db
				.update(bookings)
				.set({
					feedback_email_sent_at: new Date(),
					status: "completed",
				})
				.where(eq(bookings.id, b.id));
			counts.feedback += 1;
		}
	}

	// --- Mentor follow-up ---
	{
		const rows = await db
			.select({
				id: bookings.id,
				mentee_name: bookings.mentee_name,
				mentorName: users.name,
				mentorEmail: users.email,
			})
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.innerJoin(users, eq(mentors.user_id, users.id))
			.where(
				and(
					ne(bookings.status, "cancelled"),
					isNull(bookings.mentor_followup_sent_at),
					lt(bookings.end_at, new Date(now - 2 * 3600_000)),
				),
			)
			.limit(100);
		for (const b of rows) {
			if (!b.mentorEmail) continue;
			await resend.emails.send({
				from: FROM,
				to: b.mentorEmail,
				subject: `Follow-up: your call with ${b.mentee_name}`,
				text: `Hi ${b.mentorName},

Thanks again for showing up. If there's anything you wanted to follow up with ${b.mentee_name} about, now's a good time. You can see your past sessions in your dashboard.

— 4HerFrika`,
			});
			await db
				.update(bookings)
				.set({ mentor_followup_sent_at: new Date() })
				.where(eq(bookings.id, b.id));
			counts.mentorFollowup += 1;
		}
	}

	return NextResponse.json({ ok: true, counts });
}

type DueBooking = Awaited<ReturnType<typeof loadDueBookings>>[number];

async function sendMenteeReminder(resend: Resend, b: DueBooking) {
	if (!b.mentee_email) return;
	await resend.emails.send({
		from: FROM,
		to: b.mentee_email,
		subject: `Starting soon: your call with ${b.mentorName}`,
		text: `Hi ${b.mentee_name},

Your call starts at ${fmt(b.start_at, b.mentee_timezone)}. Join here: ${b.meet_url}
${joinTip(b.mentee_email)}

— 4HerFrika`,
	});
}

async function sendMentorReminder(resend: Resend, b: DueBooking) {
	if (!b.mentorEmail) return;
	await resend.emails.send({
		from: FROM,
		to: b.mentorEmail,
		subject: `In ~1 hour: call with ${b.mentee_name}`,
		text: `Hi ${b.mentorName},

Your call with ${b.mentee_name} starts at ${fmt(b.start_at, b.mentorTimezone ?? b.mentee_timezone)}. Join here: ${b.meet_url}
${joinTip(b.mentorEmail)}

— 4HerFrika`,
	});
}

async function loadDueBookings(
	field: "reminder_24h_sent_at" | "reminder_1h_sent_at",
	lower: Date,
	upper: Date,
) {
	const sentAtCol =
		field === "reminder_24h_sent_at"
			? bookings.reminder_24h_sent_at
			: bookings.reminder_1h_sent_at;
	return db
		.select({
			id: bookings.id,
			mentee_name: bookings.mentee_name,
			mentee_email: bookings.mentee_email,
			mentee_timezone: bookings.mentee_timezone,
			start_at: bookings.start_at,
			end_at: bookings.end_at,
			meet_url: bookings.meet_url,
			mentorName: users.name,
			mentorEmail: users.email,
			mentorTimezone: availability.timezone,
		})
		.from(bookings)
		.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
		.innerJoin(users, eq(mentors.user_id, users.id))
		.leftJoin(availability, eq(availability.mentor_id, mentors.id))
		.where(
			and(
				eq(bookings.status, "confirmed"),
				isNull(sentAtCol),
				gte(bookings.start_at, lower),
				lte(bookings.start_at, upper),
			),
		)
		.limit(100);
}
