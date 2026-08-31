"use server";

import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = new Set([
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadMentorCv(
	formData: FormData,
): Promise<{ path?: string; error?: string }> {
	const file = formData.get("file") as File | null;
	if (!file?.name) return { error: "No file received." };

	if (!ALLOWED_TYPES.has(file.type))
		return { error: "Only PDF and Word documents are accepted." };

	if (file.size > 10 * 1024 * 1024)
		return { error: "File must be under 10 MB." };

	const ext = file.name.split(".").pop();
	const path = `${crypto.randomUUID()}.${ext}`;

	const admin = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	const { error: uploadError } = await admin.storage
		.from("mentor-cvs")
		.upload(path, file, { contentType: file.type });

	if (uploadError) return { error: uploadError.message };

	return { path };
}
