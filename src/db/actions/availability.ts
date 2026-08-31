"use server";

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import type { DayOfWeek, DbAvailability } from "@/src/db/schema/tables";
import { resolveActionLink } from "@/src/lib/action-links";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAvailability(
	mentorId: string,
): Promise<DbAvailability[]> {
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
	onboardingToken?: string,
): Promise<{ error?: string }> {
	if (onboardingToken) {
		const link = await resolveActionLink(onboardingToken, "mentor_onboard");
		if (!link.ok || link.resourceId !== mentorId) {
			return { error: "Invalid onboarding link." };
		}
	} else {
		const user = await currentDbUser();
		if (user.role !== "super_admin") {
			const [mentor] = await db
				.select({ id: schema.mentors.id })
				.from(schema.mentors)
				.where(
					and(
						eq(schema.mentors.id, mentorId),
						eq(schema.mentors.user_id, user.id),
					),
				)
				.limit(1);
			if (!mentor) return { error: "Not authorized." };
		}
	}

	await db
		.delete(schema.availability)
		.where(eq(schema.availability.mentor_id, mentorId));

	if (slots.length > 0) {
		await db
			.insert(schema.availability)
			.values(slots.map((s) => ({ ...s, mentor_id: mentorId, timezone })));
	}

	revalidatePath("/dashboard/admin/mentors");
	revalidatePath("/en/careercorner");
	revalidatePath("/fr/careercorner");
	return {};
}
