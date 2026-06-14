"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import type { DbAvailability, DbMentor } from "@/src/db/schema/tables";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";

export type MentorWithAvailability = DbMentor & {
	availability: DbAvailability[];
};

export type HeroMentor = {
	image: string;
	name: string;
	slug: string;
};

export async function getMentors() {
	return db.query.mentors.findMany({
		where: eq(schema.mentors.active, true),
		with: { availability: true },
	});
}

export async function getHeroMentors(): Promise<HeroMentor[]> {
	const rows = await db.query.mentors.findMany({
		where: and(
			eq(schema.mentors.active, true),
			isNotNull(schema.mentors.image),
			ne(schema.mentors.image, ""),
		),
		columns: { image: true, name: true, slug: true },
		orderBy: sql`random()`,
		limit: 6,
	});

	return rows.filter(
		(row): row is HeroMentor => row.image !== null && row.image !== "",
	);
}
