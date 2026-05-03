"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { DbAvailability, DbMentor } from "@/src/db/schema/tables";
import { eq } from "drizzle-orm";

export type MentorWithAvailability = DbMentor & {
  availability: DbAvailability[]
};

export async function getMentors() {
	return db.query.mentors.findMany({
		where: eq(schema.mentors.active, true),
		with: { availability: true },
	});
}
