import { expect, test } from "bun:test";
import { createMentorGoogleOAuthProvider } from "./mentor-google-oauth";
import {
	type ConsumedOAuthState,
	GoogleOAuthProviderError,
	MENTOR_GOOGLE_REQUIRED_SCOPES,
	type MentorGoogleConnectionRecord,
	MentorGoogleOAuthError,
	type MentorGoogleOAuthProvider,
	type MentorGoogleOAuthRepository,
	completeMentorGoogleOAuthCallback,
	createOAuthState,
	hashOAuthState,
	isSameOriginMutationRequest,
	revokeMentorGoogleCredential,
} from "./mentor-google-oauth-core";

class FakeRepository implements MentorGoogleOAuthRepository {
	states = new Map<string, ConsumedOAuthState & { used: boolean }>();
	connections: MentorGoogleConnectionRecord[] = [];

	seedState(state: string, record: ConsumedOAuthState) {
		this.states.set(hashOAuthState(state), { ...record, used: false });
	}

	async consumeOAuthState(stateHash: string, _now: Date) {
		const record = this.states.get(stateHash);
		if (!record || record.used) return null;
		record.used = true;
		return {
			mentorId: record.mentorId,
			userId: record.userId,
			returnPath: record.returnPath,
			codeVerifier: record.codeVerifier,
			allowAccountChange: record.allowAccountChange,
			expiresAt: record.expiresAt,
		};
	}

	async getConnectionByMentor(mentorId: string) {
		return (
			this.connections.find((connection) => connection.mentorId === mentorId) ??
			null
		);
	}

	async getConnectionByGoogleSubject(googleSubject: string) {
		return (
			this.connections.find(
				(connection) => connection.googleSubject === googleSubject,
			) ?? null
		);
	}

	async linkConnection(
		input: Parameters<MentorGoogleOAuthRepository["linkConnection"]>[0],
	) {
		const current = await this.getConnectionByMentor(input.mentorId);
		const next: MentorGoogleConnectionRecord = {
			mentorId: input.mentorId,
			userId: input.userId,
			googleSubject: input.googleSubject,
			googleEmail: input.googleEmail,
			refreshTokenCiphertext: input.refreshTokenCiphertext,
			status: "connected",
		};
		if (current) {
			this.connections[this.connections.indexOf(current)] = next;
		} else {
			this.connections.push(next);
		}
	}

	async markReauthorizationRequired(mentorId: string) {
		const connection = await this.getConnectionByMentor(mentorId);
		if (connection) connection.status = "reauth_required";
	}
}

function providerFor(input?: {
	subject?: string;
	email?: string;
	refreshToken?: string;
	onExchange?: () => void;
}): MentorGoogleOAuthProvider {
	return {
		async exchangeCode() {
			input?.onExchange?.();
			return {
				accessToken: "synthetic-access-token",
				refreshToken: input?.refreshToken ?? "synthetic-refresh-token",
				scopes: [...MENTOR_GOOGLE_REQUIRED_SCOPES],
			};
		},
		async getIdentity() {
			return {
				subject:
					input && Object.hasOwn(input, "subject")
						? input.subject
						: "google-subject-a",
				email: input?.email ?? "mentor@example.test",
			};
		},
		async refreshAccessToken() {
			return {
				accessToken: "synthetic-access-token",
				scopes: ["https://www.googleapis.com/auth/calendar.events.owned"],
			};
		},
		async revokeRefreshToken() {},
	};
}

function stateFor(input?: Partial<ConsumedOAuthState>): ConsumedOAuthState {
	return {
		mentorId: "mentor-a",
		userId: "user-a",
		returnPath: "/dashboard/mentor/profile",
		codeVerifier: "synthetic-code-verifier",
		allowAccountChange: false,
		expiresAt: new Date("2026-08-02T12:10:00.000Z"),
		...input,
	};
}

async function complete(
	repository: FakeRepository,
	state: string,
	provider = providerFor(),
	input?: Partial<Parameters<typeof completeMentorGoogleOAuthCallback>[0]>,
) {
	return completeMentorGoogleOAuthCallback({
		state,
		code: "synthetic-auth-code",
		authenticatedMentorId: "mentor-a",
		authenticatedUserId: "user-a",
		now: new Date("2026-08-02T12:00:00.000Z"),
		repository,
		provider,
		encryptRefreshToken: (token, mentorId) => `encrypted:${mentorId}:${token}`,
		...input,
	});
}

test("OAuth state is mentor-bound, expires, and is single-use", async () => {
	const repository = new FakeRepository();
	const state = createOAuthState({
		now: new Date("2026-08-02T12:00:00.000Z"),
		ttlSeconds: 60,
	});
	repository.seedState(state.state, stateFor({ expiresAt: state.expiresAt }));

	await expect(complete(repository, state.state)).resolves.toEqual({
		returnPath: "/dashboard/mentor/profile",
	});
	await expect(complete(repository, state.state)).rejects.toMatchObject({
		code: "invalid_state",
	});

	const expiredRepository = new FakeRepository();
	const expiredState = createOAuthState({
		now: new Date("2026-08-02T12:00:00.000Z"),
		ttlSeconds: 60,
	});
	expiredRepository.seedState(
		expiredState.state,
		stateFor({ expiresAt: new Date("2026-08-02T11:59:00.000Z") }),
	);
	await expect(
		complete(expiredRepository, expiredState.state),
	).rejects.toMatchObject({
		code: "expired_state",
	});

	const wrongMentorRepository = new FakeRepository();
	const wrongMentorState = createOAuthState({});
	wrongMentorRepository.seedState(
		wrongMentorState.state,
		stateFor({ mentorId: "mentor-b", userId: "user-b" }),
	);
	let exchanged = false;
	const provider = providerFor({
		onExchange: () => {
			exchanged = true;
		},
	});
	await expect(
		complete(wrongMentorRepository, wrongMentorState.state, provider),
	).rejects.toMatchObject({ code: "state_mentor_mismatch" });
	expect(exchanged).toBe(false);
});

test("callback does not overwrite a connection for another Google subject", async () => {
	const repository = new FakeRepository();
	repository.connections.push({
		mentorId: "mentor-a",
		userId: "user-a",
		googleSubject: "old-subject",
		googleEmail: "old@example.test",
		refreshTokenCiphertext: "old-ciphertext",
		status: "connected",
	});
	const state = createOAuthState({});
	repository.seedState(state.state, stateFor());

	await expect(
		complete(repository, state.state, providerFor({ subject: "new-subject" })),
	).rejects.toMatchObject({ code: "google_account_conflict" });
	expect(repository.connections[0]?.refreshTokenCiphertext).toBe(
		"old-ciphertext",
	);
});

test("callback cannot claim a subject already linked to another mentor", async () => {
	const repository = new FakeRepository();
	repository.connections.push({
		mentorId: "mentor-b",
		userId: "user-b",
		googleSubject: "google-subject-a",
		googleEmail: "other@example.test",
		refreshTokenCiphertext: "other-ciphertext",
		status: "connected",
	});
	const state = createOAuthState({});
	repository.seedState(state.state, stateFor());

	await expect(complete(repository, state.state)).rejects.toMatchObject({
		code: "google_account_conflict",
	});
});

test("callback rejects an identity without a stable Google subject", async () => {
	const repository = new FakeRepository();
	const state = createOAuthState({});
	repository.seedState(state.state, stateFor());

	await expect(
		complete(repository, state.state, providerFor({ subject: undefined })),
	).rejects.toMatchObject({ code: "identity_subject_missing" });
	expect(repository.connections).toHaveLength(0);
});

test("invalid and revoked-style provider grants are classified without raw responses", async () => {
	const repository = new FakeRepository();
	const state = createOAuthState({});
	repository.seedState(state.state, stateFor());
	const provider = providerFor();
	provider.exchangeCode = async () => {
		throw new GoogleOAuthProviderError("invalid_grant");
	};

	await expect(
		complete(repository, state.state, provider),
	).rejects.toMatchObject({
		code: "invalid_grant",
	});

	await expect(
		completeMentorGoogleOAuthCallback({
			state: "not-a-real-state",
			code: "synthetic-auth-code",
			authenticatedMentorId: "mentor-a",
			authenticatedUserId: "user-a",
			repository,
			provider: providerFor(),
			encryptRefreshToken: () => "encrypted",
		}),
	).rejects.toBeInstanceOf(MentorGoogleOAuthError);
});

test("remote revocation failure retains ciphertext for a protected retry", async () => {
	const outcome = await revokeMentorGoogleCredential({
		connection: {
			mentorId: "mentor-a",
			userId: "user-a",
			googleSubject: "google-subject-a",
			googleEmail: "mentor@example.test",
			refreshTokenCiphertext: "ciphertext",
			status: "connected",
		},
		desiredStatus: "revoked",
		provider: {
			revokeRefreshToken: async () => {
				throw new GoogleOAuthProviderError("provider_error");
			},
		},
		decryptRefreshToken: () => "synthetic-refresh-token",
	});

	expect(outcome).toEqual({
		status: "disconnected",
		remoteRevocation: "failed",
		retainCiphertext: true,
		revocationState: "pending",
		revocationErrorCode: "remote_error",
	});

	const alreadyRevoked = await revokeMentorGoogleCredential({
		connection: {
			mentorId: "mentor-a",
			userId: "user-a",
			googleSubject: "google-subject-a",
			googleEmail: "mentor@example.test",
			refreshTokenCiphertext: "ciphertext",
			status: "disconnected",
		},
		desiredStatus: "revoked",
		provider: {
			revokeRefreshToken: async () => {
				throw new GoogleOAuthProviderError("invalid_grant");
			},
		},
		decryptRefreshToken: () => "synthetic-refresh-token",
	});
	expect(alreadyRevoked.remoteRevocation).toBe("succeeded");
	expect(alreadyRevoked.retainCiphertext).toBe(false);
});

test("retained revocation transitions from pending to revoked on a later retry", async () => {
	let attempts = 0;
	const connection: MentorGoogleConnectionRecord = {
		mentorId: "mentor-a",
		userId: "user-a",
		googleSubject: "google-subject-a",
		googleEmail: "mentor@example.test",
		refreshTokenCiphertext: "ciphertext",
		status: "connected",
	};
	const provider = {
		revokeRefreshToken: async () => {
			attempts += 1;
			if (attempts === 1) {
				throw new GoogleOAuthProviderError("provider_error");
			}
		},
	};

	const pending = await revokeMentorGoogleCredential({
		connection,
		desiredStatus: "revoked",
		provider,
		decryptRefreshToken: () => "synthetic-refresh-token",
	});
	expect(pending.retainCiphertext).toBe(true);

	const retried = await revokeMentorGoogleCredential({
		connection: {
			...connection,
			status: pending.status,
			revocationState: pending.revocationState,
		},
		desiredStatus: "revoked",
		provider,
		decryptRefreshToken: () => "synthetic-refresh-token",
	});
	expect(retried).toMatchObject({
		status: "revoked",
		remoteRevocation: "succeeded",
		retainCiphertext: false,
		revocationState: "not_pending",
	});
	expect(attempts).toBe(2);
});

test("pending revocation blocks account relinking even with stale account-change state", async () => {
	const repository = new FakeRepository();
	repository.connections.push({
		mentorId: "mentor-a",
		userId: "user-a",
		googleSubject: "old-subject",
		googleEmail: "old@example.test",
		refreshTokenCiphertext: "ciphertext",
		status: "disconnected",
		revocationState: "pending",
	});
	const state = createOAuthState({ allowAccountChange: true });
	repository.seedState(state.state, stateFor({ allowAccountChange: true }));

	await expect(
		complete(repository, state.state, providerFor({ subject: "new-subject" })),
	).rejects.toMatchObject({ code: "google_account_conflict" });
});

test("revocation sends the refresh token only in an encoded POST body", async () => {
	let request: { url: string; init?: RequestInit } | undefined;
	const provider = createMentorGoogleOAuthProvider(async (input, init) => {
		request = { url: String(input), init };
		return new Response(null, { status: 200 });
	});

	await provider.revokeRefreshToken("synthetic-refresh-token");
	expect(request?.url).toBe("https://oauth2.googleapis.com/revoke");
	expect(request?.url).not.toContain("token=");
	expect(request?.init?.method).toBe("POST");
	expect(request?.init?.headers).toEqual({
		"content-type": "application/x-www-form-urlencoded",
	});
	expect(String(request?.init?.body)).toBe("token=synthetic-refresh-token");
});

test("disconnect and revoke mutation routes require the exact request origin", () => {
	expect(
		isSameOriginMutationRequest({
			origin: "https://app.example.test",
			requestOrigin: "https://app.example.test",
		}),
	).toBe(true);
	expect(
		isSameOriginMutationRequest({
			origin: "https://evil.example.test",
			requestOrigin: "https://app.example.test",
		}),
	).toBe(false);
	expect(
		isSameOriginMutationRequest({
			origin: null,
			requestOrigin: "https://app.example.test",
		}),
	).toBe(false);
});
