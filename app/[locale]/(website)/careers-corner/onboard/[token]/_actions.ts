"use server";

import { db } from "@/src/db";
import { uploadMentorAvatar } from "@/src/db/actions/mentors";
import { actionLinks } from "@/src/db/schema/tables/action-links";
import { availability } from "@/src/db/schema/tables/availability";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import { resolveActionLink } from "@/src/lib/action-links";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { and, eq, getTableColumns, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CompleteOnboardingSchema } from "./_schema";

export async function loadMentorFromToken(token: string) {
	const verified = await resolveActionLink(token, "mentor_onboard");
	if (!verified.ok) {
		return {
			ok: false as const,
			reason: verified.reason,
		};
	}
	const [mentor] = await db
		.select({ ...getTableColumns(mentors), name: users.name })
		.from(mentors)
		.innerJoin(users, eq(users.id, mentors.user_id))
		.where(eq(mentors.id, verified.resourceId))
		.limit(1);
	if (!mentor) return { ok: false as const, reason: "not_found" };

	const slots = await db
		.select()
		.from(availability)
		.where(eq(availability.mentor_id, mentor.id));

	return { ok: true as const, mentor, availability: slots };
}

export async function uploadOnboardingImage(
	token: string,
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	const verified = await resolveActionLink(token, "mentor_onboard");
	if (!verified.ok) {
		return {
			error: `Invalid link: ${verified.reason}`,
		};
	}

	return uploadMentorAvatar(verified.resourceId, formData);
}

export const completeMentorOnboarding = actionClient
	.schema(CompleteOnboardingSchema)
	.action(async ({ parsedInput }) => {
		const verified = await resolveActionLink(
			parsedInput.token,
			"mentor_onboard",
		);
		if (!verified.ok) {
			throw new ActionError(`Invalid link: ${verified.reason}`);
		}

		const mentorId = verified.resourceId;
		const [mentor] = await db
			.select()
			.from(mentors)
			.where(eq(mentors.id, mentorId))
			.limit(1);
		if (!mentor) throw new ActionError("Mentor not found");

		const existingSlots = await db
			.select()
			.from(availability)
			.where(eq(availability.mentor_id, mentorId));
		if (existingSlots.length === 0) {
			throw new ActionError(
				"Please save at least one availability slot before going live.",
			);
		}

		await db.transaction(async (tx) => {
			await tx
				.update(mentors)
				.set({
					bio: parsedInput.bio,
					nickname: parsedInput.nickname || null,
					image: parsedInput.image || null,
					active: true,
				})
				.where(eq(mentors.id, mentorId));
			await tx
				.update(actionLinks)
				.set({ used_at: new Date() })
				.where(
					and(
						eq(actionLinks.action, "mentor_onboard"),
						eq(actionLinks.resource_id, mentorId),
						isNull(actionLinks.used_at),
					),
				);
		});

		revalidatePath("/careers-corner");
		revalidatePath(`/careers-corner/${mentor.slug}`);
		return { slug: mentor.slug };
	});
