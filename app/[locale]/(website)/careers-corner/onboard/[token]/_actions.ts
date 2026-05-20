"use server";

import { db } from "@/src/db";
import { availability } from "@/src/db/schema/tables/availability";
import { mentors } from "@/src/db/schema/tables/mentors";
import { verifyBookingToken } from "@/src/lib/booking-tokens";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { CompleteOnboardingSchema } from "./_schema";

export async function loadMentorFromToken(token: string) {
	const verified = verifyBookingToken(token);
	if (!verified.ok || verified.action !== "mentor_onboard") {
		return {
			ok: false as const,
			reason: verified.ok ? "wrong_action" : verified.reason,
		};
	}
	const [mentor] = await db
		.select()
		.from(mentors)
		.where(eq(mentors.id, verified.bookingId))
		.limit(1);
	if (!mentor) return { ok: false as const, reason: "not_found" };

	const slots = await db
		.select()
		.from(availability)
		.where(eq(availability.mentor_id, mentor.id));

	return { ok: true as const, mentor, availability: slots };
}

export const completeMentorOnboarding = actionClient
	.schema(CompleteOnboardingSchema)
	.action(async ({ parsedInput }) => {
		const verified = verifyBookingToken(parsedInput.token);
		if (!verified.ok || verified.action !== "mentor_onboard") {
			throw new ActionError(
				`Invalid link: ${verified.ok ? "wrong_action" : verified.reason}`,
			);
		}

		const mentorId = verified.bookingId;
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

		await db
			.update(mentors)
			.set({
				bio: parsedInput.bio,
				nickname: parsedInput.nickname || null,
				image: parsedInput.image || null,
				active: true,
			})
			.where(eq(mentors.id, mentorId));

		revalidatePath("/careers-corner");
		revalidatePath(`/careers-corner/${mentor.slug}`);
		return { slug: mentor.slug };
	});
