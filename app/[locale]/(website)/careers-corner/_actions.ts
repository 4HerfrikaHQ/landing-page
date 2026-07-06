"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import type { DbAvailability, DbMentor } from "@/src/db/schema/tables";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";

export type MentorWithAvailability = DbMentor & {
	name: string;
	availability: DbAvailability[];
};

export type HeroMentor = {
	image: string;
	name: string;
	slug: string;
};

export async function getMentors(): Promise<MentorWithAvailability[]> {
	const rows = await db.query.mentors.findMany({
		where: eq(schema.mentors.active, true),
		with: { availability: true, user: { columns: { name: true } } },
	});
	return rows.map((m) => ({ ...m, name: m.user.name }));
}

export async function getHeroMentors(): Promise<HeroMentor[]> {
	const rows = await db.query.mentors.findMany({
		where: and(
			eq(schema.mentors.active, true),
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
