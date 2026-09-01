"use server";

import { currentDbMentor } from "@/src/auth";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { type SQL, and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

interface LoadMenteesParams {
	query?: string;
	sort?: string;
	page?: number;
	pageSize?: number;
}

export async function loadMentees(params: LoadMenteesParams = {}) {
	const { query, sort, page = 1, pageSize = 20 } = params;

	const { mentor } = await currentDbMentor();

	const conditions: (SQL<unknown> | undefined)[] = [
		eq(bookings.mentor_id, mentor.id),
	];

	if (query) {
		conditions.push(
			or(
				ilike(bookings.mentee_name, `%${query}%`),
				ilike(bookings.mentee_email, `%${query}%`),
			),
		);
	}

	const where = and(...conditions);

	// One group per mentee (keyed by email). "sessions" sorts by the session
	// count; the default "recent" sorts by the latest session start.
	const orderBy =
		sort === "sessions"
			? desc(sql`count(*)`)
			: desc(sql`max(${bookings.start_at})`);

	// Total distinct mentees matching: count the grouped rows via a subquery.
	const [{ total }] = await db
		.select({ total: count() })
		.from(
			db
				.select({ email: bookings.mentee_email })
				.from(bookings)
				.where(where)
				.groupBy(bookings.mentee_email)
				.as("grouped_mentees"),
		);

	const lastPage = Math.max(1, Math.ceil(total / pageSize));
	// Clamp so shrinking the result set (via search) never lands on an empty page.
	const clampedPage = Math.min(Math.max(1, page), lastPage);

	const rows = await db
		.select({
			email: bookings.mentee_email,
			name: sql<string>`max(${bookings.mentee_name})`,
			total: sql<number>`count(*)::int`,
			lastAt: sql<Date>`max(${bookings.start_at})`,
		})
		.from(bookings)
		.where(where)
		.groupBy(bookings.mentee_email)
		.orderBy(orderBy)
		.limit(pageSize)
		.offset((clampedPage - 1) * pageSize);

	// Normalize lastAt to an ISO string so it is serializable across the
	// RSC → client boundary.
	const serialized = rows.map((mentee) => ({
		email: mentee.email,
		name: mentee.name,
		total: mentee.total,
		lastAt: new Date(mentee.lastAt).toISOString(),
	}));

	return { ok: true as const, rows: serialized, total, page: clampedPage };
}

type LoadMenteesOk = Extract<
	Awaited<ReturnType<typeof loadMentees>>,
	{ ok: true }
>;
export type MenteeRow = LoadMenteesOk["rows"][number];
