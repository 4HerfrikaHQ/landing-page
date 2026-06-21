"use server";

import { createAdminClient } from "@/src/auth";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { requireSuperAdmin } from "@/src/lib/safe-action";
import { type SQL, and, asc, count, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface AdminFilters {
	query?: string;
	page?: number;
	pageSize?: number;
}

export async function getAdmins(filters: AdminFilters = {}) {
	const { page = 1, pageSize = 20 } = filters;
	const conditions: (SQL<unknown> | undefined)[] = [
		eq(schema.users.role, "super_admin"),
	];

	if (filters.query) {
		conditions.push(
			or(
				ilike(schema.users.name, `%${filters.query}%`),
				ilike(schema.users.email, `%${filters.query}%`),
			),
		);
	}

	const where = and(...conditions);

	const [rows, [{ total }]] = await Promise.all([
		db
			.select({
				id: schema.users.id,
				name: schema.users.name,
				email: schema.users.email,
				created_at: schema.users.created_at,
			})
			.from(schema.users)
			.where(where)
			.orderBy(asc(schema.users.name))
			.limit(pageSize)
			.offset((page - 1) * pageSize),
		db.select({ total: count() }).from(schema.users).where(where),
	]);

	return { rows, total };
}

export type AdminRow = Awaited<ReturnType<typeof getAdmins>>["rows"][number];

export async function createAdmin(
	formData: FormData,
): Promise<{ error?: string }> {
	await requireSuperAdmin();

	const name = formData.get("name") as string;
	const email = formData.get("email") as string;

	const supabase = await createAdminClient();
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
	await requireSuperAdmin();

	const name = formData.get("name") as string;

	await db.update(schema.users).set({ name }).where(eq(schema.users.id, id));

	revalidatePath("/dashboard/admin/admins");
	return {};
}

export async function deleteAdmin(id: string): Promise<{ error?: string }> {
	const currentUser = await requireSuperAdmin();
	if (currentUser.id === id) {
		return { error: "You can't delete your own account." };
	}

	const [target] = await db
		.delete(schema.users)
		.where(eq(schema.users.id, id))
		.returning();

	if (!target) return { error: "Admin not found." };

	const supabase = await createAdminClient();
	const { error } = await supabase.auth.admin.deleteUser(target.auth_user_id);
	if (error) return { error: error.message };

	revalidatePath("/dashboard/admin/admins");
	return {};
}
