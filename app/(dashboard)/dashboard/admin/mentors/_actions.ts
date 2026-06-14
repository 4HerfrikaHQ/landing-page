"use server";

import { createHash } from "node:crypto";
import { createClient } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { uploadMentorAvatar } from "@/src/db/actions/mentors";
import { ActionError, adminAction } from "@/src/lib/safe-action";
import { CYCLE_MS, SINGLETON_ID } from "@/src/lib/featured-mentor";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { SetFeaturedMentorSchema } from "./_schema";

export async function getMentorsForAdmin(
	query?: string,
	status?: "active" | "inactive",
) {
	const filters: (SQL<unknown> | undefined)[] = [];

	if (query) {
		filters.push(
			or(
				ilike(schema.mentors.name, `%${query}%`),
				ilike(schema.mentors.position, `%${query}%`),
			),
		);
	}

	switch (status) {
		case "active":
			filters.push(eq(schema.mentors.active, true));
			break;
		case "inactive":
			filters.push(eq(schema.mentors.active, false));
			break;
	}

	return db
		.select({
			id: schema.mentors.id,
			name: schema.mentors.name,
			position: schema.mentors.position,
			image: schema.mentors.image,
			email: schema.users.email,
			bio: schema.mentors.bio,
			nickname: schema.mentors.nickname,
			linkedin_url: schema.mentors.linkedin_url,
			active: schema.mentors.active,
			created_at: schema.mentors.created_at,
		})
		.from(schema.mentors)
		.innerJoin(schema.users, eq(schema.mentors.user_id, schema.users.id))
		.where(and(...filters));
}

export async function createMentor(
	formData: FormData,
): Promise<{ error?: string }> {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const position = (formData.get("position") as string) || "";
	const bio = (formData.get("bio") as string) || undefined;
	const nickname = (formData.get("nickname") as string) || undefined;
	const linkedin_url = (formData.get("linkedin_url") as string) || undefined;

	const supabase = await createClient();
	const { data, error } = await supabase.auth.admin.createUser({
		email,
		email_confirm: true,
		user_metadata: { name },
	});
	if (error) return { error: error.message };

	const dbUser = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, data.user.id))
		.limit(1)
		.then((rows) => rows[0]);

	if (!dbUser) return { error: "User record not found after creation." };

	const baseSlug =
		(nickname || name)
			.toLowerCase()
			.normalize("NFKD")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "") || "mentor";
	const suffix = createHash("sha256")
		.update(`${Date.now()}-${baseSlug}`)
		.digest("hex")
		.slice(0, 8);
	const slug = `${baseSlug}-${suffix}`;

	await db.insert(schema.mentors).values({
		user_id: dbUser.id,
		name,
		position,
		bio,
		nickname,
		linkedin_url,
		slug,
	});

	revalidatePath("/dashboard/admin/mentors");
	return {};
}

export async function updateMentor(
	id: string,
	formData: FormData,
): Promise<{ error?: string }> {
	const name = formData.get("name") as string;
	const position = (formData.get("position") as string) || "";
	const bio = (formData.get("bio") as string) || undefined;
	const nickname = (formData.get("nickname") as string) || undefined;
	const linkedin_url = (formData.get("linkedin_url") as string) || undefined;

	await db
		.update(schema.mentors)
		.set({ name, position, bio, nickname, linkedin_url })
		.where(eq(schema.mentors.id, id));

	revalidatePath("/dashboard/admin/mentors");
	return {};
}

export async function uploadMentorImage(
	mentorId: string,
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	const result = await uploadMentorAvatar(mentorId, formData);
	if (!result.error) revalidatePath("/dashboard/admin/mentors");
	return result;
}

export async function toggleMentorActive(
	id: string,
	active: boolean,
): Promise<{ error?: string }> {
	if (active) {
		const mentor = await db.query.mentors.findFirst({
			where: eq(schema.mentors.id, id),
			with: { availability: true },
		});

		if (!mentor) {
			return { error: "Mentor not found" };
		}

		if (
			!mentor.name ||
			!mentor.position ||
			!mentor.image ||
			!mentor.bio ||
			!mentor.linkedin_url
		) {
			return {
				error:
					"Cannot activate mentor. Please ensure name, position, image, bio, and LinkedIn URL are all set.",
			};
		}

		if (mentor.availability.length === 0) {
			return {
				error: "Cannot activate a mentor without any availability slots",
			};
		}
	}

	await db
		.update(schema.mentors)
		.set({ active })
		.where(eq(schema.mentors.id, id));

	revalidatePath("/dashboard/admin/mentors");
	return {};
}

export async function getFeaturedMentorId(): Promise<string | null> {
	const [state] = await db
		.select({ featured_mentor_id: schema.featuredMentorState.featured_mentor_id })
		.from(schema.featuredMentorState)
		.where(eq(schema.featuredMentorState.id, SINGLETON_ID))
		.limit(1);
	return state?.featured_mentor_id ?? null;
}

export const setFeaturedMentor = adminAction
	.schema(SetFeaturedMentorSchema)
	.action(async ({ parsedInput }) => {
		const mentor = await db.query.mentors.findFirst({
			where: eq(schema.mentors.id, parsedInput.mentorId),
		});

		if (!mentor || !mentor.active || !mentor.image) {
			throw new ActionError(
				"Mentor must be active and have a profile photo to be featured",
			);
		}

		const now = new Date();

		await db.transaction(async (tx) => {
			const [state] = await tx
				.select()
				.from(schema.featuredMentorState)
				.where(eq(schema.featuredMentorState.id, SINGLETON_ID))
				.for("update")
				.limit(1);

			if (!state) {
				throw new ActionError(
					"featured_mentor_state singleton row is missing; run db:migrate to apply the seed migration.",
				);
			}

			const windowOpen = !!state.cycle_end_at && now < state.cycle_end_at;

			await tx
				.update(schema.featuredMentorState)
				.set({
					featured_mentor_id: parsedInput.mentorId,
					is_manual_override: true,
					cycle_start_at: windowOpen ? state.cycle_start_at : now,
					cycle_end_at: windowOpen
						? state.cycle_end_at
						: new Date(now.getTime() + CYCLE_MS),
					updated_at: now,
				})
				.where(eq(schema.featuredMentorState.id, SINGLETON_ID));
		});

		revalidatePath("/careers-corner");
		revalidatePath("/dashboard/admin/mentors");
		return { ok: true };
	});
