import { db } from "@/src/db";
import { schema } from "@/src/db";
import { mentorBookingSettings } from "@/src/db/schema/tables/mentor-booking-settings";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";

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
		const mentor = await db.query.mentors.findFirst({
			where: and(
				eq(schema.mentors.id, mentorId),
				eq(schema.mentors.archived, false),
			),
			columns: { id: true },
		});
		if (!mentor) return { error: "Mentor not found." };

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

		const { data } = adminClient.storage
			.from("mentor-avatars")
			.getPublicUrl(path);
		const url = `${data.publicUrl}?t=${Date.now()}`;

		const updated = await db
			.update(schema.mentors)
			.set({ image: url })
			.where(
				and(
					eq(schema.mentors.id, mentorId),
					eq(schema.mentors.archived, false),
				),
			)
			.returning({ id: schema.mentors.id });
		if (updated.length === 0) return { error: "Mentor not found." };

		return { url };
	} catch (err) {
		return { error: String(err) };
	}
}
