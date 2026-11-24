"use server";

import { createClient } from "@/src/auth";
import { ActionError, actionClient } from "@/src/lib/safe-action";
import type { AuthError } from "@supabase/supabase-js";
import type { Route } from "next";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { afterSignInPath } from "../_learner";
import {
	ACADEMY_HOME_PATH,
	callbackUrl,
	localizedPath,
	resolveNext,
} from "./_helpers";
import {
	ContinueWithGoogleSchema,
	RESEND_COOLDOWN_SECONDS,
	SendLearnerCodeSchema,
	VerifyLearnerCodeSchema,
} from "./_schema";

const FALLBACK_SITE_URL = "https://4herfrika.org";

function friendlyAuthError(error: AuthError) {
	switch (error.code) {
		case "otp_expired":
			return new ActionError("otp_expired");
		case "email_address_invalid":
			return new ActionError("invalid_email");
		case "over_email_send_rate_limit":
			return new ActionError("email_limit");
		case "over_request_rate_limit":
			return new ActionError("too_many_attempts");
		default:
			return error;
	}
}

async function requestOrigin() {
	const requestHeaders = await headers();
	return (
		requestHeaders.get("origin") ??
		process.env.NEXT_PUBLIC_SITE_URL ??
		FALLBACK_SITE_URL
	);
}

async function resolveTarget(next: string | undefined) {
	const locale = await getLocale();
	return resolveNext(next, localizedPath(locale, ACADEMY_HOME_PATH));
}

export const sendLearnerCode = actionClient
	.schema(SendLearnerCodeSchema)
	.action(async ({ parsedInput: { email, next } }) => {
		const [origin, target] = await Promise.all([
			requestOrigin(),
			resolveTarget(next),
		]);
		const supabase = await createClient();
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				shouldCreateUser: true,
				emailRedirectTo: callbackUrl(origin, target),
			},
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

export const verifyLearnerCode = actionClient
	.schema(VerifyLearnerCodeSchema)
	.action(async ({ parsedInput: { email, code, next } }) => {
		const target = await resolveTarget(next);
		const supabase = await createClient();
		const { data, error } = await supabase.auth.verifyOtp({
			email,
			token: code,
			type: "email",
		});
		if (error || !data.user) {
			throw error ? friendlyAuthError(error) : new ActionError("otp_expired");
		}
		redirect(await afterSignInPath(data.user.id, target));
	});

export const continueWithGoogle = actionClient
	.schema(ContinueWithGoogleSchema)
	.action(async ({ parsedInput: { next } }) => {
		const [origin, target] = await Promise.all([
			requestOrigin(),
			resolveTarget(next),
		]);
		const supabase = await createClient();
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: callbackUrl(origin, target),
				skipBrowserRedirect: true,
			},
		});
		if (error) throw friendlyAuthError(error);
		redirect(data.url as Route);
	});
