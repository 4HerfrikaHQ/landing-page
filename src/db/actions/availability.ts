"use server";

import { db } from "@/src/db";
import { schema } from "@/src/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { DayOfWeek, DbAvailability } from "@/src/db/schema/tables";

export async function getAvailability(mentorId: string): Promise<DbAvailability[]> {
	return db
		.select()
		.from(schema.availability)
		.where(eq(schema.availability.mentor_id, mentorId));
}

type SlotInput = { day: DayOfWeek; start_time: string; end_time: string };

export async function saveAvailability(
	mentorId: string,
	slots: SlotInput[],
	timezone: string,
): Promise<{ error?: string }> {
	await db.delete(schema.availability).where(eq(schema.availability.mentor_id, mentorId));

	if (slots.length > 0) {
		await db.insert(schema.availability).values(
			slots.map((s) => ({ ...s, mentor_id: mentorId, timezone })),
		);
	}

	revalidatePath("/dashboard/admin/mentors");
	revalidatePath("/en/careers-corner");
	revalidatePath("/fr/careers-corner");
	return {};
}
