"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import type { DbAvailability, DbMentor } from "@/src/db/schema/tables";
import {
	and,
	asc,
	count,
	desc,
	eq,
	exists,
	inArray,
	isNotNull,
	ne,
	or,
	sql,
} from "drizzle-orm";
import {
	MENTOR_PAGE_SIZE,
	MENTOR_SEARCH_MAX_LENGTH,
	toPrefixTsQuery,
} from "./_utils/mentor-search";

export type MentorWithAvailability = DbMentor & {
	name: string;
	availability: DbAvailability[];
};

export type HeroMentor = {
	image: string;
	name: string;
	slug: string;
};

const MIN_TYPO_SIMILARITY = 0.5;

export async function getMentors({
	query = "",
	onlyAvailable = false,
	page = 1,
}: {
	query?: string;
	onlyAvailable?: boolean;
	page?: number;
}): Promise<{ mentors: MentorWithAvailability[]; total: number }> {
	const { mentors, users, mentorGoogleConnections, availability } = schema;
	const pageSize = MENTOR_PAGE_SIZE;
	const offset = (Math.max(1, Math.floor(page) || 1) - 1) * pageSize;
	const term = query.trim().slice(0, MENTOR_SEARCH_MAX_LENGTH);
	const prefixQuery = toPrefixTsQuery(term);

	const document = sql`
		setweight(to_tsvector('english', ${users.name} || ' ' || coalesce(${mentors.nickname}, '')), 'A')
		|| setweight(to_tsvector('english', coalesce(${mentors.position}, '')), 'B')
		|| setweight(to_tsvector('english', coalesce(${mentors.bio}, '')), 'C')`;
	const tsQuery = sql`to_tsquery('english', ${prefixQuery})`;
	const typoSimilarity = sql`extensions.word_similarity(${term}, ${users.name} || ' ' || coalesce(${mentors.nickname}, '') || ' ' || coalesce(${mentors.position}, ''))`;

	const where = and(
		eq(mentors.active, true),
		eq(mentors.archived, false),
		term
			? or(
					prefixQuery ? sql`${document} @@ ${tsQuery}` : undefined,
					sql`${typoSimilarity} >= ${MIN_TYPO_SIMILARITY}`,
				)
			: undefined,
		onlyAvailable
			? and(
					eq(mentorGoogleConnections.status, "connected"),
					isNotNull(mentorGoogleConnections.refresh_token_ciphertext),
					eq(mentorGoogleConnections.revocation_state, "not_pending"),
					eq(mentorGoogleConnections.reauthorization_state, "not_required"),
					exists(
						db
							.select({ id: availability.id })
							.from(availability)
							.where(eq(availability.mentor_id, mentors.id)),
					),
				)
			: undefined,
	);

	const relevance = prefixQuery
		? sql`ts_rank(${document}, ${tsQuery}) + ${typoSimilarity}`
		: typoSimilarity;

	const [matches, [{ total }]] = await Promise.all([
		db
			.select({ id: mentors.id })
			.from(mentors)
			.innerJoin(users, eq(mentors.user_id, users.id))
			.leftJoin(
				mentorGoogleConnections,
				eq(mentorGoogleConnections.mentor_id, mentors.id),
			)
			.where(where)
			.orderBy(
				...(term ? [desc(relevance)] : []),
				asc(mentors.created_at),
				asc(mentors.id),
			)
			.limit(pageSize)
			.offset(offset),
		db
			.select({ total: count() })
			.from(mentors)
			.innerJoin(users, eq(mentors.user_id, users.id))
			.leftJoin(
				mentorGoogleConnections,
				eq(mentorGoogleConnections.mentor_id, mentors.id),
			)
			.where(where),
	]);

	if (matches.length === 0) return { mentors: [], total };

	const ids = matches.map((match) => match.id);
	const rows = await db.query.mentors.findMany({
		where: inArray(mentors.id, ids),
		with: {
			availability: true,
			googleConnection: true,
			user: { columns: { name: true } },
		},
	});
	const byId = new Map(rows.map((row) => [row.id, row]));
	const ordered = ids.flatMap((id) => byId.get(id) ?? []);

	return {
		total,
		mentors: ordered.map((mentor) => {
			const { googleConnection: connection, user, ...mentorRow } = mentor;
			const canAcceptBookings =
				connection?.status === "connected" &&
				connection.refresh_token_ciphertext !== null &&
				connection.revocation_state === "not_pending" &&
				connection.reauthorization_state === "not_required";

			return {
				...mentorRow,
				name: user.name,
				availability: canAcceptBookings ? mentor.availability : [],
			};
		}),
	};
}

export async function getHeroMentors(): Promise<HeroMentor[]> {
	const rows = await db.query.mentors.findMany({
		where: and(
			eq(schema.mentors.active, true),
			eq(schema.mentors.archived, false),
			isNotNull(schema.mentors.image),
			ne(schema.mentors.image, ""),
		),
		columns: { image: true, slug: true },
		with: { user: { columns: { name: true } } },
		orderBy: sql`random()`,
		limit: 6,
	});

	return rows
		.filter((row) => row.image !== null && row.image !== "")
		.map((row) => ({
			image: row.image as string,
			name: row.user.name,
			slug: row.slug,
		}));
}
