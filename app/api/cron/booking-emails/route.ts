/**
 * Booking reminder cron handler.
 *
 * Schedule lives in Supabase `pg_cron` (the hobby Vercel tier blocks
 * sub-daily crons). Supabase pings this endpoint every 15 minutes with
 * `Authorization: Bearer ${CRON_SECRET}`.
 */

import { timingSafeEqual } from "node:crypto";
import { db } from "@/src/db";
import { availability } from "@/src/db/schema/tables/availability";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { createActionLink } from "@/src/lib/action-links";
import { formatInTimeZone } from "date-fns-tz";
import { and, eq, gte, isNull, lt, lte, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const FROM =
	process.env.RESEND_FROM_HEADER ?? "4HerFrika <bookings@4herfrika.org>";
const MAX_BACKLOG_AGE_MS = 14 * 24 * 3600_000;
const AFTER_CALL_EMAIL_DELAY_MS = 5 * 60_000;

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
	const cronSecret = process.env.CRON_SECRET;
	const authorization = req.headers.get("authorization");
	if (!cronSecret || !isAuthorized(authorization, cronSecret)) {
		return NextResponse.json({ ok: false }, { status: 401 });
	}
	if (!process.env.RESEND_API_KEY) {
		console.error("[booking-cron] RESEND_API_KEY is not configured");
		return NextResponse.json(
			{ ok: false, error: "Email service unavailable" },
			{ status: 503 },
		);
	}

	const runtime = Date.now();
	const resend = new Resend(process.env.RESEND_API_KEY);
	const counts = {
		reminder24h: 0,
		reminder1h: 0,
		feedback: 0,
		mentorFollowup: 0,
	};
	const errors: Array<{ job: string; bookingId: string }> = [];
	const startedAt = Date.now();
	console.info("[booking-cron] run started", {
		runtime: new Date(runtime).toISOString(),
	});
	const context = { resend, runtime, counts, errors };

	await Promise.all([
		runLoggedJob("reminder24h", () => run24HourReminderJob(context)),
		runLoggedJob("reminder1h", () => run1HourReminderJob(context)),
		runLoggedJob("feedback", () => runFeedbackRequestJob(context)),
		runLoggedJob("mentorFollowup", () => runMentorFollowupJob(context)),
	]);

	console.info("[booking-cron] run completed", {
		counts,
		failed: errors.length,
		durationMs: Date.now() - startedAt,
	});

	return NextResponse.json(
		{ ok: errors.length === 0, counts, errors },
		{ status: errors.length === 0 ? 200 : 500 },
	);
}

type JobContext = {
	resend: Resend;
	runtime: number;
	counts: {
		reminder24h: number;
		reminder1h: number;
		feedback: number;
		mentorFollowup: number;
	};
	errors: Array<{ job: string; bookingId: string }>;
};

async function run24HourReminderJob({
	resend,
	runtime,
	counts,
	errors,
}: JobContext) {
	const lower = new Date(runtime + 23 * 3600_000);
	const upper = new Date(runtime + 25 * 3600_000);
	const rows = await loadDueBookings("reminder_24h_sent_at", lower, upper);
	for (const b of rows) {
		const claimedAt = await claim(b.id, "reminder_24h_sent_at");
		if (!claimedAt) continue;
		try {
			const manageToken = await createActionLink({
				resourceId: b.id,
				action: "manage",
				expiresAt: b.start_at,
			});
			await sendEmail(resend, {
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
			counts.reminder24h += 1;
		} catch (error) {
			await release(b.id, "reminder_24h_sent_at", claimedAt);
			recordError(errors, "reminder24h", b.id, error);
		}
	}
}

async function run1HourReminderJob({
	resend,
	runtime,
	counts,
	errors,
}: JobContext) {
	const lower = new Date(runtime + 45 * 60_000);
	const upper = new Date(runtime + 75 * 60_000);
	const rows = await loadDueBookings("reminder_1h_sent_at", lower, upper);
	for (const b of rows) {
		const claimedAt = await claim(b.id, "reminder_1h_sent_at");
		if (!claimedAt) continue;
		try {
			await Promise.all([
				sendMenteeReminder(resend, b),
				sendMentorReminder(resend, b),
			]);
			counts.reminder1h += 1;
		} catch (error) {
			await release(b.id, "reminder_1h_sent_at", claimedAt);
			recordError(errors, "reminder1h", b.id, error);
		}
	}
}

async function runFeedbackRequestJob({
	resend,
	runtime,
	counts,
	errors,
}: JobContext) {
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
				eq(mentors.archived, false),
				eq(bookings.status, "confirmed"),
				isNull(bookings.feedback_email_sent_at),
				gte(bookings.end_at, new Date(runtime - MAX_BACKLOG_AGE_MS)),
				lt(bookings.end_at, new Date(runtime - AFTER_CALL_EMAIL_DELAY_MS)),
			),
		)
		.limit(100);
	for (const b of rows) {
		const claimedAt = await claim(b.id, "feedback_email_sent_at");
		if (!claimedAt) continue;
		try {
			const token = await createActionLink({
				resourceId: b.id,
				action: "feedback",
				expiresAt: new Date(runtime + 14 * 24 * 3600_000),
			});
			await sendEmail(resend, {
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
				.set({ status: "completed" })
				.where(eq(bookings.id, b.id));
			counts.feedback += 1;
		} catch (error) {
			await release(b.id, "feedback_email_sent_at", claimedAt);
			recordError(errors, "feedback", b.id, error);
		}
	}
}

async function runMentorFollowupJob({
	resend,
	runtime,
	counts,
	errors,
}: JobContext) {
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
				eq(mentors.archived, false),
				ne(bookings.status, "cancelled"),
				isNull(bookings.mentor_followup_sent_at),
				gte(bookings.end_at, new Date(runtime - MAX_BACKLOG_AGE_MS)),
				lt(bookings.end_at, new Date(runtime - AFTER_CALL_EMAIL_DELAY_MS)),
			),
		)
		.limit(100);
	for (const b of rows) {
		const claimedAt = await claim(b.id, "mentor_followup_sent_at");
		if (!claimedAt) continue;
		if (!b.mentorEmail) continue;
		try {
			await sendEmail(resend, {
				from: FROM,
				to: b.mentorEmail,
				subject: `Follow-up: your call with ${b.mentee_name}`,
				text: `Hi ${b.mentorName},

Thanks again for showing up. If there's anything you wanted to follow up with ${b.mentee_name} about, now's a good time. You can see your past sessions in your dashboard.

— 4HerFrika`,
			});
			counts.mentorFollowup += 1;
		} catch (error) {
			await release(b.id, "mentor_followup_sent_at", claimedAt);
			recordError(errors, "mentorFollowup", b.id, error);
		}
	}
}

async function runLoggedJob(job: string, run: () => Promise<void>) {
	const startedAt = Date.now();
	console.info("[booking-cron] job started", { job });
	try {
		await run();
		console.info("[booking-cron] job completed", {
			job,
			durationMs: Date.now() - startedAt,
		});
	} catch (error) {
		console.error("[booking-cron] job crashed", {
			job,
			durationMs: Date.now() - startedAt,
			error,
		});
		throw error;
	}
}

function isAuthorized(authorization: string | null, secret: string): boolean {
	if (!authorization) return false;
	const expected = Buffer.from(`Bearer ${secret}`);
	const actual = Buffer.from(authorization);
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

type SentAtField =
	| "reminder_24h_sent_at"
	| "reminder_1h_sent_at"
	| "feedback_email_sent_at"
	| "mentor_followup_sent_at";

function sentAtColumn(field: SentAtField) {
	return bookings[field];
}

async function claim(
	bookingId: string,
	field: SentAtField,
): Promise<Date | null> {
	const claimedAt = new Date();
	const [row] = await db
		.update(bookings)
		.set({ [field]: claimedAt })
		.where(and(eq(bookings.id, bookingId), isNull(sentAtColumn(field))))
		.returning({ id: bookings.id });
	return row ? claimedAt : null;
}

async function release(bookingId: string, field: SentAtField, claimedAt: Date) {
	await db
		.update(bookings)
		.set({ [field]: null })
		.where(and(eq(bookings.id, bookingId), eq(sentAtColumn(field), claimedAt)));
}

function recordError(
	errors: Array<{ job: string; bookingId: string }>,
	job: string,
	bookingId: string,
	error: unknown,
) {
	console.error("[booking-cron] job failed", { job, bookingId, error });
	errors.push({ job, bookingId });
}

async function sendEmail(
	resend: Resend,
	payload: Parameters<Resend["emails"]["send"]>[0],
) {
	const result = await resend.emails.send(payload);
	if (result.error) throw new Error(result.error.message);
}

type DueBooking = Awaited<ReturnType<typeof loadDueBookings>>[number];

async function sendMenteeReminder(resend: Resend, b: DueBooking) {
	if (!b.mentee_email) return;
	await sendEmail(resend, {
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
	await sendEmail(resend, {
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
			mentorTimezone: sql<string | null>`(
				select ${availability.timezone}
				from ${availability}
				where ${availability.mentor_id} = ${mentors.id}
				limit 1
			)`,
		})
		.from(bookings)
		.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
		.innerJoin(users, eq(mentors.user_id, users.id))
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
