"use server";
import { db } from "@/src/db";
import { schema } from "@/src/db";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { AuthError, User } from "@supabase/supabase-js";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { cache } from "react";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
 * Service-role client for privileged Supabase Admin API calls
 * (`auth.admin.*` — create/invite/delete users). Bypasses RLS, so it must
 * only ever run server-side. The cookie-bound `createClient()` above uses the
 * anon key and CANNOT call the Admin API.
 */
export async function createAdminClient() {
	return createSupabaseClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
}

function friendlyAuthError(error: AuthError): string {
	switch (error.code) {
		case "otp_disabled":
		case "user_not_found":
			return "We couldn't find a mentor account for this email. Use the email address your invite was sent to.";
		case "otp_expired":
			return "That code didn't work. It may be mistyped or expired — check your most recent email, or send a new code.";
		case "over_email_send_rate_limit":
		case "over_request_rate_limit":
			return "Too many attempts. Please wait a minute and try again.";
		case "email_address_invalid":
		case "validation_failed":
			return "That doesn't look like an email address. Please check it and try again.";
		default:
			return "Something went wrong on our side. Please try again in a moment.";
	}
}

export async function sendOtp(
	email: string,
): Promise<{ error: string | null }> {
	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithOtp({
		email: email.trim().toLowerCase(),
		options: { shouldCreateUser: false }, // invite-only: no new accounts via OTP
	});
	return { error: error ? friendlyAuthError(error) : null };
}

export async function verifyOtp(
	email: string,
	token: string,
): Promise<{ error: string }> {
	const supabase = await createClient();
	const { error } = await supabase.auth.verifyOtp({
		email: email.trim().toLowerCase(),
		token,
		type: "email",
	});

	if (error) {
		return { error: friendlyAuthError(error) };
	}

	const user = await currentDbUser();

	if (user.role === "super_admin") {
		redirect("/dashboard/admin/mentors");
	} else {
		redirect("/dashboard/mentor");
	}
}

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/dashboard/login");
}

/** Gets the Supabase auth user. Calls unauthorized() if not logged in. */
export const currentUser = cache(async (): Promise<User> => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (user) return user;
	unauthorized();
});

/** Gets the public.users row that matches the Supabase auth user. */
export const currentDbUser = cache(async () => {
	const user = await currentUser();
	const dbUser = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, user.id))
		.limit(1)
		.then((rows) => rows[0] ?? null);
	if (!dbUser) unauthorized();
	return dbUser;
});

/**
 * Resolves the signed-in user's capabilities without changing their persisted
 * role. A linked mentor record is the mentor capability, so a super admin can
 * also act as their own mentor when they have one.
 */
export const currentUserCapabilities = cache(async () => {
	const user = await currentDbUser();
	const mentor = await db.query.mentors.findFirst({
		where: and(
			eq(schema.mentors.user_id, user.id),
			eq(schema.mentors.archived, false),
		),
	});

	return {
		user,
		mentor,
		isAdmin: user.role === "super_admin",
		isMentor: Boolean(mentor),
	};
});

/**
 * Resolves capabilities for pages that are public by default. Unlike
 * `currentUserCapabilities`, an anonymous visitor simply receives `null`.
 */
export const optionalUserCapabilities = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user: authUser },
	} = await supabase.auth.getUser();
	if (!authUser) return null;

	const user = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.auth_user_id, authUser.id))
		.limit(1)
		.then((rows) => rows[0] ?? null);
	if (!user) return null;

	const mentor = await db.query.mentors.findFirst({
		where: and(
			eq(schema.mentors.user_id, user.id),
			eq(schema.mentors.archived, false),
		),
	});

	return {
		user,
		mentor,
		isAdmin: user.role === "super_admin",
	};
});

/** Gets the owned mentor record for the signed-in user, or rejects the request. */
export const currentDbMentor = cache(async () => {
	const { user, mentor } = await currentUserCapabilities();
	if (!mentor) unauthorized();
	return { user, mentor };
});
