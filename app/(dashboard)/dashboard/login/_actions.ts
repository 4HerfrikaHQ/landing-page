"use server";

import { createClient, currentDbUser } from "@/src/auth";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import type { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { SendLoginCodeSchema, VerifyLoginCodeSchema } from "./_schema";

const RESEND_COOLDOWN_SECONDS = 60;

function friendlyAuthError(error: AuthError) {
	switch (error.code) {
		case "otp_disabled":
		case "user_not_found":
			return new ActionError(
				"We couldn't find a mentor account for this email. Use the email address your invite was sent to.",
			);
		case "otp_expired":
			return new ActionError(
				"That code didn't work. It may be mistyped or expired. Check your most recent email, or send a new code.",
			);
		case "over_email_send_rate_limit":
			return new ActionError(
				"We've sent a lot of sign-in emails in the last hour. Please try again in a little while, or email 4herfrika@gmail.com for help.",
			);
		case "over_request_rate_limit":
			return new ActionError(
				"Too many attempts. Please wait a few minutes and try again.",
			);
		default:
			return error;
	}
}

export const sendLoginCode = actionClient
	.schema(SendLoginCodeSchema)
	.action(async ({ parsedInput: { email } }) => {
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
