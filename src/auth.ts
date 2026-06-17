"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { eq } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import type { AuthError, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			cookies: {
				getAll: () => cookieStore.getAll(),
				setAll: (cookiesToSet) => {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// called from a Server Component — safe to ignore
					}
				},
			},
		},
	);
}

/**
 * Dev-only auth bypass. When NODE_ENV is not production AND DEV_AUTH_BYPASS is
 * explicitly set, dashboard auth resolves to the local admin row instead of a
 * real Supabase session — so you can preview the dashboards without logging in.
 * Double-guarded so it can never take effect on a real deployment.
 */
const DEV_AUTH_BYPASS =
	process.env.NODE_ENV !== "production" &&
	process.env.DEV_AUTH_BYPASS === "true";

function devBypassDbUser() {
	const email = process.env.ADMIN_EMAIL ?? "lope@braindao.org";
	return db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, email))
		.limit(1)
		.then((rows) => rows[0] ?? null);
}

export async function sendOtp(email: string) {
	const supabase = await createClient();
	return supabase.auth.signInWithOtp({
		email,
		options: { shouldCreateUser: false }, // invite-only: no new accounts via OTP
	});
}

export async function verifyOtp(email: string, token: string): Promise<{ error: AuthError }> {
	const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) {
    return { error }
  }

  const user = await currentDbUser();

  if (user.role === "super_admin") {
    redirect("/dashboard/admin")
  } else {
    redirect("/dashboard/mentor")
  }
}

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/dashboard/login");
}

/** Gets the Supabase auth user. Calls unauthorized() if not logged in. */
export async function currentUser(): Promise<User> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (user) return user;
	if (DEV_AUTH_BYPASS) {
		const row = await devBypassDbUser();
		if (row) {
			return {
				id: row.auth_user_id,
				email: row.email,
				aud: "authenticated",
				app_metadata: {},
				user_metadata: { name: row.name },
				created_at: row.created_at.toISOString(),
			} as unknown as User;
		}
	}
	unauthorized();
}

/** Gets the public.users row that matches the Supabase auth user. */
export async function currentDbUser() {
	if (DEV_AUTH_BYPASS) {
		const row = await devBypassDbUser();
		if (row) return row;
	}
	const user = await currentUser();
	const dbUser = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, user.id))
		.limit(1)
		.then((rows) => rows[0] ?? null);
	if (!dbUser) unauthorized();
	return dbUser;
}
