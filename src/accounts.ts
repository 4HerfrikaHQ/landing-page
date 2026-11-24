import { createAdminClient } from "@/src/auth";
import { db, schema } from "@/src/db";
import type { DbUser } from "@/src/db/schema/tables/users";
import { isUniqueViolation } from "@/src/lib/mentor-slug";
import { eq, sql } from "drizzle-orm";

export type NewStaff = { email: string; name: string };

type Delivery = "invite" | "no_email";

export class AccountError extends Error {}

function toStaff({ email, name }: NewStaff): NewStaff {
	const staff = {
		email: (email ?? "").trim().toLowerCase(),
		name: (name ?? "").trim(),
	};
	if (!staff.email) throw new AccountError("Enter an email address.");
	if (!staff.name) throw new AccountError("Enter a name.");
	return staff;
}

async function findAuthUserId(email: string): Promise<string | null> {
	const rows = await db.execute<{ id: string }>(
		sql`select id from auth.users where email = ${email} limit 1`,
	);
	return rows[0]?.id ?? null;
}

async function ensureAuthUser(
	{ email, name }: NewStaff,
	delivery: Delivery,
): Promise<string> {
	const existing = await findAuthUserId(email);
	if (existing) return existing;

	const supabase = await createAdminClient();
	const { data, error } =
		delivery === "invite"
			? await supabase.auth.admin.inviteUserByEmail(email, { data: { name } })
			: await supabase.auth.admin.createUser({
					email,
					email_confirm: true,
					user_metadata: { name },
				});
	if (error) throw new AccountError(error.message);
	return data.user.id;
}

async function writeUser<T>(email: string, write: () => Promise<T>) {
	try {
		return await write();
	} catch (error) {
		if (isUniqueViolation(error)) {
			throw new AccountError(
				`${email} is already on a different staff account. Ask a developer to check the users table.`,
			);
		}
		throw error;
	}
}

export async function addAdmin(input: NewStaff): Promise<DbUser> {
	const staff = toStaff(input);
	const authUserId = await ensureAuthUser(staff, "invite");
	const [user] = await writeUser(staff.email, () =>
		db
			.insert(schema.users)
			.values({ auth_user_id: authUserId, role: "super_admin", ...staff })
			.onConflictDoUpdate({
				target: schema.users.auth_user_id,
				set: { role: "super_admin" },
			})
			.returning(),
	);
	return user;
}

export async function addMentorUser(input: NewStaff): Promise<DbUser> {
	const staff = toStaff(input);
	const authUserId = await ensureAuthUser(staff, "no_email");
	await writeUser(staff.email, () =>
		db
			.insert(schema.users)
			.values({ auth_user_id: authUserId, role: "mentor", ...staff })
			.onConflictDoNothing({ target: schema.users.auth_user_id }),
	);
	const [user] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, authUserId))
		.limit(1);
	return user;
}
