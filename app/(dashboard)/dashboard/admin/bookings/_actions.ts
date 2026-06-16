"use server";

import { db } from "@/src/db";
import { BookingStatus, bookings } from "@/src/db/schema/tables/bookings";
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
	lt,
	or,
} from "drizzle-orm";

interface BookingFilters {
	status?: string;
	mentorId?: string;
	/** ISO date (yyyy-mm-dd), inclusive lower bound on start_at. */
	from?: string;
	/** ISO date (yyyy-mm-dd), inclusive upper bound on start_at. */
	to?: string;
	query?: string;
	page?: number;
	pageSize?: number;
}

const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getBookingsForAdmin(filters: BookingFilters) {
	const { page = 1, pageSize = 50 } = filters;
	const conditions: (SQL<unknown> | undefined)[] = [];

	const status = BookingStatus.safeParse(filters.status);
	if (status.success) conditions.push(eq(bookings.status, status.data));

	if (filters.mentorId && UUID_RE.test(filters.mentorId)) {
		conditions.push(eq(bookings.mentor_id, filters.mentorId));
	}

	if (filters.from) {
		const fromDate = new Date(`${filters.from}T00:00:00.000Z`);
		if (!Number.isNaN(fromDate.getTime())) {
			conditions.push(gte(bookings.start_at, fromDate));
		}
	}

	if (filters.to) {
		const toDate = new Date(`${filters.to}T00:00:00.000Z`);
		if (!Number.isNaN(toDate.getTime())) {
			// Inclusive of the whole "to" day.
			toDate.setUTCDate(toDate.getUTCDate() + 1);
			conditions.push(lt(bookings.start_at, toDate));
		}
	}

	if (filters.query) {
		conditions.push(
			or(
				ilike(bookings.mentee_name, `%${filters.query}%`),
				ilike(bookings.mentee_email, `%${filters.query}%`),
			),
		);
	}

	const where = conditions.length ? and(...conditions) : undefined;

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: bookings.id,
				mentee_name: bookings.mentee_name,
				mentee_email: bookings.mentee_email,
				start_at: bookings.start_at,
				status: bookings.status,
				mentee_timezone: bookings.mentee_timezone,
				meet_url: bookings.meet_url,
				mentor_name: mentors.name,
				mentor_slug: mentors.slug,
			})
			.from(bookings)
			.innerJoin(mentors, eq(bookings.mentor_id, mentors.id))
			.where(where)
			.orderBy(desc(bookings.start_at))
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

export type AdminBookingRow = Awaited<
	ReturnType<typeof getBookingsForAdmin>
>["rows"][number];

export async function getMentorOptions() {
	return db
		.select({ id: mentors.id, name: mentors.name })
		.from(mentors)
		.orderBy(asc(mentors.name));
}

export type MentorOption = Awaited<ReturnType<typeof getMentorOptions>>[number];
