"use server";

import { currentDbMentor } from "@/src/auth";
import { db } from "@/src/db";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import { bookings } from "@/src/db/schema/tables/bookings";
import { and, eq, gte, sql } from "drizzle-orm";

import { RANGE_DAYS, type StatsRange } from "./_schema";

function loadMentorBookingCounts(mentorId: string, since: Date | null) {
	const rangeFilter = since
		? and(eq(bookings.mentor_id, mentorId), gte(bookings.created_at, since))
		: eq(bookings.mentor_id, mentorId);

	return db
		.select({
			total: sql<number>`count(*)::int`,
			confirmed: sql<number>`count(*) filter (where ${bookings.status} = 'confirmed')::int`,
			completed: sql<number>`count(*) filter (where ${bookings.status} = 'completed')::int`,
			noShow: sql<number>`count(*) filter (where ${bookings.status} = 'no_show')::int`,
			cancelled: sql<number>`count(*) filter (where ${bookings.status} = 'cancelled')::int`,
		})
		.from(bookings)
		.where(rangeFilter);
}

function loadMentorBookingRating(mentorId: string, since: Date | null) {
	return db
		.select({
			avg: sql<number>`coalesce(avg(${bookingFeedback.rating}), 0)::float`,
		})
		.from(bookingFeedback)
		.innerJoin(bookings, eq(bookings.id, bookingFeedback.booking_id))
		.where(
			since
				? and(
						eq(bookings.mentor_id, mentorId),
						gte(bookings.created_at, since),
					)
				: eq(bookings.mentor_id, mentorId),
		);
}

function loadMentorBookingSeries(mentorId: string, since: Date | null) {
	const rangeFilter = since
		? and(eq(bookings.mentor_id, mentorId), gte(bookings.created_at, since))
		: eq(bookings.mentor_id, mentorId);

	return db
		.select({
			bucket: sql<string>`to_char(date_trunc('week', ${bookings.created_at}), 'YYYY-MM-DD')`,
			count: sql<number>`count(*)::int`,
		})
		.from(bookings)
		.where(rangeFilter)
		.groupBy(sql`date_trunc('week', ${bookings.created_at})`)
		.orderBy(sql`date_trunc('week', ${bookings.created_at})`);
}

export async function loadMentorStats(range: StatsRange) {
	const { mentor } = await currentDbMentor();

	const since =
		range === "all"
			? null
			: (() => {
					const d = new Date();
					d.setDate(d.getDate() - RANGE_DAYS[range]);
					return d;
				})();

	const [countRows, ratingRows, series] = await Promise.all([
		loadMentorBookingCounts(mentor.id, since),
		loadMentorBookingRating(mentor.id, since),
		loadMentorBookingSeries(mentor.id, since),
	]);

	const counts = countRows[0];
	const rating = ratingRows[0];

	return {
		ok: true as const,
		counts: {
			total: counts?.total ?? 0,
			confirmed: counts?.confirmed ?? 0,
			completed: counts?.completed ?? 0,
			noShow: counts?.noShow ?? 0,
			cancelled: counts?.cancelled ?? 0,
		},
		avgRating: rating?.avg ?? 0,
		series: series.map((s) => ({ bucket: s.bucket, count: s.count })),
	};
}

export type MentorStats = Extract<
	Awaited<ReturnType<typeof loadMentorStats>>,
	{ ok: true }
>;
