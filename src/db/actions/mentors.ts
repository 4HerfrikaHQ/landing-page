import { db } from "@/src/db";
import { schema } from "@/src/db";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { MentorImageCropSchema } from "@/src/lib/mentor-image";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

type Executor = Pick<typeof db, "insert">;

export async function insertDefaultBookingSettings(
	executor: Executor,
	mentorId: string,
): Promise<void> {
	await executor
		.insert(mentorBookingSettings)
		.values({ mentor_id: mentorId })
		.onConflictDoNothing({ target: mentorBookingSettings.mentor_id });
}

export async function uploadMentorAvatar(
	mentorId: string,
	formData: FormData,
): Promise<{ url?: string; error?: string }> {
	try {
		const fileValue = formData.get("file");
		const file = fileValue instanceof File && fileValue.name ? fileValue : null;
		const cropValue = formData.get("crop");
		let crop = null;
		if (cropValue) {
			try {
				crop = MentorImageCropSchema.parse(JSON.parse(String(cropValue)));
			} catch {
				return { error: "The image framing is invalid." };
			}
		}

		if (!file) {
			if (!crop) return { error: "No file or image framing received." };
			await db
				.update(schema.mentors)
				.set({ image_crop: crop })
				.where(eq(schema.mentors.id, mentorId));
			return {};
		}

		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			return { error: "Please upload a JPEG, PNG, or WebP image." };
		}
		if (file.size > 4 * 1024 * 1024) {
			return { error: "Image must be under 4MB." };
		}

		const ext =
			file.type === "image/webp"
				? "webp"
				: file.type === "image/png"
					? "png"
					: "jpg";
		const path = `${mentorId}.${ext}`;
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
		if (!supabaseUrl || !serviceRoleKey) {
			return { error: "Image uploads are not configured." };
		}

		const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);

		const { error: uploadError } = await adminClient.storage
			.from("mentor-avatars")
			.upload(path, file, {
				upsert: true,
				contentType: file.type,
				cacheControl: "31536000",
			});

		if (uploadError) return { error: uploadError.message };

		const { data } = adminClient.storage
			.from("mentor-avatars")
			.getPublicUrl(path);
		const url = `${data.publicUrl}?t=${Date.now()}`;

		await db
			.update(schema.mentors)
			.set({ image: url, image_crop: crop })
			.where(eq(schema.mentors.id, mentorId));

		return { url };
	} catch (err) {
		return { error: String(err) };
	}
}
