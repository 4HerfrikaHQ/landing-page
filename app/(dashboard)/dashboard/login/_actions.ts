"use server";

import { createClient, currentDbUser } from "@/src/auth";
import { db, schema } from "@/src/db";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import type { AuthError } from "@supabase/supabase-js";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SendLoginCodeSchema, VerifyLoginCodeSchema } from "./_schema";

const RESEND_COOLDOWN_SECONDS = 60;

async function isStaffEmail(email: string) {
	const [staff] = await db
		.select({ id: schema.users.id })
		.from(schema.users)
		.where(sql`lower(${schema.users.email}) = lower(${email.trim()})`)
		.limit(1);
	return Boolean(staff);
}

function friendlyAuthError(error: AuthError) {
	switch (error.code) {
		case "otp_disabled":
		case "user_not_found":
			return new ActionError("user_not_found");
		case "otp_expired":
			return new ActionError("otp_expired");
		case "over_email_send_rate_limit":
			return new ActionError("email_limit");
		case "over_request_rate_limit":
			return new ActionError("too_many_attempts");
		default:
			return error;
	}
}

export const sendLoginCode = actionClient
	.schema(SendLoginCodeSchema)
	.action(async ({ parsedInput: { email } }) => {
		if (!(await isStaffEmail(email))) throw new ActionError("user_not_found");
		const supabase = await createClient();
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: { shouldCreateUser: false },
		});
		if (error) {
			const retryAfter = error.message.match(/after (\d+) seconds?/)?.[1];
			if (retryAfter) {
				return { email, retryAfter: Number(retryAfter), alreadySent: true };
			}
			throw friendlyAuthError(error);
		}
		return { email, retryAfter: RESEND_COOLDOWN_SECONDS, alreadySent: false };
	});

export const verifyLoginCode = actionClient
	.schema(VerifyLoginCodeSchema)
	.action(async ({ parsedInput: { email, code } }) => {
		const supabase = await createClient();
		const { error } = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "email",
		});
		if (error) throw friendlyAuthError(error);

		const user = await currentDbUser();
		redirect(
			user.role === "super_admin"
				? "/dashboard/admin/mentors"
				: "/dashboard/mentor",
		);
	});
