import { db } from "@/src/db";
import { schema } from "@/src/db";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

export async function uploadMentorAvatar(
	mentorId: string,
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	try {
		const file = formData.get("file") as File;
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

		if (uploadError) return { error: uploadError.message };

		const { data } = adminClient.storage.from("mentor-avatars").getPublicUrl(path);

		await db
			.update(schema.mentors)
			.set({ image: data.publicUrl })
			.where(eq(schema.mentors.id, mentorId));

		return { url: data.publicUrl };
	} catch (err) {
		return { error: String(err) };
	}
}
