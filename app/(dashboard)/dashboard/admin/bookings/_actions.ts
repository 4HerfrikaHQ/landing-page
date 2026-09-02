"use server";

import { db } from "@/src/db";
import { setBookingNoShow } from "@/src/db/actions/mark-no-show";
import { BookingStatus, bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { adminAction } from "@/src/lib/safe-action";
import {
	type SQL,
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	ilike,
	lt,
	or,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

interface BookingFilters {
	status?: string;
	/** Mentor slug (pretty URL value), resolved against `mentors.slug`. */
	mentorSlug?: string;
	/** ISO date (yyyy-mm-dd), inclusive lower bound on start_at. */
	from?: string;
	/** ISO date (yyyy-mm-dd), inclusive upper bound on start_at. */
	to?: string;
	dateRange?: string;
	query?: string;
	page?: number;
	pageSize?: number;
}

function bookingConditions(
	filters: BookingFilters,
	options: { includeStatus?: boolean } = {},
) {
	const conditions: SQL<unknown>[] = [];
	const now = new Date();

	if (options.includeStatus !== false) {
		const status = BookingStatus.safeParse(filters.status);
		if (status.success) conditions.push(eq(bookings.status, status.data));
	}

	if (filters.mentorSlug) {
		conditions.push(eq(mentors.slug, filters.mentorSlug));
	}

	if (filters.dateRange === "upcoming") {
		conditions.push(gte(bookings.start_at, now));
	} else if (filters.dateRange === "past") {
		conditions.push(lt(bookings.start_at, now));
	} else if (filters.dateRange === "30d") {
		const thirtyDaysAgo = new Date(now);
		thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
		conditions.push(gte(bookings.start_at, thirtyDaysAgo));
		conditions.push(lt(bookings.start_at, now));
	} else if (filters.dateRange === "custom") {
		if (filters.from) {
			const fromDate = new Date(`${filters.from}T00:00:00.000Z`);
			if (!Number.isNaN(fromDate.getTime())) {
				conditions.push(gte(bookings.start_at, fromDate));
			}
		}

		if (filters.to) {
			const toDate = new Date(`${filters.to}T00:00:00.000Z`);
			if (!Number.isNaN(toDate.getTime())) {
				toDate.setUTCDate(toDate.getUTCDate() + 1);
				conditions.push(lt(bookings.start_at, toDate));
			}
		}
	}

	if (filters.query) {
		const searchCondition = or(
			ilike(bookings.mentee_name, `%${filters.query}%`),
			ilike(bookings.mentee_email, `%${filters.query}%`),
		);
		if (searchCondition) conditions.push(searchCondition);
	}

	return conditions;
}

export async function getBookingsForAdmin(filters: BookingFilters) {
	const { page = 1, pageSize = 50 } = filters;
	const conditions = bookingConditions(filters);

	const where = conditions.length ? and(...conditions) : undefined;

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: bookings.id,
				mentee_name: bookings.mentee_name,
				mentee_email: bookings.mentee_email,
				mentee_gender: bookings.mentee_gender,
				mentee_phone: bookings.mentee_phone,
				mentee_linkedin: bookings.mentee_linkedin,
				mentee_country: bookings.mentee_country,
				mentee_career_stage: bookings.mentee_career_stage,
				purpose: bookings.purpose,
				start_at: bookings.start_at,
				end_at: bookings.end_at,
				status: bookings.status,
				mentee_timezone: bookings.mentee_timezone,
				meet_url: bookings.meet_url,
				hosting_mode: bookings.hosting_mode,
				cancel_reason: bookings.cancel_reason,
				cancelled_at: bookings.cancelled_at,
				reschedule_count: bookings.reschedule_count,
				created_at: bookings.created_at,
				updated_at: bookings.updated_at,
				mentor_name: users.name,
				mentor_slug: mentors.slug,
			})
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.innerJoin(users, eq(mentors.user_id, users.id))
			.where(where)
			.orderBy(
				filters.status === "cancelled"
					? desc(bookings.cancelled_at)
					: desc(bookings.start_at),
				desc(bookings.start_at),
			)
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		db
			.select({ total: count() })
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.where(where),
	]);

	return { rows, total };
}

async function countBookings(conditions: SQL<unknown>[]) {
	const [{ value }] = await db
		.select({ value: count() })
		.from(bookings)
		.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
		.where(conditions.length ? and(...conditions) : undefined);
	return value;
}

export async function getBookingSummaryForAdmin(filters: BookingFilters) {
	const base = bookingConditions(filters, { includeStatus: false });
	const now = new Date();
	const [total, upcoming, completed, cancelled, noShow] = await Promise.all([
		countBookings(base),
		countBookings([
			...base,
			eq(bookings.status, "confirmed"),
			gte(bookings.start_at, now),
		]),
		// A session is treated as completed once it has passed, unless it was
		// explicitly cancelled or marked as a no-show. We retain `confirmed` in
		// the database so an admin can still mark a missed session as a no-show.
		countBookings([
			...base,
			or(
				eq(bookings.status, "completed"),
				and(eq(bookings.status, "confirmed"), lt(bookings.start_at, now)),
			),
		]),
		countBookings([...base, eq(bookings.status, "cancelled")]),
		countBookings([...base, eq(bookings.status, "no_show")]),
	]);

	return {
		total,
		upcoming,
		completed,
		cancelled,
		noShow,
		cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
	};
}

export type AdminBookingRow = Awaited<
	ReturnType<typeof getBookingsForAdmin>
>["rows"][number];

export async function getMentorOptions() {
	return db
		.select({ id: mentors.id, name: users.name, slug: mentors.slug })
		.from(mentors)
		.innerJoin(users, eq(mentors.user_id, users.id))
		.orderBy(asc(users.name));
}

export type MentorOption = Awaited<ReturnType<typeof getMentorOptions>>[number];

export const markBookingNoShow = adminAction
	.schema(z.object({ bookingId: z.string().uuid() }))
	.action(async ({ parsedInput }) => {
		await setBookingNoShow(parsedInput.bookingId);
		revalidatePath("/dashboard/admin/bookings");
		return { ok: true };
	});
