import { createHash } from "node:crypto";

import { db } from "@/src/db";
import { mentorGoogleConnections } from "@/src/db/schema/tables/mentor-google-connections";
import { decryptMentorRefreshToken } from "@/src/lib/mentor-google-crypto";
import { sendMentorGoogleReconnectNoticeOnce } from "@/src/lib/mentor-google-notifications";
import {
	GoogleOAuthProviderError,
	type MentorGoogleOAuthProvider,
	getMentorGoogleAccessToken,
} from "@/src/lib/mentor-google-oauth-core";
import { eq } from "drizzle-orm";

/** The booking code only talks to this small, mentor-scoped Calendar boundary. */
export type MentorCalendarConnectionStatus =
	| "connected"
	| "disconnected"
	| "reauth_required";

export type MentorCalendarIdentity = { email: string; subject?: string | null };

export type MentorCalendarConnection = {
	connectionId: string;
	mentorId: string;
	status: MentorCalendarConnectionStatus;
	identity: MentorCalendarIdentity;
	getAccessToken: () => Promise<string>;
	markReauthRequired: () => Promise<void>;
	sendReauthorizationNotice?: () => Promise<void>;
};

export type MentorCalendarConnectionProvider = {
	getMentorConnection: (input: {
		mentorId: string;
		mentorEmail: string;
	}) => Promise<MentorCalendarConnection | null>;
};

export type CalendarFetch = typeof fetch;

export class MentorCalendarError extends Error {
	readonly code:
		| "connection_unavailable"
		| "reauth_required"
		| "remote_error"
		| "identity_mismatch"
		| "attempt_key_conflict"
		| "attempt_key_required"
		| "manual_resolution_required";
	readonly eventId?: string;

	constructor(
		code: MentorCalendarError["code"],
		message: string,
		options?: ErrorOptions,
		eventId?: string,
	) {
		super(message, options);
		this.name = "MentorCalendarError";
		this.code = code;
		this.eventId = eventId;
	}
}

type GoogleEventIdentity = { email?: string; id?: string };
type CalendarEvent = {
	id?: string;
	hangoutLink?: string;
	organizer?: GoogleEventIdentity;
	creator?: GoogleEventIdentity;
	conferenceData?: {
		entryPoints?: { entryPointType?: string; uri?: string }[];
	};
	extendedProperties?: { private?: Record<string, string> };
};

type CalendarClientOptions = {
	fetchImpl?: CalendarFetch;
	connectionProvider?: MentorCalendarConnectionProvider;
};

export type MentorCalendarEventParams = {
	mentorId: string;
	mentorEmail: string;
	menteeEmail: string;
	summary: string;
	description: string;
	startAtUtc: Date;
	endAtUtc: Date;
	attemptKey: string;
	connection?: MentorCalendarConnection;
	accessToken?: string;
};

export type NewBookingCalendarHost =
	| {
			mode: "mentor_google";
			connection: MentorCalendarConnection;
			accessToken: string;
	  }
	| {
			mode: "org_google";
			reason: "no_connection" | "connection_unavailable";
	  };

export type MentorCalendarOperations = {
	createMentorCalendarEvent: (
		params: MentorCalendarEventParams,
	) => Promise<{ eventId: string; meetUrl: string }>;
	deleteMentorCalendarEvent: (
		params: {
			mentorId: string;
			mentorEmail: string;
			eventId: string;
		} & (
			| { attemptKey: string; expectedAttemptKey?: string }
			| { attemptKey?: string; expectedAttemptKey: string }
		),
	) => Promise<void>;
};

const ATTEMPT_PROPERTY = "4herfrikaBookingAttempt";

export function stableCalendarAttemptKey(...parts: string[]): string {
	return `4hf-${createHash("sha256")
		.update(parts.join("\0"))
		.digest("hex")
		.slice(0, 32)}`;
}

export function deterministicCalendarEventId(attemptKey: string): string {
	return `4hf${createHash("sha256").update(attemptKey).digest("hex")}`;
}

const normalizedEmail = (email: string) => email.trim().toLowerCase();
const calendarUrl = (eventId?: string) =>
	`https://www.googleapis.com/calendar/v3/calendars/primary/events${eventId ? `/${encodeURIComponent(eventId)}` : ""}`;

function isInvalidGrant(error: unknown): boolean {
	if (error instanceof GoogleOAuthProviderError)
		return error.code === "invalid_grant";
	if (!error || typeof error !== "object") return false;
	const code = (error as { code?: unknown }).code;
	return code === "invalid_grant";
}

function oauthConfig() {
	const clientId = process.env.MENTOR_GOOGLE_OAUTH_CLIENT_ID;
	const clientSecret = process.env.MENTOR_GOOGLE_OAUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret)
		throw new GoogleOAuthProviderError("provider_error");
	return { clientId, clientSecret };
}

async function json(response: Response): Promise<Record<string, unknown>> {
	try {
		return (await response.json()) as Record<string, unknown>;
	} catch {
		return {};
	}
}

async function logCalendarApiFailure(input: {
	operation: "read_event" | "create_event";
	mentorId: string;
	connectionId: string;
	attemptKey?: string;
	response: Response;
}) {
	const payload = await json(input.response.clone());
	const googleError =
		payload.error && typeof payload.error === "object"
			? (payload.error as Record<string, unknown>)
			: undefined;
	const details = {
		operation: input.operation,
		status: input.response.status,
		googleErrorCode: googleError?.code,
		googleErrorStatus: googleError?.status,
		googleErrorMessage: googleError?.message,
	};
	console.error("[mentor-google-calendar-api-failed]", {
		mentorId: input.mentorId,
		connectionId: input.connectionId,
		attemptKey: input.attemptKey,
		...details,
	});
	return details;
}

function googleProvider(
	fetchImpl: CalendarFetch,
	grantedScopes: string[],
): MentorGoogleOAuthProvider {
	return {
		async exchangeCode() {
			throw new GoogleOAuthProviderError("provider_error");
		},
		async getIdentity(accessToken) {
			const response = await fetchImpl(
				"https://openidconnect.googleapis.com/v1/userinfo",
				{ headers: { authorization: `Bearer ${accessToken}` } },
			);
			const payload = await json(response);
			if (!response.ok || typeof payload.email !== "string")
				throw new GoogleOAuthProviderError("provider_error");
			return {
				email: payload.email,
				subject: typeof payload.sub === "string" ? payload.sub : undefined,
			};
		},
		async refreshAccessToken(refreshToken) {
			const config = oauthConfig();
			const response = await fetchImpl("https://oauth2.googleapis.com/token", {
				method: "POST",
				headers: { "content-type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					client_id: config.clientId,
					client_secret: config.clientSecret,
					refresh_token: refreshToken,
					grant_type: "refresh_token",
				}),
			});
			const payload = await json(response);
			if (!response.ok) {
				if (payload.error === "invalid_grant")
					throw new GoogleOAuthProviderError("invalid_grant");
				throw new GoogleOAuthProviderError("provider_error");
			}
			if (typeof payload.access_token !== "string")
				throw new GoogleOAuthProviderError("provider_error");
			return {
				accessToken: payload.access_token,
				refreshToken:
					typeof payload.refresh_token === "string"
						? payload.refresh_token
						: undefined,
				scopes:
					typeof payload.scope === "string"
						? payload.scope.split(/\s+/).filter(Boolean)
						: grantedScopes,
			};
		},
		async revokeRefreshToken(refreshToken) {
			const response = await fetchImpl("https://oauth2.googleapis.com/revoke", {
				method: "POST",
				headers: { "content-type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({ token: refreshToken }),
			});
			if (!response.ok) throw new GoogleOAuthProviderError("provider_error");
		},
	};
}

const databaseProvider: MentorCalendarConnectionProvider = {
	async getMentorConnection({ mentorId, mentorEmail }) {
		const row = await db.query.mentorGoogleConnections.findFirst({
			where: eq(mentorGoogleConnections.mentor_id, mentorId),
		});
		if (!row) return null;
		const markReauthRequired = async () => {
			await db
				.update(mentorGoogleConnections)
				.set({
					status: "reauth_required",
					reauthorization_state: "required",
					last_error_code: "invalid_grant",
					reauthorization_required_at: new Date(),
					updated_at: new Date(),
				})
				.where(eq(mentorGoogleConnections.id, row.id));
		};
		return {
			connectionId: row.id,
			mentorId: row.mentor_id,
			status:
				row.status === "connected" &&
				row.reauthorization_state === "not_required"
					? "connected"
					: row.status === "reauth_required"
						? "reauth_required"
						: "disconnected",
			identity: { email: row.google_email, subject: row.google_subject },
			getAccessToken: async () => {
				if (!row.refresh_token_ciphertext)
					throw new MentorCalendarError(
						"connection_unavailable",
						"missing grant",
					);
				const token = await getMentorGoogleAccessToken({
					connection: {
						mentorId: row.mentor_id,
						userId: row.user_id,
						googleSubject: row.google_subject,
						googleEmail: row.google_email,
						refreshTokenCiphertext: row.refresh_token_ciphertext,
						status: row.status,
					},
					provider: googleProvider(fetch, row.granted_scopes),
					decryptRefreshToken: decryptMentorRefreshToken,
					markReauthorizationRequired: markReauthRequired,
				});
				return token.accessToken;
			},
			markReauthRequired,
			sendReauthorizationNotice: async () => {
				await sendMentorGoogleReconnectNoticeOnce({
					connectionId: row.id,
					mentorEmail,
				});
			},
		};
	},
};

let connectionProvider = databaseProvider;
export function registerMentorCalendarConnectionProvider(
	provider: MentorCalendarConnectionProvider,
) {
	connectionProvider = provider;
}
export function resetMentorCalendarConnectionProviderForTests() {
	connectionProvider = databaseProvider;
}

function actionMessage(error: unknown) {
	if (error instanceof MentorCalendarError && error.code === "reauth_required")
		return "The mentor's Google Calendar connection needs to be reconnected.";
	if (
		error instanceof MentorCalendarError &&
		error.code === "manual_resolution_required"
	)
		return "The calendar change needs manual resolution before it can be completed.";
	return "The mentor's Google Calendar is not available for booking.";
}

export const isMentorCalendarError = (
	error: unknown,
): error is MentorCalendarError => error instanceof MentorCalendarError;
export const mentorCalendarActionMessage = actionMessage;

async function getConnection(
	input: {
		mentorId: string;
		mentorEmail: string;
	},
	provider?: MentorCalendarConnectionProvider,
	connectionOverride?: MentorCalendarConnection,
) {
	const connection =
		connectionOverride ??
		(await (provider ?? connectionProvider).getMentorConnection(input));
	if (!connection || connection.mentorId !== input.mentorId) {
		console.error("[mentor-google-calendar-connection-unavailable]", {
			mentorId: input.mentorId,
			hasConnection: Boolean(connection),
			connectionMentorMatches: connection?.mentorId === input.mentorId,
		});
		throw new MentorCalendarError(
			"connection_unavailable",
			actionMessage(null),
		);
	}
	if (connection.status === "reauth_required") {
		console.error("[mentor-google-calendar-reauth-required]", {
			mentorId: input.mentorId,
			connectionId: connection.connectionId,
		});
		await notifyBrokenConnection(connection);
		throw new MentorCalendarError("reauth_required", actionMessage(null));
	}
	if (connection.status !== "connected") {
		console.error("[mentor-google-calendar-connection-unavailable]", {
			mentorId: input.mentorId,
			connectionId: connection.connectionId,
			connectionStatus: connection.status,
		});
		await notifyBrokenConnection(connection);
		throw new MentorCalendarError(
			"connection_unavailable",
			actionMessage(null),
		);
	}
	if (
		normalizedEmail(connection.identity.email) !==
		normalizedEmail(input.mentorEmail)
	) {
		console.error("[mentor-google-calendar-identity-mismatch]", {
			mentorId: input.mentorId,
			connectionId: connection.connectionId,
		});
		await notifyBrokenConnection(connection);
		throw new MentorCalendarError(
			"identity_mismatch",
			"The connected Google Calendar identity does not match the mentor.",
		);
	}
	return connection;
}

async function accessToken(
	connection: MentorCalendarConnection,
	knownAccessToken?: string,
) {
	if (knownAccessToken) return knownAccessToken;
	try {
		const token = await connection.getAccessToken();
		if (!token) throw new Error("missing access token");
		return token;
	} catch (error) {
		console.error("[mentor-google-calendar-token-failed]", {
			mentorId: connection.mentorId,
			connectionId: connection.connectionId,
			errorName: error instanceof Error ? error.name : typeof error,
			errorMessage: error instanceof Error ? error.message : undefined,
		});
		if (isInvalidGrant(error)) {
			await connection.markReauthRequired().catch(() => undefined);
			await notifyBrokenConnection(connection);
			throw new MentorCalendarError("reauth_required", actionMessage(null));
		}
		await notifyBrokenConnection(connection);
		throw new MentorCalendarError(
			"connection_unavailable",
			actionMessage(null),
		);
	}
}

async function notifyBrokenConnection(connection: MentorCalendarConnection) {
	await connection.sendReauthorizationNotice?.().catch(() => undefined);
}

export async function selectNewBookingCalendarHost(input: {
	mentorId: string;
	mentorEmail: string;
	connectionProvider?: MentorCalendarConnectionProvider;
}): Promise<NewBookingCalendarHost> {
	const provider = input.connectionProvider ?? connectionProvider;
	const connection = await provider.getMentorConnection(input);
	if (!connection) {
		return { mode: "org_google", reason: "no_connection" };
	}
	if (connection.mentorId !== input.mentorId) {
		await notifyBrokenConnection(connection);
		return { mode: "org_google", reason: "connection_unavailable" };
	}
	if (connection.status !== "connected") {
		await notifyBrokenConnection(connection);
		return { mode: "org_google", reason: "connection_unavailable" };
	}
	if (
		normalizedEmail(connection.identity.email) !==
		normalizedEmail(input.mentorEmail)
	) {
		await notifyBrokenConnection(connection);
		return { mode: "org_google", reason: "connection_unavailable" };
	}

	try {
		const token = await accessToken(connection);
		return { mode: "mentor_google", connection, accessToken: token };
	} catch {
		await notifyBrokenConnection(connection);
		return { mode: "org_google", reason: "connection_unavailable" };
	}
}

function eventOwnerMatches(
	event: CalendarEvent,
	connection: MentorCalendarConnection,
) {
	const expectedEmail = normalizedEmail(connection.identity.email);
	for (const owner of [event.organizer, event.creator]) {
		if (!owner?.email || normalizedEmail(owner.email) !== expectedEmail)
			throw new MentorCalendarError(
				"identity_mismatch",
				"Google Calendar returned an event owned by a different identity.",
			);
		if (
			connection.identity.subject &&
			owner.id &&
			owner.id !== connection.identity.subject
		)
			throw new MentorCalendarError(
				"identity_mismatch",
				"Google Calendar returned an event owned by a different identity.",
			);
	}
}

function usableEvent(
	event: CalendarEvent,
	connection: MentorCalendarConnection,
) {
	eventOwnerMatches(event, connection);
	const meetUrl =
		event.hangoutLink ??
		event.conferenceData?.entryPoints?.find(
			(entry) => entry.entryPointType === "video",
		)?.uri;
	if (!event.id || !meetUrl)
		throw new MentorCalendarError(
			"remote_error",
			"Google Calendar did not return a usable Meet event.",
		);
	return { eventId: event.id, meetUrl };
}

async function readEvent(
	connection: MentorCalendarConnection,
	token: string,
	eventId: string,
	fetchImpl: CalendarFetch,
): Promise<CalendarEvent | null> {
	const response = await fetchImpl(calendarUrl(eventId), {
		headers: { authorization: `Bearer ${token}` },
	});
	if (response.status === 404 || response.status === 410) return null;
	if (response.status === 401) {
		await connection.markReauthRequired().catch(() => undefined);
		await notifyBrokenConnection(connection);
		throw new MentorCalendarError("reauth_required", actionMessage(null));
	}
	if (!response.ok) {
		const details = await logCalendarApiFailure({
			operation: "read_event",
			mentorId: connection.mentorId,
			connectionId: connection.connectionId,
			response,
		});
		throw new MentorCalendarError(
			"remote_error",
			"Google Calendar could not complete the requested operation.",
			{ cause: details },
		);
	}
	return (await json(response)) as CalendarEvent;
}

export function createMentorCalendarClient(
	options: CalendarClientOptions = {},
) {
	const fetchImpl = options.fetchImpl ?? fetch;
	const provider = options.connectionProvider;

	async function ensureConnection(input: {
		mentorId: string;
		mentorEmail: string;
	}) {
		const connection = await getConnection(input, provider);
		await accessToken(connection);
		return connection;
	}

	async function createMentorCalendarEvent(params: MentorCalendarEventParams) {
		const connection = await getConnection(params, provider, params.connection);
		const token = await accessToken(connection, params.accessToken);
		const eventId = deterministicCalendarEventId(params.attemptKey);
		const existing = await readEvent(connection, token, eventId, fetchImpl);
		if (existing) {
			if (
				existing.extendedProperties?.private?.[ATTEMPT_PROPERTY] !==
				params.attemptKey
			)
				throw new MentorCalendarError(
					"attempt_key_conflict",
					"Google Calendar returned an event for a different booking attempt.",
				);
			return usableEvent(existing, connection);
		}

		let response: Response;
		try {
			response = await fetchImpl(
				`${calendarUrl()}?conferenceDataVersion=1&sendUpdates=all`,
				{
					method: "POST",
					headers: {
						authorization: `Bearer ${token}`,
						"content-type": "application/json",
					},
					body: JSON.stringify({
						id: eventId,
						summary: params.summary,
						description: params.description,
						start: { dateTime: params.startAtUtc.toISOString() },
						end: { dateTime: params.endAtUtc.toISOString() },
						attendees: [{ email: params.menteeEmail }],
						conferenceData: {
							createRequest: {
								requestId: params.attemptKey,
								conferenceSolutionKey: { type: "hangoutsMeet" },
							},
						},
						extendedProperties: {
							private: { [ATTEMPT_PROPERTY]: params.attemptKey },
						},
					}),
				},
			);
		} catch (error) {
			console.error("[mentor-google-calendar-create-request-failed]", {
				mentorId: connection.mentorId,
				connectionId: connection.connectionId,
				attemptKey: params.attemptKey,
				errorName: error instanceof Error ? error.name : typeof error,
				errorMessage: error instanceof Error ? error.message : undefined,
			});
			const recovered = await readEvent(connection, token, eventId, fetchImpl);
			if (recovered) {
				if (
					recovered.extendedProperties?.private?.[ATTEMPT_PROPERTY] !==
					params.attemptKey
				)
					throw new MentorCalendarError(
						"attempt_key_conflict",
						"Google Calendar returned an event for a different booking attempt.",
					);
				return usableEvent(recovered, connection);
			}
			throw new MentorCalendarError(
				"remote_error",
				"Google Calendar could not complete the requested operation.",
			);
		}
		if (response.status === 401) {
			await connection.markReauthRequired().catch(() => undefined);
			await notifyBrokenConnection(connection);
			throw new MentorCalendarError("reauth_required", actionMessage(null));
		}
		if (response.status === 409 || response.status === 412) {
			const duplicate = await readEvent(connection, token, eventId, fetchImpl);
			if (duplicate) {
				if (
					duplicate.extendedProperties?.private?.[ATTEMPT_PROPERTY] !==
					params.attemptKey
				)
					throw new MentorCalendarError(
						"attempt_key_conflict",
						"Google Calendar returned an event for a different booking attempt.",
					);
				return usableEvent(duplicate, connection);
			}
		}
		if (!response.ok) {
			const details = await logCalendarApiFailure({
				operation: "create_event",
				mentorId: connection.mentorId,
				connectionId: connection.connectionId,
				attemptKey: params.attemptKey,
				response,
			});
			throw new MentorCalendarError(
				"remote_error",
				"Google Calendar could not complete the requested operation.",
				{ cause: details },
			);
		}
		let event = (await json(response)) as CalendarEvent;
		if (
			!event.hangoutLink &&
			!event.conferenceData?.entryPoints?.length &&
			event.id
		) {
			event =
				(await readEvent(connection, token, event.id, fetchImpl)) ?? event;
		}
		return usableEvent(event, connection);
	}

	async function deleteMentorCalendarEvent(
		params: {
			mentorId: string;
			mentorEmail: string;
			eventId: string;
		} & (
			| { attemptKey: string; expectedAttemptKey?: string }
			| { attemptKey?: string; expectedAttemptKey: string }
		),
	) {
		const connection = await getConnection(params, provider);
		const token = await accessToken(connection);
		const event = await readEvent(connection, token, params.eventId, fetchImpl);
		if (!event) return;
		eventOwnerMatches(event, connection);
		const expectedAttempt = params.expectedAttemptKey ?? params.attemptKey;
		if (!expectedAttempt) {
			throw new MentorCalendarError(
				"attempt_key_required",
				"A booking attempt key is required before deleting a calendar event.",
			);
		}
		const actualAttempt = event.extendedProperties?.private?.[ATTEMPT_PROPERTY];
		if (!actualAttempt || expectedAttempt !== actualAttempt)
			throw new MentorCalendarError(
				"attempt_key_conflict",
				"Google Calendar returned an event for a different booking attempt.",
			);
		const response = await fetchImpl(
			`${calendarUrl(params.eventId)}?sendUpdates=all`,
			{
				method: "DELETE",
				headers: { authorization: `Bearer ${token}` },
			},
		);
		if (response.ok || response.status === 404 || response.status === 410)
			return;
		if (response.status === 401) {
			await connection.markReauthRequired().catch(() => undefined);
			await notifyBrokenConnection(connection);
			throw new MentorCalendarError("reauth_required", actionMessage(null));
		}
		throw new MentorCalendarError(
			"remote_error",
			"Google Calendar could not complete the requested operation.",
		);
	}

	return {
		ensureConnection,
		createMentorCalendarEvent,
		deleteMentorCalendarEvent,
	};
}

const defaultClient = createMentorCalendarClient();
export async function replaceMentorCalendarEvent(
	params: MentorCalendarEventParams & {
		oldEventId: string;
		expectedOldAttemptKey: string;
	},
	operations: MentorCalendarOperations = defaultClient,
) {
	const replacement = await operations.createMentorCalendarEvent(params);
	try {
		await operations.deleteMentorCalendarEvent({
			mentorId: params.mentorId,
			mentorEmail: params.mentorEmail,
			eventId: params.oldEventId,
			expectedAttemptKey: params.expectedOldAttemptKey,
		});
	} catch (error) {
		throw new MentorCalendarError(
			"manual_resolution_required",
			"The replacement meeting was created, but the previous meeting could not be removed.",
			error instanceof Error ? { cause: error } : undefined,
			replacement.eventId,
		);
	}
	return replacement;
}

export const ensureMentorCalendarConnection = defaultClient.ensureConnection;
export const createMentorCalendarEvent =
	defaultClient.createMentorCalendarEvent;
export const deleteMentorCalendarEvent =
	defaultClient.deleteMentorCalendarEvent;
