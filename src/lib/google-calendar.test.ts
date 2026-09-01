import { describe, expect, test } from "bun:test";
import {
	type MentorCalendarConnection,
	type MentorCalendarConnectionProvider,
	createMentorCalendarClient,
	deterministicCalendarEventId,
	replaceMentorCalendarEvent,
	selectNewBookingCalendarHost,
	stableCalendarAttemptKey,
} from "./google-calendar";

const mentorId = "mentor-1";
const mentorEmail = "mentor@example.com";
const menteeEmail = "mentee@example.com";

function connection(
	overrides: Partial<MentorCalendarConnection> = {},
): MentorCalendarConnection {
	return {
		connectionId: "connection-1",
		mentorId,
		status: "connected",
		identity: { email: mentorEmail, subject: "google-subject-1" },
		getAccessToken: async () => "fake-access-token",
		markReauthRequired: async () => undefined,
		...overrides,
	};
}

function provider(
	value: MentorCalendarConnection | null,
): MentorCalendarConnectionProvider {
	return { getMentorConnection: async () => value };
}

function response(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function event(attemptKey: string, email = mentorEmail, id = "event-1") {
	return {
		id,
		hangoutLink: "https://meet.google.com/fake-room",
		organizer: { email, id: "google-subject-1" },
		creator: { email, id: "google-subject-1" },
		extendedProperties: { private: { "4herfrikaBookingAttempt": attemptKey } },
	};
}

const createParams = (attemptKey: string) => ({
	mentorId,
	mentorEmail,
	menteeEmail,
	summary: "A private mentoring call",
	description: "Sensitive description stays in the request only",
	startAtUtc: new Date("2026-08-10T10:00:00.000Z"),
	endAtUtc: new Date("2026-08-10T10:30:00.000Z"),
	attemptKey,
});

describe("mentor-scoped Google Calendar", () => {
	test("fails closed without a mentor connection and never calls Google", async () => {
		let calls = 0;
		const client = createMentorCalendarClient({
			connectionProvider: provider(null),
			fetchImpl: async () => {
				calls += 1;
				return response({});
			},
		});
		await expect(
			client.ensureConnection({ mentorId, mentorEmail }),
		).rejects.toMatchObject({ code: "connection_unavailable" });
		expect(calls).toBe(0);
		await expect(
			createMentorCalendarClient({
				connectionProvider: provider(connection({ mentorId: "other" })),
			}).ensureConnection({ mentorId, mentorEmail }),
		).rejects.toMatchObject({ code: "connection_unavailable" });
		await expect(
			createMentorCalendarClient({
				connectionProvider: provider(
					connection({ identity: { email: "other@example.com" } }),
				),
			}).ensureConnection({ mentorId, mentorEmail }),
		).rejects.toMatchObject({ code: "identity_mismatch" });
	});

	test("selects the central host when no mentor connection exists", async () => {
		const host = await selectNewBookingCalendarHost({
			mentorId,
			mentorEmail,
			connectionProvider: provider(null),
		});
		expect(host).toEqual({ mode: "org_google", reason: "no_connection" });
	});

	test("selects a healthy mentor host with its validated access token", async () => {
		const host = await selectNewBookingCalendarHost({
			mentorId,
			mentorEmail,
			connectionProvider: provider(connection()),
		});
		expect(host).toMatchObject({
			mode: "mentor_google",
			accessToken: "fake-access-token",
		});
	});

	test("selects the central host for a broken grant and notifies once per attempt", async () => {
		let notices = 0;
		let marked = 0;
		let noticeSent = false;
		const broken = connection({
			getAccessToken: async () => {
				throw { code: "invalid_grant" };
			},
			markReauthRequired: async () => {
				marked += 1;
			},
			sendReauthorizationNotice: async () => {
				if (noticeSent) return;
				noticeSent = true;
				notices += 1;
			},
		});
		const host = await selectNewBookingCalendarHost({
			mentorId,
			mentorEmail,
			connectionProvider: provider(broken),
		});
		expect(host).toEqual({
			mode: "org_google",
			reason: "connection_unavailable",
		});
		expect(marked).toBe(1);
		expect(notices).toBe(1);
	});

	test("creates on primary with the mentee invited and a unique Meet", async () => {
		const attemptKey = stableCalendarAttemptKey(
			mentorId,
			"create",
			"booking-1",
		);
		const calls: { url: string; init?: RequestInit }[] = [];
		const client = createMentorCalendarClient({
			connectionProvider: provider(connection()),
			fetchImpl: async (input, init) => {
				calls.push({ url: String(input), init });
				return init?.method === "POST"
					? response(
							event(
								attemptKey,
								mentorEmail,
								deterministicCalendarEventId(attemptKey),
							),
						)
					: response({}, 404);
			},
		});
		await expect(
			client.createMentorCalendarEvent(createParams(attemptKey)),
		).resolves.toMatchObject({
			eventId: deterministicCalendarEventId(attemptKey),
		});
		const body = JSON.parse(String(calls[1].init?.body));
		expect(calls[0].url).toContain(
			`/calendars/primary/events/${deterministicCalendarEventId(attemptKey)}`,
		);
		expect(calls[1].url).toContain("conferenceDataVersion=1");
		expect(body.attendees).toEqual([{ email: menteeEmail }]);
		expect(body.conferenceData.createRequest.requestId).toBe(attemptKey);
		expect(body.id).toBe(deterministicCalendarEventId(attemptKey));
	});

	test("rejects a foreign organizer or creator without deleting it", async () => {
		let deletes = 0;
		const client = createMentorCalendarClient({
			connectionProvider: provider(connection()),
			fetchImpl: async (_input, init) => {
				if (init?.method === "DELETE") deletes += 1;
				return init?.method === "POST"
					? response(event("attempt", "wrong@example.com"))
					: response({}, 404);
			},
		});
		await expect(
			client.createMentorCalendarEvent(createParams("attempt")),
		).rejects.toMatchObject({ code: "identity_mismatch" });
		expect(deletes).toBe(0);
	});

	test("rejects duplicate recovery when the attempt marker does not match", async () => {
		let reads = 0;
		const attemptKey = "expected-attempt";
		const client = createMentorCalendarClient({
			connectionProvider: provider(connection()),
			fetchImpl: async (_input, init) => {
				if (init?.method === "POST") return response({}, 409);
				reads += 1;
				return reads === 1
					? response({}, 404)
					: response(event("different-attempt"));
			},
		});

		await expect(
			client.createMentorCalendarEvent(createParams(attemptKey)),
		).rejects.toMatchObject({ code: "attempt_key_conflict" });
	});

	test("refuses to delete an event without its attempt marker", async () => {
		let deletes = 0;
		const client = createMentorCalendarClient({
			connectionProvider: provider(connection()),
			fetchImpl: async (_input, init) => {
				if (init?.method === "DELETE") {
					deletes += 1;
					return response({});
				}
				return response({
					id: "event-without-marker",
					organizer: { email: mentorEmail, id: "google-subject-1" },
					creator: { email: mentorEmail, id: "google-subject-1" },
				});
			},
		});

		await expect(
			client.deleteMentorCalendarEvent({
				mentorId,
				mentorEmail,
				eventId: "event-without-marker",
				attemptKey: "expected-attempt",
			}),
		).rejects.toMatchObject({ code: "attempt_key_conflict" });
		expect(deletes).toBe(0);
	});

	test("marks reauthorization required on invalid_grant", async () => {
		let marked = 0;
		const client = createMentorCalendarClient({
			connectionProvider: provider(
				connection({
					getAccessToken: async () => {
						throw { code: "invalid_grant" };
					},
					markReauthRequired: async () => {
						marked += 1;
					},
				}),
			),
		});
		await expect(
			client.ensureConnection({ mentorId, mentorEmail }),
		).rejects.toMatchObject({ code: "reauth_required" });
		expect(marked).toBe(1);
	});

	test("creates replacement before delete and exposes manual resolution", async () => {
		const calls: string[] = [];
		let deletedAttempt: string | undefined;
		await expect(
			replaceMentorCalendarEvent(
				{
					...createParams("replacement-attempt"),
					oldEventId: "old-event",
					expectedOldAttemptKey: "old-attempt",
				},
				{
					createMentorCalendarEvent: async () => {
						calls.push("create");
						return {
							eventId: "replacement",
							meetUrl: "https://meet.google.com/replacement",
						};
					},
					deleteMentorCalendarEvent: async (params) => {
						calls.push("delete");
						deletedAttempt = params.expectedAttemptKey;
						throw new Error("remote cleanup unavailable");
					},
				},
			),
		).rejects.toMatchObject({ code: "manual_resolution_required" });
		expect(calls).toEqual(["create", "delete"]);
		expect(deletedAttempt).toBe("old-attempt");
	});
});
