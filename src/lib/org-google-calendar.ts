import {
	type MentorCalendarEventParams,
	deterministicCalendarEventId,
} from "@/src/lib/google-calendar";

export class OrgGoogleCalendarError extends Error {
	readonly code:
		| "connection_unavailable"
		| "remote_error"
		| "attempt_key_conflict"
		| "identity_mismatch";

	constructor(
		code: OrgGoogleCalendarError["code"],
		message: string,
		options?: ErrorOptions,
	) {
		super(message, options);
		this.name = "OrgGoogleCalendarError";
		this.code = code;
	}
}

type CalendarFetch = typeof fetch;
type OrgEventIdentity = { email?: string };
type OrgCalendarEvent = {
	id?: string;
	hangoutLink?: string;
	organizer?: OrgEventIdentity;
	creator?: OrgEventIdentity;
	attendees?: OrgEventIdentity[];
	conferenceData?: {
		entryPoints?: { entryPointType?: string; uri?: string }[];
	};
	extendedProperties?: { private?: Record<string, string> };
};

const ATTEMPT_PROPERTY = "4herfrikaBookingAttempt";
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

function configured(): boolean {
	return Boolean(
		process.env.GOOGLE_CLIENT_ID &&
			process.env.GOOGLE_CLIENT_SECRET &&
			process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
			process.env.GOOGLE_ORG_CALENDAR_ID,
	);
}

function calendarUrl(eventId?: string): string {
	const calendarId = process.env.GOOGLE_ORG_CALENDAR_ID;
	if (!calendarId)
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4Herfrika calendar is unavailable.",
		);
	return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events${eventId ? `/${encodeURIComponent(eventId)}` : ""}`;
}

async function getAccessToken(fetchImpl: CalendarFetch): Promise<string> {
	if (!configured())
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4Herfrika calendar is unavailable.",
		);
	if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000)
		return cachedAccessToken.token;

	let response: Response;
	try {
		response = await fetchImpl("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				client_id: process.env.GOOGLE_CLIENT_ID ?? "",
				client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
				refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN ?? "",
				grant_type: "refresh_token",
			}),
		});
	} catch {
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4Herfrika calendar is unavailable.",
		);
	}
	if (!response.ok)
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4Herfrika calendar is unavailable.",
		);

	let payload: { access_token?: unknown; expires_in?: unknown };
	try {
		payload = (await response.json()) as typeof payload;
	} catch {
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4Herfrika calendar is unavailable.",
		);
	}
	if (typeof payload.access_token !== "string")
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4Herfrika calendar is unavailable.",
		);

	const expiresIn =
		typeof payload.expires_in === "number" ? payload.expires_in : 3600;
	cachedAccessToken = {
		token: payload.access_token,
		expiresAt: Date.now() + expiresIn * 1000,
	};
	return payload.access_token;
}

async function readEvent(
	token: string,
	eventId: string,
	fetchImpl: CalendarFetch,
): Promise<OrgCalendarEvent | null> {
	let response: Response;
	try {
		response = await fetchImpl(calendarUrl(eventId), {
			headers: { authorization: `Bearer ${token}` },
		});
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
	}
	if (response.status === 404 || response.status === 410) return null;
	if (!response.ok)
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
	try {
		return (await response.json()) as OrgCalendarEvent;
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar did not return a usable event.",
		);
	}
}

function assertExpectedEvent(event: OrgCalendarEvent, attemptKey: string) {
	if (event.extendedProperties?.private?.[ATTEMPT_PROPERTY] !== attemptKey)
		throw new OrgGoogleCalendarError(
			"attempt_key_conflict",
			"The 4Herfrika calendar returned an event for a different booking attempt.",
		);

	const expectedEmail = process.env.GOOGLE_ORG_CALENDAR_ID?.toLowerCase();
	if (!expectedEmail?.includes("@")) return;
	if (event.organizer?.email?.toLowerCase() !== expectedEmail)
		throw new OrgGoogleCalendarError(
			"identity_mismatch",
			"The 4Herfrika calendar returned an event owned by a different identity.",
		);
}

function eventDetails(event: OrgCalendarEvent, attemptKey: string) {
	assertExpectedEvent(event, attemptKey);
	const meetUrl =
		event.hangoutLink ??
		event.conferenceData?.entryPoints?.find(
			(entry) => entry.entryPointType === "video",
		)?.uri;
	if (!event.id || !meetUrl)
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar did not return a usable Meet event.",
		);
	return { eventId: event.id, meetUrl };
}

export async function ensureOrgGoogleCalendarConnection(
	fetchImpl: CalendarFetch = fetch,
): Promise<void> {
	await getAccessToken(fetchImpl);
}

export async function createOrgGoogleCalendarEvent(
	params: MentorCalendarEventParams,
	fetchImpl: CalendarFetch = fetch,
): Promise<{ eventId: string; meetUrl: string }> {
	const token = await getAccessToken(fetchImpl);
	const eventId = deterministicCalendarEventId(params.attemptKey);
	const existing = await readEvent(token, eventId, fetchImpl);
	if (existing) return eventDetails(existing, params.attemptKey);

	let response: Response;
	try {
		response = await fetchImpl(
			`${calendarUrl()}?conferenceDataVersion=1&sendUpdates=all`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: eventId,
					summary: params.summary,
					description: params.description,
					start: { dateTime: params.startAtUtc.toISOString() },
					end: { dateTime: params.endAtUtc.toISOString() },
					attendees: [
						{ email: params.mentorEmail },
						{ email: params.menteeEmail },
					],
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
	} catch {
		const recovered = await readEvent(token, eventId, fetchImpl);
		if (recovered) return eventDetails(recovered, params.attemptKey);
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
	}

	if (response.status === 409 || response.status === 412) {
		const duplicate = await readEvent(token, eventId, fetchImpl);
		if (duplicate) return eventDetails(duplicate, params.attemptKey);
	}
	if (!response.ok)
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);

	let event: OrgCalendarEvent;
	try {
		event = (await response.json()) as OrgCalendarEvent;
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar did not return a usable Meet event.",
		);
	}
	if (!event.hangoutLink && !event.conferenceData?.entryPoints?.length) {
		event = (await readEvent(token, eventId, fetchImpl)) ?? event;
	}
	return eventDetails(event, params.attemptKey);
}

export async function deleteOrgGoogleCalendarEvent(params: {
	eventId: string;
	fetchImpl?: CalendarFetch;
}): Promise<void> {
	const fetchImpl = params.fetchImpl ?? fetch;
	const token = await getAccessToken(fetchImpl);
	let response: Response;
	try {
		response = await fetchImpl(
			`${calendarUrl(params.eventId)}?sendUpdates=all`,
			{
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			},
		);
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
	}
	if (!response.ok && response.status !== 404 && response.status !== 410)
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
}

/**
 * Removes a fallback event that was left behind after the mentor connected
 * their own Calendar. It is deliberately stricter than normal cancellation:
 * the event must still be owned by the fallback calendar and include the mentor.
 */
export async function deleteFallbackOrphanedCalendarEvent(params: {
	eventId: string;
	mentorEmail: string;
	fetchImpl?: CalendarFetch;
}): Promise<void> {
	const fetchImpl = params.fetchImpl ?? fetch;
	const token = await getAccessToken(fetchImpl);
	const event = await readEvent(token, params.eventId, fetchImpl);
	if (!event)
		throw new OrgGoogleCalendarError(
			"attempt_key_conflict",
			"The fallback calendar event could not be found.",
		);

	const fallbackEmail = process.env.GOOGLE_ORG_CALENDAR_ID?.toLowerCase();
	const ownsEvent = [event.organizer, event.creator].some(
		(identity) => identity?.email?.toLowerCase() === fallbackEmail,
	);
	const includesMentor = event.attendees?.some(
		(attendee) =>
			attendee.email?.toLowerCase() === params.mentorEmail.toLowerCase(),
	);
	if (!fallbackEmail?.includes("@") || !ownsEvent || !includesMentor)
		throw new OrgGoogleCalendarError(
			"identity_mismatch",
			"The fallback calendar returned an event owned by a different identity.",
		);

	let response: Response;
	try {
		response = await fetchImpl(
			`${calendarUrl(params.eventId)}?sendUpdates=none`,
			{
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			},
		);
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
	}
	if (!response.ok && response.status !== 404 && response.status !== 410)
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4Herfrika calendar could not complete the requested operation.",
		);
}

export function resetOrgGoogleCalendarTokenForTests() {
	cachedAccessToken = null;
}
