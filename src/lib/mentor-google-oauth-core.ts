import { createHash, randomBytes } from "node:crypto";

export const MENTOR_GOOGLE_CALENDAR_SCOPE =
	"https://www.googleapis.com/auth/calendar.events.owned" as const;
export const MENTOR_GOOGLE_OPENID_SCOPE = "openid" as const;
export const MENTOR_GOOGLE_EMAIL_SCOPE =
	"https://www.googleapis.com/auth/userinfo.email" as const;
export const MENTOR_GOOGLE_REQUIRED_SCOPES = [
	MENTOR_GOOGLE_CALENDAR_SCOPE,
	MENTOR_GOOGLE_OPENID_SCOPE,
	MENTOR_GOOGLE_EMAIL_SCOPE,
] as const;
export const MENTOR_GOOGLE_CALENDAR_ID = "primary" as const;
export const MENTOR_GOOGLE_DEFAULT_STATE_TTL_SECONDS = 600;

export type MentorGoogleOAuthErrorCode =
	| "invalid_state"
	| "expired_state"
	| "state_mentor_mismatch"
	| "oauth_denied"
	| "invalid_grant"
	| "oauth_exchange_failed"
	| "identity_lookup_failed"
	| "insufficient_scope"
	| "refresh_token_missing"
	| "google_account_conflict"
	| "identity_subject_missing"
	| "revocation_pending"
	| "connection_unavailable";

export class MentorGoogleOAuthError extends Error {
	readonly code: MentorGoogleOAuthErrorCode;
	readonly returnPath?: string;

	constructor(code: MentorGoogleOAuthErrorCode, returnPath?: string) {
		super(code);
		this.name = "MentorGoogleOAuthError";
		this.code = code;
		this.returnPath = returnPath;
	}
}

export class GoogleOAuthProviderError extends Error {
	readonly code: "invalid_grant" | "provider_error";

	constructor(code: "invalid_grant" | "provider_error") {
		super(code);
		this.name = "GoogleOAuthProviderError";
		this.code = code;
	}
}

export function isInvalidGrantError(error: unknown): boolean {
	return (
		error instanceof GoogleOAuthProviderError && error.code === "invalid_grant"
	);
}

export function normalizeGoogleScopes(scopeValue: string | string[]): string[] {
	const values = Array.isArray(scopeValue)
		? scopeValue
		: scopeValue.split(/\s+/);
	return [
		...new Set(
			values
				.map((scope) => scope.trim())
				.filter(Boolean)
				.map((scope) =>
					scope === "email" ? MENTOR_GOOGLE_EMAIL_SCOPE : scope,
				),
		),
	].sort();
}

export function hasRequiredMentorGoogleScopes(scopes: string[]): boolean {
	const normalizedScopes = normalizeGoogleScopes(scopes);
	return MENTOR_GOOGLE_REQUIRED_SCOPES.every((scope) =>
		normalizedScopes.includes(scope),
	);
}

export function hasMentorGoogleCalendarScope(scopes: string[]): boolean {
	return scopes.includes(MENTOR_GOOGLE_CALENDAR_SCOPE);
}

export function isSameOriginMutationRequest(input: {
	origin: string | null;
	requestOrigin: string;
}): boolean {
	return Boolean(input.origin) && input.origin === input.requestOrigin;
}

export function safeMentorReturnPath(value: string | null | undefined): string {
	const path = value?.trim() || "/dashboard/mentor";
	if (!path.startsWith("/dashboard/mentor") || path.startsWith("//")) {
		return "/dashboard/mentor";
	}
	return path;
}

export function hashOAuthState(state: string): string {
	return createHash("sha256").update(state, "utf8").digest("hex");
}

export type CreatedOAuthState = {
	state: string;
	stateHash: string;
	codeVerifier: string;
	codeChallenge: string;
	expiresAt: Date;
	returnPath: string;
	allowAccountChange: boolean;
};

export function createOAuthState(input: {
	now?: Date;
	ttlSeconds?: number;
	returnPath?: string;
	allowAccountChange?: boolean;
}): CreatedOAuthState {
	const ttlSeconds =
		input.ttlSeconds ?? MENTOR_GOOGLE_DEFAULT_STATE_TTL_SECONDS;
	if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > 900) {
		throw new Error("OAuth state TTL must be between 1 and 900 seconds");
	}

	const state = randomBytes(32).toString("base64url");
	const codeVerifier = randomBytes(32).toString("base64url");
	const codeChallenge = createHash("sha256")
		.update(codeVerifier, "ascii")
		.digest("base64url");
	const now = input.now ?? new Date();

	return {
		state,
		stateHash: hashOAuthState(state),
		codeVerifier,
		codeChallenge,
		expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
		returnPath: safeMentorReturnPath(input.returnPath),
		allowAccountChange: input.allowAccountChange ?? false,
	};
}

export type GoogleOAuthTokenResponse = {
	accessToken: string;
	refreshToken?: string;
	scopes: string[];
};

export type GoogleIdentity = {
	subject?: string;
	email: string;
};

export type MentorGoogleConnectionRecord = {
	mentorId: string;
	userId: string;
	googleSubject: string;
	googleEmail: string;
	refreshTokenCiphertext: string | null;
	status: "connected" | "reauth_required" | "revoked" | "disconnected";
	revocationState?: "not_pending" | "pending";
};

export type ConsumedOAuthState = {
	mentorId: string;
	userId: string;
	returnPath: string;
	codeVerifier: string;
	allowAccountChange: boolean;
	expiresAt: Date;
};

export type MentorGoogleOAuthRepository = {
	consumeOAuthState(
		stateHash: string,
		now: Date,
	): Promise<ConsumedOAuthState | null>;
	getConnectionByMentor(
		mentorId: string,
	): Promise<MentorGoogleConnectionRecord | null>;
	getConnectionByGoogleSubject(
		googleSubject: string,
	): Promise<MentorGoogleConnectionRecord | null>;
	linkConnection(input: {
		mentorId: string;
		userId: string;
		googleSubject: string;
		googleEmail: string;
		refreshTokenCiphertext: string;
		grantedScopes: string[];
		allowAccountChange: boolean;
		now: Date;
	}): Promise<void>;
	markReauthorizationRequired(mentorId: string, now: Date): Promise<void>;
};

export type MentorGoogleOAuthProvider = {
	exchangeCode(input: {
		code: string;
		codeVerifier: string;
	}): Promise<GoogleOAuthTokenResponse>;
	getIdentity(accessToken: string): Promise<GoogleIdentity>;
	refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokenResponse>;
	revokeRefreshToken(refreshToken: string): Promise<void>;
};

function normalizedEmail(email: string): string {
	return email.trim().toLowerCase();
}

export async function completeMentorGoogleOAuthCallback(input: {
	state: string;
	code: string | null;
	authenticatedMentorId: string;
	authenticatedUserId: string;
	now?: Date;
	repository: MentorGoogleOAuthRepository;
	provider: MentorGoogleOAuthProvider;
	encryptRefreshToken: (refreshToken: string, mentorId: string) => string;
}): Promise<{ returnPath: string }> {
	const now = input.now ?? new Date();
	const consumed = await input.repository.consumeOAuthState(
		hashOAuthState(input.state),
		now,
	);
	if (!consumed) throw new MentorGoogleOAuthError("invalid_state");
	if (consumed.expiresAt.getTime() <= now.getTime()) {
		throw new MentorGoogleOAuthError("expired_state", consumed.returnPath);
	}
	if (
		consumed.mentorId !== input.authenticatedMentorId ||
		consumed.userId !== input.authenticatedUserId
	) {
		throw new MentorGoogleOAuthError(
			"state_mentor_mismatch",
			consumed.returnPath,
		);
	}
	if (!input.code) {
		throw new MentorGoogleOAuthError("oauth_denied", consumed.returnPath);
	}

	let tokenResponse: GoogleOAuthTokenResponse;
	try {
		tokenResponse = await input.provider.exchangeCode({
			code: input.code,
			codeVerifier: consumed.codeVerifier,
		});
	} catch (error) {
		if (isInvalidGrantError(error)) {
			throw new MentorGoogleOAuthError("invalid_grant", consumed.returnPath);
		}
		throw new MentorGoogleOAuthError(
			"oauth_exchange_failed",
			consumed.returnPath,
		);
	}

	if (!hasRequiredMentorGoogleScopes(tokenResponse.scopes)) {
		throw new MentorGoogleOAuthError("insufficient_scope", consumed.returnPath);
	}

	let identity: GoogleIdentity;
	try {
		identity = await input.provider.getIdentity(tokenResponse.accessToken);
	} catch {
		throw new MentorGoogleOAuthError(
			"identity_lookup_failed",
			consumed.returnPath,
		);
	}

	const email = normalizedEmail(identity.email);
	if (!email)
		throw new MentorGoogleOAuthError(
			"identity_lookup_failed",
			consumed.returnPath,
		);

	const existing = await input.repository.getConnectionByMentor(
		input.authenticatedMentorId,
	);
	if (existing && existing.userId !== input.authenticatedUserId) {
		throw new MentorGoogleOAuthError(
			"state_mentor_mismatch",
			consumed.returnPath,
		);
	}
	const subject = identity.subject?.trim();
	if (!subject) {
		throw new MentorGoogleOAuthError(
			"identity_subject_missing",
			consumed.returnPath,
		);
	}
	const subjectOwner =
		await input.repository.getConnectionByGoogleSubject(subject);
	if (subjectOwner && subjectOwner.mentorId !== input.authenticatedMentorId) {
		throw new MentorGoogleOAuthError(
			"google_account_conflict",
			consumed.returnPath,
		);
	}

	if (existing) {
		const subjectChanged =
			Boolean(existing.googleSubject && subject) &&
			existing.googleSubject !== subject;
		const emailChanged = normalizedEmail(existing.googleEmail) !== email;
		const accountChangeAllowed =
			consumed.allowAccountChange &&
			(existing.status === "disconnected" || existing.status === "revoked") &&
			existing.revocationState !== "pending";
		if ((subjectChanged || emailChanged) && !accountChangeAllowed) {
			throw new MentorGoogleOAuthError(
				"google_account_conflict",
				consumed.returnPath,
			);
		}
	}

	const encryptedRefreshToken = tokenResponse.refreshToken
		? input.encryptRefreshToken(
				tokenResponse.refreshToken,
				input.authenticatedMentorId,
			)
		: existing?.refreshTokenCiphertext;
	if (!encryptedRefreshToken) {
		throw new MentorGoogleOAuthError(
			"refresh_token_missing",
			consumed.returnPath,
		);
	}

	await input.repository.linkConnection({
		mentorId: input.authenticatedMentorId,
		userId: input.authenticatedUserId,
		googleSubject: subject,
		googleEmail: email,
		refreshTokenCiphertext: encryptedRefreshToken,
		grantedScopes: normalizeGoogleScopes(tokenResponse.scopes),
		allowAccountChange: consumed.allowAccountChange,
		now,
	});

	return { returnPath: consumed.returnPath };
}

export async function getMentorGoogleAccessToken(input: {
	connection: MentorGoogleConnectionRecord | null;
	provider: MentorGoogleOAuthProvider;
	decryptRefreshToken: (ciphertext: string, mentorId: string) => string;
	markReauthorizationRequired: () => Promise<void>;
}): Promise<{ accessToken: string; scopes: string[] }> {
	if (
		!input.connection ||
		input.connection.status !== "connected" ||
		!input.connection.refreshTokenCiphertext
	) {
		throw new MentorGoogleOAuthError("connection_unavailable");
	}

	const refreshToken = input.decryptRefreshToken(
		input.connection.refreshTokenCiphertext,
		input.connection.mentorId,
	);
	try {
		const token = await input.provider.refreshAccessToken(refreshToken);
		if (!hasMentorGoogleCalendarScope(token.scopes)) {
			throw new MentorGoogleOAuthError("insufficient_scope");
		}
		return {
			accessToken: token.accessToken,
			scopes: normalizeGoogleScopes(token.scopes),
		};
	} catch (error) {
		if (isInvalidGrantError(error)) {
			await input.markReauthorizationRequired();
			throw new MentorGoogleOAuthError("invalid_grant");
		}
		throw error;
	}
}

export type MentorGoogleRevocationResult = {
	status: "disconnected" | "revoked";
	remoteRevocation: "not_attempted" | "succeeded" | "failed";
	retainCiphertext: boolean;
	revocationState: "not_pending" | "pending";
	revocationErrorCode: string | null;
};

export async function revokeMentorGoogleCredential(input: {
	connection: MentorGoogleConnectionRecord;
	desiredStatus: "disconnected" | "revoked";
	provider: Pick<MentorGoogleOAuthProvider, "revokeRefreshToken">;
	decryptRefreshToken: (ciphertext: string, mentorId: string) => string;
}): Promise<MentorGoogleRevocationResult> {
	if (!input.connection.refreshTokenCiphertext) {
		return {
			status: input.desiredStatus,
			remoteRevocation: "not_attempted",
			retainCiphertext: false,
			revocationState: "not_pending",
			revocationErrorCode: null,
		};
	}
	try {
		const refreshToken = input.decryptRefreshToken(
			input.connection.refreshTokenCiphertext,
			input.connection.mentorId,
		);
		await input.provider.revokeRefreshToken(refreshToken);
		return {
			status: input.desiredStatus,
			remoteRevocation: "succeeded",
			retainCiphertext: false,
			revocationState: "not_pending",
			revocationErrorCode: null,
		};
	} catch (error) {
		if (isInvalidGrantError(error)) {
			return {
				status: input.desiredStatus,
				remoteRevocation: "succeeded",
				retainCiphertext: false,
				revocationState: "not_pending",
				revocationErrorCode: null,
			};
		}
		return {
			status: "disconnected",
			remoteRevocation: "failed",
			retainCiphertext: true,
			revocationState: "pending",
			revocationErrorCode: "remote_error",
		};
	}
}
