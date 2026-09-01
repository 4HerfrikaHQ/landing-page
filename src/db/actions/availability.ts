"use server";

import { currentDbMentor } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { resolveActionLink } from "@/src/lib/action-links";
import { requireSuperAdmin } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { DayOfWeek, DbAvailability } from "@/src/db/schema/tables";

/** Admin-only availability read for the Admin > Edit mentor flow. */
export async function getAvailabilityForAdmin(
	mentorId: string,
): Promise<DbAvailability[]> {
	await requireSuperAdmin();
	return db
		.select()
		.from(schema.availability)
		.where(eq(schema.availability.mentor_id, mentorId));
}

export type AvailabilitySlotInput = {
	day: DayOfWeek;
	start_time: string;
	end_time: string;
};

async function writeAvailability(
	mentorId: string,
	slots: AvailabilitySlotInput[],
	timezone: string,
): Promise<{ error?: string }> {
	await db.delete(schema.availability).where(eq(schema.availability.mentor_id, mentorId));

	if (slots.length > 0) {
		await db.insert(schema.availability).values(
			slots.map((s) => ({ ...s, mentor_id: mentorId, timezone })),
		);
	}

	revalidatePath("/dashboard/admin/mentors");
	revalidatePath("/en/careercorner");
	revalidatePath("/fr/careercorner");
	return {};
}

/** Mentor self-service mutation: the target must be the caller's own profile. */
export async function saveMyAvailability(
	mentorId: string,
	slots: AvailabilitySlotInput[],
	timezone: string,
): Promise<{ error?: string }> {
	const { mentor } = await currentDbMentor();
	if (mentor.id !== mentorId) return { error: "Unauthorized" };
	return writeAvailability(mentorId, slots, timezone);
}

/** Admin-only mutation for editing any mentor's availability. */
export async function saveAvailabilityForAdmin(
	mentorId: string,
	slots: AvailabilitySlotInput[],
	timezone: string,
): Promise<{ error?: string }> {
	await requireSuperAdmin();
	return writeAvailability(mentorId, slots, timezone);
}

/** Token-gated mutation used only by the unauthenticated mentor onboarding flow. */
export async function saveOnboardingAvailability(
	token: string,
	mentorId: string,
	slots: AvailabilitySlotInput[],
	timezone: string,
): Promise<{ error?: string }> {
	const link = await resolveActionLink(token, "mentor_onboard");
	if (!link.ok || link.resourceId !== mentorId) {
		return { error: "Invalid onboarding link" };
	}
	return writeAvailability(mentorId, slots, timezone);
}
