"use server";

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { bookings } from "@/src/db/schema/tables/bookings";
import { mentors } from "@/src/db/schema/tables/mentors";
import { type SQL, and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

interface LoadMenteesParams {
	query?: string;
	sort?: string;
	page?: number;
	pageSize?: number;
}

export async function loadMentees(params: LoadMenteesParams = {}) {
	const { query, sort, page = 1, pageSize = 20 } = params;

	const user = await currentDbUser();
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.user_id, user.id))
		.limit(1);

	if (!mentor) {
		return { ok: false as const, reason: "no_mentor_profile" as const };
	}

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

	const [rows, [{ total }]] = await Promise.all([
		db
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
			.offset((page - 1) * pageSize),
		// Total distinct mentees matching: count the grouped rows via a subquery.
		db
			.select({ total: count() })
			.from(
				db
					.select({ email: bookings.mentee_email })
					.from(bookings)
					.where(where)
					.groupBy(bookings.mentee_email)
					.as("grouped_mentees"),
			),
	]);

	// Normalize lastAt to an ISO string so it is serializable across the
	// RSC → client boundary.
	const serialized = rows.map((mentee) => ({
		email: mentee.email,
		name: mentee.name,
		total: mentee.total,
		lastAt: new Date(mentee.lastAt).toISOString(),
	}));

	return { ok: true as const, rows: serialized, total };
}

type LoadMenteesOk = Extract<
	Awaited<ReturnType<typeof loadMentees>>,
	{ ok: true }
>;
export type MenteeRow = LoadMenteesOk["rows"][number];
