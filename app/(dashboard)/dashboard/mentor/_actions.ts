"use server";

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { uploadMentorAvatar } from "@/src/db/actions/mentors";
import { DbMentorWithAvailability } from "@/src/db/schema/tables";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function getMentorProfile(): Promise<DbMentorWithAvailability | undefined> {
  const user = await currentDbUser();

	return db.query.mentors.findFirst({
		where: eq(schema.mentors.user_id, user.id),
		with: { availability: true },
	});
}

export async function updateMyProfile(
	formData: FormData,
): Promise<{ error?: string }> {
	const mentor = await getMentorProfile();
	if (!mentor) return { error: "Mentor profile not found." };

	await db
		.update(schema.mentors)
		.set({
			name: formData.get("name") as string,
			position: (formData.get("position") as string) || "",
			bio: (formData.get("bio") as string) || undefined,
			nickname: (formData.get("nickname") as string) || undefined,
			linkedin_url: (formData.get("linkedin_url") as string) || undefined,
		})
		.where(eq(schema.mentors.id, mentor.id));

	revalidatePath("/dashboard/mentor");
	return {};
}

export async function uploadMyImage(
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	try {
		const mentor = await getMentorProfile();
    if (!mentor) return { error: "Mentor profile not found." };
    const result = await uploadMentorAvatar(mentor.id, formData);
		if (!result.error) revalidatePath("/dashboard/mentor");
		return result;
	} catch (err) {
		return { error: String(err) };
	}
}
