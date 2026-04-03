"use server";

import { createClient } from "@/src/auth";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { and, eq, ilike, or, SQL } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMentorsForAdmin(
	query?: string,
	status?: "active" | "inactive",
) {
  const filters: (SQL<unknown> | undefined)[] = [];

  if (query) {
    filters.push(or(
				ilike(schema.mentors.name, `%${query}%`),
				ilike(schema.mentors.position, `%${query}%`),
			))
  }

  switch (status) {
    case "active":
      filters.push(eq(schema.mentors.active, true))
      break;
    case "inactive":
      filters.push(eq(schema.mentors.active, false))
      break;
  }

  return db
		.select({
			id: schema.mentors.id,
			name: schema.mentors.name,
			position: schema.mentors.position,
			image: schema.mentors.image,
			email: schema.users.email,
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
	const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
		data: { name },
	});
	if (error) return { error: error.message };

	const dbUser = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, data.user.id))
		.limit(1)
		.then((rows) => rows[0]);

	if (!dbUser) return { error: "User record not found after invite." };

	await db.insert(schema.mentors).values({
		user_id: dbUser.id,
		name,
		position,
		bio,
		nickname,
		linkedin_url,
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
	try {
		const file = formData.get("file") as File;

		console.log("[uploadMentorImage] file:", file?.name, file?.size, file?.type);
		console.log("[uploadMentorImage] supabase url:", process.env.NEXT_PUBLIC_SUPABASE_URL);
		console.log("[uploadMentorImage] service key set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

		if (!file?.name) return { error: "No file received." };

		const ext = file.name.split(".").pop();
		const path = `${mentorId}.${ext}`;

		const adminClient = createAdminClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		);

		const { error: uploadError } = await adminClient.storage
			.from("mentor-avatars")
			.upload(path, file, { upsert: true, contentType: file.type });

		if (uploadError) {
			console.error("[uploadMentorImage] storage error:", uploadError);
			return { error: uploadError.message };
		}

		const { data } = adminClient.storage.from("mentor-avatars").getPublicUrl(path);

		await db
			.update(schema.mentors)
			.set({ image: data.publicUrl })
			.where(eq(schema.mentors.id, mentorId));

		revalidatePath("/dashboard/admin/mentors");
		return { url: data.publicUrl };
	} catch (err) {
		console.error("[uploadMentorImage] uncaught:", err);
		return { error: String(err) };
	}
}

export async function toggleMentorActive(
	id: string,
	active: boolean,
): Promise<{ error?: string }> {
	await db
		.update(schema.mentors)
		.set({ active })
		.where(eq(schema.mentors.id, id));

	revalidatePath("/dashboard/admin/mentors");
	return {};
}
