import {
	type GoogleIdentity,
	GoogleOAuthProviderError,
	type GoogleOAuthTokenResponse,
	MENTOR_GOOGLE_CALENDAR_SCOPE,
	MentorGoogleOAuthError,
	type MentorGoogleOAuthProvider,
} from "@/src/lib/mentor-google-oauth-core";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_REVOCATION_URL = "https://oauth2.googleapis.com/revoke";

type MentorOAuthConfig = {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
};

export function requireMentorGoogleOAuthConfig(): MentorOAuthConfig {
	const clientId = process.env.MENTOR_GOOGLE_OAUTH_CLIENT_ID;
	const clientSecret = process.env.MENTOR_GOOGLE_OAUTH_CLIENT_SECRET;
	const redirectUri = process.env.MENTOR_GOOGLE_OAUTH_REDIRECT_URI;
	if (!clientId || !clientSecret || !redirectUri) {
		throw new Error("Mentor Google OAuth is not configured");
	}

	let parsedRedirect: URL;
	try {
		parsedRedirect = new URL(redirectUri);
	} catch {
		throw new Error("MENTOR_GOOGLE_OAUTH_REDIRECT_URI is invalid");
	}
	const localDevelopment =
		process.env.NODE_ENV !== "production" &&
		(parsedRedirect.hostname === "localhost" ||
			parsedRedirect.hostname === "127.0.0.1");
	if (parsedRedirect.protocol !== "https:" && !localDevelopment) {
		throw new Error("MENTOR_GOOGLE_OAUTH_REDIRECT_URI must use HTTPS");
	}
	if (
		parsedRedirect.search ||
		parsedRedirect.hash ||
		parsedRedirect.pathname !== "/api/mentor/google-calendar/callback"
	) {
		throw new Error(
			"MENTOR_GOOGLE_OAUTH_REDIRECT_URI must be the exact callback URL",
		);
	}

	return { clientId, clientSecret, redirectUri };
}

function jsonString(value: unknown, key: string): string | undefined {
	if (!value || typeof value !== "object") return undefined;
	const candidate = (value as Record<string, unknown>)[key];
	return typeof candidate === "string" ? candidate : undefined;
}

async function responseJson(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return undefined;
	}
}

function providerError(responseBody: unknown): GoogleOAuthProviderError {
	return new GoogleOAuthProviderError(
		jsonString(responseBody, "error") === "invalid_grant"
			? "invalid_grant"
			: "provider_error",
	);
}

async function postTokenRequest(
	body: URLSearchParams,
	fallbackScopes?: string[],
	fetchImpl: typeof fetch = fetch,
): Promise<GoogleOAuthTokenResponse> {
	let response: Response;
	try {
		response = await fetchImpl(GOOGLE_TOKEN_URL, {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body,
			cache: "no-store",
		});
	} catch {
		throw new GoogleOAuthProviderError("provider_error");
	}
	const payload = await responseJson(response);
	if (!response.ok) throw providerError(payload);

	const accessToken = jsonString(payload, "access_token");
	const scope = jsonString(payload, "scope") ?? fallbackScopes?.join(" ");
	const refreshToken = jsonString(payload, "refresh_token");
	if (!accessToken || !scope) {
		throw new GoogleOAuthProviderError("provider_error");
	}

	return {
		accessToken,
		refreshToken,
		scopes: scope.split(/\s+/).filter(Boolean),
	};
}

export function createMentorGoogleOAuthProvider(
	fetchImpl: typeof fetch = fetch,
): MentorGoogleOAuthProvider {
	return {
		async exchangeCode({ code, codeVerifier }) {
			const config = requireMentorGoogleOAuthConfig();
			return postTokenRequest(
				new URLSearchParams({
					code,
					client_id: config.clientId,
					client_secret: config.clientSecret,
					redirect_uri: config.redirectUri,
					grant_type: "authorization_code",
					code_verifier: codeVerifier,
				}),
				undefined,
				fetchImpl,
			);
		},

		async refreshAccessToken(refreshToken) {
			const config = requireMentorGoogleOAuthConfig();
			return postTokenRequest(
				new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					refresh_token: refreshToken,
					grant_type: "refresh_token",
				}),
				[MENTOR_GOOGLE_CALENDAR_SCOPE],
				fetchImpl,
			);
		},

		async getIdentity(accessToken): Promise<GoogleIdentity> {
			let response: Response;
			try {
				response = await fetchImpl(GOOGLE_USERINFO_URL, {
					headers: { authorization: `Bearer ${accessToken}` },
					cache: "no-store",
				});
			} catch {
				throw new GoogleOAuthProviderError("provider_error");
			}
			const payload = await responseJson(response);
			if (!response.ok) throw providerError(payload);
			const email = jsonString(payload, "email");
			const subject = jsonString(payload, "sub");
			if (!email || !subject) {
				throw new GoogleOAuthProviderError("provider_error");
			}
			return { email, subject };
		},

		async revokeRefreshToken(refreshToken) {
			let response: Response;
			try {
				response = await fetchImpl(GOOGLE_REVOCATION_URL, {
					method: "POST",
					headers: { "content-type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({ token: refreshToken }),
					cache: "no-store",
				});
			} catch {
				throw new GoogleOAuthProviderError("provider_error");
			}
			if (!response.ok) throw providerError(await responseJson(response));
		},
	};
}

export function mentorGoogleOAuthErrorReason(error: unknown): string {
	if (error instanceof MentorGoogleOAuthError) return error.code;
	return "oauth_failed";
}
