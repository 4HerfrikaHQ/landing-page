"use server";

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { bookingFeedback } from "@/src/db/schema/tables/booking-feedback";
import {
	BookingStatus,
	CareerStage,
	bookings,
} from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import {
	type SQL,
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	lt,
	ne,
	or,
} from "drizzle-orm";
import { BookingTab } from "./_schema";

const MENTOR_BOOKINGS_PAGE_SIZE = 10;

interface MentorBookingsParams {
	tab?: string;
	query?: string;
	status?: string;
	stage?: string;
	page?: number;
}

/** A mentor's bookings for one tab — searched, filtered, and paginated in SQL. */
export async function loadMentorBookings(params: MentorBookingsParams = {}) {
	const user = await currentDbUser();
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.user_id, user.id))
		.limit(1);
	if (!mentor) {
		return { ok: false as const, reason: "no_mentor_profile" as const };
	}

	const tab = BookingTab.catch("upcoming").parse(params.tab);
	const now = new Date();

	const filters: (SQL<unknown> | undefined)[] = [
		eq(bookings.mentor_id, mentor.id),
	];

	const status = BookingStatus.safeParse(params.status);
	if (status.success) filters.push(eq(bookings.status, status.data));

	const stage = CareerStage.safeParse(params.stage);
	if (stage.success) filters.push(eq(bookings.mentee_career_stage, stage.data));

	if (params.query) {
		filters.push(
			or(
				ilike(bookings.mentee_name, `%${params.query}%`),
				ilike(bookings.mentee_email, `%${params.query}%`),
			),
		);
	}

	const upcomingWhere = and(
		...filters,
		gte(bookings.start_at, now),
		ne(bookings.status, "cancelled"),
	);
	const pastWhere = and(...filters, lt(bookings.start_at, now));

	const countBookings = (where: SQL<unknown> | undefined) =>
		db
			.select({ total: count() })
			.from(bookings)
			.where(where)
			.then(([row]) => row.total);

	const [upcomingCount, pastCount] = await Promise.all([
		countBookings(upcomingWhere),
		countBookings(pastWhere),
	]);

	const isPast = tab === "past";
	const total = isPast ? pastCount : upcomingCount;
	const pageSize = MENTOR_BOOKINGS_PAGE_SIZE;
	const lastPage = Math.max(1, Math.ceil(total / pageSize));
	// Clamp so shrinking the result set (via filters) never lands on an empty page.
	const page = Math.min(Math.max(1, params.page ?? 1), lastPage);

	const rows = await db
		.select()
		.from(bookings)
		.where(isPast ? pastWhere : upcomingWhere)
		.orderBy(isPast ? desc(bookings.start_at) : asc(bookings.start_at))
		.limit(pageSize)
		.offset((page - 1) * pageSize);

	const bookingIds = rows.map((booking) => booking.id);
	const feedback = bookingIds.length
		? await db
				.select()
				.from(bookingFeedback)
				.where(inArray(bookingFeedback.booking_id, bookingIds))
		: [];
	const feedbackByBooking = Object.fromEntries(
		feedback.map((entry) => [entry.booking_id, entry]),
	);

	return {
		ok: true as const,
		tab,
		page,
		pageSize,
		total,
		upcomingCount,
		pastCount,
		rows,
		feedbackByBooking,
	};
}

export type MentorBookingsResult = Extract<
	Awaited<ReturnType<typeof loadMentorBookings>>,
	{ ok: true }
>;
