"use server";
import { db } from "@/src/db";
import { DbAvailability, DbMentor } from "@/src/db/schema/tables";

export type MentorWithAvailability = DbMentor & {
  availability: DbAvailability[]
};

export async function getMentors() {
	return db.query.mentors.findMany({
		with: { availability: true },
	});
}
