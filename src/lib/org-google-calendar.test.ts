import { afterEach, describe, expect, test } from "bun:test";
import {
	deleteFallbackOrphanedCalendarEvent,
	resetOrgGoogleCalendarTokenForTests,
} from "./org-google-calendar";

const previousEnv = {
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
	calendarId: process.env.GOOGLE_ORG_CALENDAR_ID,
};

function configureFallbackCalendar() {
	process.env.GOOGLE_CLIENT_ID = "client";
	process.env.GOOGLE_CLIENT_SECRET = "secret";
	process.env.GOOGLE_OAUTH_REFRESH_TOKEN = "refresh";
	process.env.GOOGLE_ORG_CALENDAR_ID = "4herfrika@gmail.com";
}

afterEach(() => {
	process.env.GOOGLE_CLIENT_ID = previousEnv.clientId;
	process.env.GOOGLE_CLIENT_SECRET = previousEnv.clientSecret;
	process.env.GOOGLE_OAUTH_REFRESH_TOKEN = previousEnv.refreshToken;
	process.env.GOOGLE_ORG_CALENDAR_ID = previousEnv.calendarId;
	resetOrgGoogleCalendarTokenForTests();
});

describe("fallback calendar orphan cleanup", () => {
	test("deletes a fallback-owned event without notifying attendees", async () => {
		configureFallbackCalendar();
		const calls: { url: string; method?: string }[] = [];
		await deleteFallbackOrphanedCalendarEvent({
			eventId: "event-1",
			mentorEmail: "mentor@example.com",
			fetchImpl: async (input, init) => {
				const url = String(input);
				calls.push({ url, method: init?.method });
				if (url.includes("oauth2.googleapis.com"))
					return new Response(JSON.stringify({ access_token: "token" }));
				if (init?.method === "DELETE")
					return new Response(null, { status: 204 });
				return new Response(
					JSON.stringify({
						id: "event-1",
						organizer: { email: "4herfrika@gmail.com" },
						creator: { email: "4herfrika@gmail.com" },
						attendees: [{ email: "mentor@example.com" }],
					}),
				);
			},
		});

		expect(calls.at(-1)).toEqual({
			url: expect.stringContaining("/events/event-1?sendUpdates=none"),
			method: "DELETE",
		});
	});

	test("refuses to delete a fallback event that does not include the mentor", async () => {
		configureFallbackCalendar();
		let deletes = 0;
		await expect(
			deleteFallbackOrphanedCalendarEvent({
				eventId: "event-1",
				mentorEmail: "mentor@example.com",
				fetchImpl: async (input, init) => {
					if (String(input).includes("oauth2.googleapis.com"))
						return new Response(JSON.stringify({ access_token: "token" }));
					if (init?.method === "DELETE") deletes += 1;
					return new Response(
						JSON.stringify({
							organizer: { email: "4herfrika@gmail.com" },
							attendees: [{ email: "other@example.com" }],
						}),
					);
				},
			}),
		).rejects.toMatchObject({ code: "identity_mismatch" });
		expect(deletes).toBe(0);
	});
});
