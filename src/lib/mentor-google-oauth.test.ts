import { expect, test } from "bun:test";
import {
	type ConsumedOAuthState,
	GoogleOAuthProviderError,
	MENTOR_GOOGLE_REQUIRED_SCOPES,
	type MentorGoogleConnectionRecord,
	type MentorGoogleOAuthProvider,
	type MentorGoogleOAuthRepository,
	completeMentorGoogleOAuthCallback,
	createOAuthState,
	hashOAuthState,
	isSameOriginMutationRequest,
	revokeMentorGoogleCredential,
} from "./mentor-google-oauth-core";
import { createMentorGoogleOAuthProvider } from "./mentor-google-oauth-provider";

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

test("callback preserves mentor-bound Google account identity", async () => {
	const existingConnection = {
		mentorId: "mentor-a",
		userId: "user-a",
		googleSubject: "old-subject",
		googleEmail: "old@example.test",
		refreshTokenCiphertext: "old-ciphertext",
		status: "connected" as const,
	};

	const subjectChangedRepository = new FakeRepository();
	subjectChangedRepository.connections.push(existingConnection);
	const subjectChangedState = createOAuthState({});
	subjectChangedRepository.seedState(subjectChangedState.state, stateFor());
	await expect(
		complete(
			subjectChangedRepository,
			subjectChangedState.state,
			providerFor({ subject: "new-subject" }),
		),
	).rejects.toMatchObject({ code: "google_account_conflict" });
	expect(subjectChangedRepository.connections[0]?.refreshTokenCiphertext).toBe(
		"old-ciphertext",
	);

	const emailChangedRepository = new FakeRepository();
	emailChangedRepository.connections.push({
		...existingConnection,
		googleSubject: "same-subject",
	});
	const emailChangedState = createOAuthState({});
	emailChangedRepository.seedState(emailChangedState.state, stateFor());
	await expect(
		complete(
			emailChangedRepository,
			emailChangedState.state,
			providerFor({ subject: "same-subject", email: "new@example.test" }),
		),
	).rejects.toMatchObject({ code: "google_account_conflict" });

	const otherMentorRepository = new FakeRepository();
	otherMentorRepository.connections.push({
		...existingConnection,
		mentorId: "mentor-b",
		userId: "user-b",
		googleSubject: "google-subject-a",
		googleEmail: "other@example.test",
		refreshTokenCiphertext: "other-ciphertext",
	});
	const otherMentorState = createOAuthState({});
	otherMentorRepository.seedState(otherMentorState.state, stateFor());
	await expect(
		complete(otherMentorRepository, otherMentorState.state),
	).rejects.toMatchObject({ code: "google_account_conflict" });
});

test("callback fails closed for missing identity subjects and invalid grants", async () => {
	const missingSubjectRepository = new FakeRepository();
	const missingSubjectState = createOAuthState({});
	missingSubjectRepository.seedState(missingSubjectState.state, stateFor());
	await expect(
		complete(
			missingSubjectRepository,
			missingSubjectState.state,
			providerFor({ subject: undefined }),
		),
	).rejects.toMatchObject({ code: "identity_subject_missing" });
	expect(missingSubjectRepository.connections).toHaveLength(0);

	const invalidGrantRepository = new FakeRepository();
	const invalidGrantState = createOAuthState({});
	invalidGrantRepository.seedState(invalidGrantState.state, stateFor());
	const provider = providerFor();
	provider.exchangeCode = async () => {
		throw new GoogleOAuthProviderError("invalid_grant");
	};
	await expect(
		complete(invalidGrantRepository, invalidGrantState.state, provider),
	).rejects.toMatchObject({ code: "invalid_grant" });
	expect(invalidGrantRepository.connections).toHaveLength(0);
});

test("revocation retry and reconnect remain protected by origin checks", async () => {
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
	expect(pending).toMatchObject({
		status: "disconnected",
		retainCiphertext: true,
		revocationState: "pending",
		revocationErrorCode: "remote_error",
	});

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

	const relinkRepository = new FakeRepository();
	relinkRepository.connections.push({
		...connection,
		status: "disconnected",
		revocationState: "pending",
	});
	const relinkState = createOAuthState({ allowAccountChange: true });
	relinkRepository.seedState(
		relinkState.state,
		stateFor({ allowAccountChange: true }),
	);
	await expect(
		complete(
			relinkRepository,
			relinkState.state,
			providerFor({ subject: "new-subject" }),
		),
	).rejects.toMatchObject({ code: "google_account_conflict" });

	let request: { url: string; init?: RequestInit } | undefined;
	const googleProvider = createMentorGoogleOAuthProvider(
		async (input, init) => {
			request = { url: String(input), init };
			return new Response(null, { status: 200 });
		},
	);
	await googleProvider.revokeRefreshToken("synthetic-refresh-token");
	expect(request?.url).toBe("https://oauth2.googleapis.com/revoke");
	expect(request?.url).not.toContain("token=");
	expect(request?.init?.method).toBe("POST");
	expect(String(request?.init?.body)).toBe("token=synthetic-refresh-token");

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
});
