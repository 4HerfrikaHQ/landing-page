"use server";

import { createClient } from "@/src/auth";
import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdmins() {
	return db.select().from(schema.users).where(eq(schema.users.role, "super_admin"));
}

export async function createAdmin(
	formData: FormData,
): Promise<{ error?: string }> {
	const name = formData.get("name") as string;
	const email = formData.get("email") as string;

	const supabase = await createClient();
	const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
		data: { name },
	});
	if (error) return { error: error.message };

	await db
		.update(schema.users)
		.set({ name, email, role: "super_admin" })
		.where(eq(schema.users.auth_user_id, data.user.id));

	revalidatePath("/dashboard/admin/admins");
	return {};
}

export async function updateAdmin(
	id: string,
	formData: FormData,
): Promise<{ error?: string }> {
	const name = formData.get("name") as string;

	await db.update(schema.users).set({ name }).where(eq(schema.users.id, id));

	revalidatePath("/dashboard/admin/admins");
	return {};
}

export async function deleteAdmin(id: string): Promise<{ error?: string }> {
	const currentUser = await currentDbUser();
	if (currentUser.id === id) {
		return { error: "You can't delete your own account." };
	}

  const [target] = await db.delete(schema.users).where(eq(schema.users.id, id)).returning()

  if (!target) return { error: "Admin not found." };

	const supabase = await createClient();
	const { error } = await supabase.auth.admin.deleteUser(target.auth_user_id);
	if (error) return { error: error.message };

	revalidatePath("/dashboard/admin/admins");
	return {};
}
