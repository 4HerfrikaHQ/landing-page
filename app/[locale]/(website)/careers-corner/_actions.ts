"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { eq } from "drizzle-orm";

export async function getMentors() {
	return db.query.mentors.findMany({
		where: eq(schema.mentors.active, true),
		with: { availability: true },
	});
}
