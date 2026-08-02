import type { MentorCalendarEventParams } from "@/src/lib/google-calendar";

export class OrgGoogleCalendarError extends Error {
	readonly code: "connection_unavailable" | "remote_error";

	constructor(code: OrgGoogleCalendarError["code"], message: string) {
		super(message);
		this.name = "OrgGoogleCalendarError";
		this.code = code;
	}
}

type CalendarFetch = typeof fetch;

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
			"The 4HerFrika calendar is unavailable.",
		);
	return `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events${eventId ? `/${encodeURIComponent(eventId)}` : ""}`;
}

async function getAccessToken(fetchImpl: CalendarFetch): Promise<string> {
	if (!configured()) {
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4HerFrika calendar is unavailable.",
		);
	}
	if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
		return cachedAccessToken.token;
	}

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
			"The 4HerFrika calendar is unavailable.",
		);
	}
	if (!response.ok) {
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4HerFrika calendar is unavailable.",
		);
	}

	let payload: { access_token?: unknown; expires_in?: unknown };
	try {
		payload = (await response.json()) as typeof payload;
	} catch {
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4HerFrika calendar is unavailable.",
		);
	}
	if (typeof payload.access_token !== "string") {
		throw new OrgGoogleCalendarError(
			"connection_unavailable",
			"The 4HerFrika calendar is unavailable.",
		);
	}

	const expiresIn =
		typeof payload.expires_in === "number" ? payload.expires_in : 3600;
	cachedAccessToken = {
		token: payload.access_token,
		expiresAt: Date.now() + expiresIn * 1000,
	};
	return payload.access_token;
}

function eventDetails(event: Record<string, unknown>) {
	const conferenceData = event.conferenceData as
		| { entryPoints?: { entryPointType?: string; uri?: string }[] }
		| undefined;
	const eventId = typeof event.id === "string" ? event.id : undefined;
	const meetUrl =
		typeof event.hangoutLink === "string"
			? event.hangoutLink
			: conferenceData?.entryPoints?.find(
					(entry) => entry.entryPointType === "video",
				)?.uri;
	if (!eventId || !meetUrl) {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4HerFrika calendar did not return a usable Meet event.",
		);
	}
	return { eventId, meetUrl };
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
				}),
			},
		);
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4HerFrika calendar could not complete the requested operation.",
		);
	}
	if (!response.ok) {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4HerFrika calendar could not complete the requested operation.",
		);
	}
	let event: Record<string, unknown>;
	try {
		event = (await response.json()) as Record<string, unknown>;
	} catch {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4HerFrika calendar did not return a usable Meet event.",
		);
	}
	return eventDetails(event);
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
			"The 4HerFrika calendar could not complete the requested operation.",
		);
	}
	if (!response.ok && response.status !== 404 && response.status !== 410) {
		throw new OrgGoogleCalendarError(
			"remote_error",
			"The 4HerFrika calendar could not complete the requested operation.",
		);
	}
}

export function resetOrgGoogleCalendarTokenForTests() {
	cachedAccessToken = null;
}
