// Server-only: OAuth credentials, database access, and Google token exchange live here.

import { currentDbUser } from "@/src/auth";
import { db } from "@/src/db";
import {
	mentorGoogleConnections,
	mentorGoogleOAuthStates,
} from "@/src/db/schema/tables/mentor-google-connections";
import { mentors } from "@/src/db/schema/tables/mentors";
import { users } from "@/src/db/schema/tables/users";
import {
	decryptMentorGoogleSecret,
	decryptMentorRefreshToken,
	encryptMentorGoogleSecret,
	encryptMentorRefreshToken,
} from "@/src/lib/mentor-google-crypto";
import { sendMentorGoogleReconnectNoticeOnce } from "@/src/lib/mentor-google-notifications";
import {
	type ConsumedOAuthState,
	type GoogleIdentity,
	GoogleOAuthProviderError,
	type GoogleOAuthTokenResponse,
	MENTOR_GOOGLE_CALENDAR_ID,
	MENTOR_GOOGLE_CALENDAR_SCOPE,
	MENTOR_GOOGLE_REQUIRED_SCOPES,
	type MentorGoogleConnectionRecord,
	MentorGoogleOAuthError,
	type MentorGoogleOAuthProvider,
	type MentorGoogleOAuthRepository,
	completeMentorGoogleOAuthCallback,
	createOAuthState,
	getMentorGoogleAccessToken as getCoreMentorGoogleAccessToken,
	hashOAuthState,
	revokeMentorGoogleCredential,
} from "@/src/lib/mentor-google-oauth-core";
import { and, eq, isNull, lt } from "drizzle-orm";

const GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_REVOCATION_URL = "https://oauth2.googleapis.com/revoke";

type MentorOAuthConfig = {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
};

function normalizedEmail(email: string): string {
	return email.trim().toLowerCase();
}

function requireConfig(): MentorOAuthConfig {
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
			const config = requireConfig();
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
			const config = requireConfig();
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

const googleProvider = createMentorGoogleOAuthProvider();

function asConnectionRecord(
	row: typeof mentorGoogleConnections.$inferSelect,
): MentorGoogleConnectionRecord {
	return {
		mentorId: row.mentor_id,
		userId: row.user_id,
		googleSubject: row.google_subject,
		googleEmail: row.google_email,
		refreshTokenCiphertext: row.refresh_token_ciphertext,
		status: row.status,
		revocationState: row.revocation_state,
	};
}

const repository: MentorGoogleOAuthRepository = {
	async consumeOAuthState(stateHash, now): Promise<ConsumedOAuthState | null> {
		const [row] = await db
			.update(mentorGoogleOAuthStates)
			.set({ used_at: now })
			.where(
				and(
					eq(mentorGoogleOAuthStates.state_hash, stateHash),
					isNull(mentorGoogleOAuthStates.used_at),
				),
			)
			.returning();
		if (!row) return null;

		return {
			mentorId: row.mentor_id,
			userId: row.user_id,
			returnPath: row.return_path,
			codeVerifier: decryptMentorGoogleSecret(
				row.code_verifier_ciphertext,
				row.mentor_id,
				"pkce-verifier",
			),
			allowAccountChange: row.allow_account_change,
			expiresAt: row.expires_at,
		};
	},

	async getConnectionByMentor(mentorId) {
		const [row] = await db
			.select()
			.from(mentorGoogleConnections)
			.where(eq(mentorGoogleConnections.mentor_id, mentorId))
			.limit(1);
		return row ? asConnectionRecord(row) : null;
	},

	async getConnectionByGoogleSubject(googleSubject) {
		const [row] = await db
			.select()
			.from(mentorGoogleConnections)
			.where(eq(mentorGoogleConnections.google_subject, googleSubject))
			.limit(1);
		return row ? asConnectionRecord(row) : null;
	},

	async linkConnection(input) {
		const [mentor] = await db
			.select({ userId: mentors.user_id, userEmail: users.email })
			.from(mentors)
			.innerJoin(users, eq(users.id, mentors.user_id))
			.where(eq(mentors.id, input.mentorId))
			.limit(1);
		if (!mentor || mentor.userId !== input.userId) {
			throw new MentorGoogleOAuthError("state_mentor_mismatch");
		}
		if (
			normalizedEmail(mentor.userEmail) !== normalizedEmail(input.googleEmail)
		) {
			throw new MentorGoogleOAuthError("google_account_conflict");
		}
		const existing = await this.getConnectionByMentor(input.mentorId);
		if (existing) {
			const subjectChanged =
				Boolean(existing.googleSubject && input.googleSubject) &&
				existing.googleSubject !== input.googleSubject;
			const emailChanged =
				normalizedEmail(existing.googleEmail) !==
				normalizedEmail(input.googleEmail);
			const accountChangeAllowed =
				input.allowAccountChange &&
				(existing.status === "disconnected" || existing.status === "revoked") &&
				existing.revocationState !== "pending";
			if ((subjectChanged || emailChanged) && !accountChangeAllowed) {
				throw new MentorGoogleOAuthError("google_account_conflict");
			}
			await db
				.update(mentorGoogleConnections)
				.set({
					user_id: input.userId,
					google_subject: input.googleSubject,
					google_email: input.googleEmail,
					refresh_token_ciphertext: input.refreshTokenCiphertext,
					granted_scopes: input.grantedScopes,
					status: "connected",
					reauthorization_state: "not_required",
					revocation_state: "not_pending",
					revocation_error_code: null,
					last_error_code: null,
					connected_at: input.now,
					last_token_refresh_at: null,
					reauthorization_required_at: null,
					reauthorization_notice_sent_at: null,
					revoked_at: null,
					disconnected_at: null,
					updated_at: input.now,
				})
				.where(eq(mentorGoogleConnections.mentor_id, input.mentorId));
			return;
		}

		await db.insert(mentorGoogleConnections).values({
			mentor_id: input.mentorId,
			user_id: input.userId,
			google_subject: input.googleSubject,
			google_email: input.googleEmail,
			refresh_token_ciphertext: input.refreshTokenCiphertext,
			granted_scopes: input.grantedScopes,
			status: "connected",
			reauthorization_state: "not_required",
			revocation_state: "not_pending",
			connected_at: input.now,
			updated_at: input.now,
		});
	},

	async markReauthorizationRequired(mentorId, now) {
		await db
			.update(mentorGoogleConnections)
			.set({
				status: "reauth_required",
				reauthorization_state: "required",
				last_error_code: "invalid_grant",
				reauthorization_required_at: now,
				updated_at: now,
			})
			.where(eq(mentorGoogleConnections.mentor_id, mentorId));
	},
};

async function currentMentorContext(): Promise<{
	mentorId: string;
	userId: string;
	mentorEmail: string;
}> {
	const user = await currentDbUser();
	if (user.role !== "mentor") throw new Error("Mentor authorization required");
	const [mentor] = await db
		.select({ id: mentors.id })
		.from(mentors)
		.where(eq(mentors.user_id, user.id))
		.limit(1);
	if (!mentor) throw new Error("Mentor profile not found");
	return { mentorId: mentor.id, userId: user.id, mentorEmail: user.email };
}

export type MentorGoogleConnectionStatusView = {
	status: MentorGoogleConnectionRecord["status"] | "not_connected";
	googleEmail: string | null;
	googleSubjectLinked: boolean;
	grantedScopes: string[];
	reauthorizationRequired: boolean;
	revocationPending: boolean;
	canRetryRevocation: boolean;
	connectedAt: string | null;
	canUseForBookings: boolean;
};

export async function getMentorGoogleConnectionStatus(): Promise<MentorGoogleConnectionStatusView> {
	const { mentorId } = await currentMentorContext();
	const connection = await repository.getConnectionByMentor(mentorId);
	if (!connection) {
		return {
			status: "not_connected",
			googleEmail: null,
			googleSubjectLinked: false,
			grantedScopes: [],
			reauthorizationRequired: false,
			revocationPending: false,
			canRetryRevocation: false,
			connectedAt: null,
			canUseForBookings: false,
		};
	}
	const [row] = await db
		.select({ connectedAt: mentorGoogleConnections.connected_at })
		.from(mentorGoogleConnections)
		.where(eq(mentorGoogleConnections.mentor_id, mentorId))
		.limit(1);
	return {
		status: connection.status,
		googleEmail: connection.googleEmail,
		googleSubjectLinked: Boolean(connection.googleSubject),
		grantedScopes:
			connection.status === "connected" ? await getScopes(mentorId) : [],
		reauthorizationRequired: connection.status === "reauth_required",
		revocationPending: connection.revocationState === "pending",
		canRetryRevocation: connection.revocationState === "pending",
		connectedAt: row?.connectedAt?.toISOString() ?? null,
		canUseForBookings: connection.status === "connected",
	};
}

async function getScopes(mentorId: string): Promise<string[]> {
	const [row] = await db
		.select({ scopes: mentorGoogleConnections.granted_scopes })
		.from(mentorGoogleConnections)
		.where(eq(mentorGoogleConnections.mentor_id, mentorId))
		.limit(1);
	return row?.scopes ?? [];
}

export async function startMentorGoogleOAuth(input?: {
	returnPath?: string;
	forceConsent?: boolean;
}): Promise<string> {
	const config = requireConfig();
	const { mentorId, userId } = await currentMentorContext();
	const existing = await repository.getConnectionByMentor(mentorId);
	if (existing?.revocationState === "pending") {
		throw new MentorGoogleOAuthError("revocation_pending");
	}
	const state = createOAuthState({
		returnPath: input?.returnPath,
		allowAccountChange:
			existing?.status === "disconnected" || existing?.status === "revoked",
	});

	await db
		.delete(mentorGoogleOAuthStates)
		.where(
			and(
				eq(mentorGoogleOAuthStates.mentor_id, mentorId),
				lt(mentorGoogleOAuthStates.expires_at, new Date()),
			),
		);
	await db.insert(mentorGoogleOAuthStates).values({
		state_hash: state.stateHash,
		mentor_id: mentorId,
		user_id: userId,
		return_path: state.returnPath,
		code_verifier_ciphertext: encryptMentorGoogleSecret(
			state.codeVerifier,
			mentorId,
			"pkce-verifier",
		),
		allow_account_change: state.allowAccountChange,
		expires_at: state.expiresAt,
	});

	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.redirectUri,
		response_type: "code",
		scope: MENTOR_GOOGLE_REQUIRED_SCOPES.join(" "),
		access_type: "offline",
		include_granted_scopes: "true",
		state: state.state,
		code_challenge: state.codeChallenge,
		code_challenge_method: "S256",
	});
	if (input?.forceConsent) params.set("prompt", "consent");
	return `${GOOGLE_AUTHORIZATION_URL}?${params.toString()}`;
}

export async function finishMentorGoogleOAuth(input: {
	state: string;
	code: string | null;
}): Promise<{ returnPath: string }> {
	const { mentorId, userId } = await currentMentorContext();
	return completeMentorGoogleOAuthCallback({
		...input,
		authenticatedMentorId: mentorId,
		authenticatedUserId: userId,
		repository,
		provider: googleProvider,
		encryptRefreshToken: encryptMentorRefreshToken,
	});
}

export async function getMentorGoogleCalendarContext(): Promise<{
	calendarId: typeof MENTOR_GOOGLE_CALENDAR_ID;
	accessToken: string;
	scopes: string[];
}> {
	const { mentorId, mentorEmail } = await currentMentorContext();
	const connection = await repository.getConnectionByMentor(mentorId);
	let token: Awaited<ReturnType<typeof getCoreMentorGoogleAccessToken>>;
	try {
		token = await getCoreMentorGoogleAccessToken({
			connection,
			provider: googleProvider,
			decryptRefreshToken: decryptMentorRefreshToken,
			markReauthorizationRequired: () =>
				repository.markReauthorizationRequired(mentorId, new Date()),
		});
	} catch (error) {
		const [row] = await db
			.select({ id: mentorGoogleConnections.id })
			.from(mentorGoogleConnections)
			.where(eq(mentorGoogleConnections.mentor_id, mentorId))
			.limit(1);
		if (row) {
			await sendMentorGoogleReconnectNoticeOnce({
				connectionId: row.id,
				mentorEmail,
			});
		}
		throw error;
	}
	const now = new Date();
	await db
		.update(mentorGoogleConnections)
		.set({ last_token_refresh_at: now, updated_at: now })
		.where(eq(mentorGoogleConnections.mentor_id, mentorId));
	return { calendarId: MENTOR_GOOGLE_CALENDAR_ID, ...token };
}

export async function disconnectMentorGoogleConnection(input: {
	status: "disconnected" | "revoked";
}): Promise<{
	status: "disconnected" | "revoked" | "not_connected";
	remoteRevocation: "not_attempted" | "succeeded" | "failed";
	retryPending: boolean;
}> {
	const { mentorId } = await currentMentorContext();
	const connection = await repository.getConnectionByMentor(mentorId);
	if (!connection)
		return {
			status: "not_connected",
			remoteRevocation: "not_attempted",
			retryPending: false,
		};

	const revocation = await revokeMentorGoogleCredential({
		connection,
		desiredStatus: input.status,
		provider: googleProvider,
		decryptRefreshToken: decryptMentorRefreshToken,
	});

	const now = new Date();
	await db
		.update(mentorGoogleConnections)
		.set({
			status: revocation.status,
			reauthorization_state:
				revocation.status === "revoked" ? "required" : "not_required",
			refresh_token_ciphertext: revocation.retainCiphertext
				? connection.refreshTokenCiphertext
				: null,
			revocation_state: revocation.revocationState,
			revocation_error_code: revocation.revocationErrorCode,
			last_error_code: revocation.retainCiphertext ? "revoke_failed" : null,
			revoked_at: revocation.status === "revoked" ? now : null,
			disconnected_at: revocation.status === "disconnected" ? now : null,
			updated_at: now,
		})
		.where(eq(mentorGoogleConnections.mentor_id, mentorId));

	return {
		status: revocation.status,
		remoteRevocation: revocation.remoteRevocation,
		retryPending: revocation.revocationState === "pending",
	};
}

/**
 * Protected retry action for a retained refresh token after a failed remote
 * revocation. It never starts OAuth and returns a safe status-only result.
 */
export async function retryMentorGoogleRevocation(): Promise<{
	status: "disconnected" | "revoked" | "not_connected";
	remoteRevocation: "not_attempted" | "succeeded" | "failed";
	retryPending: boolean;
}> {
	const { mentorId } = await currentMentorContext();
	const connection = await repository.getConnectionByMentor(mentorId);
	if (!connection) {
		return {
			status: "not_connected",
			remoteRevocation: "not_attempted",
			retryPending: false,
		};
	}
	if (connection.revocationState !== "pending") {
		return {
			status: connection.status === "revoked" ? "revoked" : "disconnected",
			remoteRevocation: "not_attempted",
			retryPending: false,
		};
	}
	return disconnectMentorGoogleConnection({ status: "revoked" });
}

export function mentorGoogleOAuthErrorReason(error: unknown): string {
	if (error instanceof MentorGoogleOAuthError) return error.code;
	return "oauth_failed";
}

export { MENTOR_GOOGLE_CALENDAR_ID, hashOAuthState };
