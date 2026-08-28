import { afterEach, describe, expect, test } from "bun:test";
import { MailpitEmailTransport } from "./mailpit";

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("MailpitEmailTransport", () => {
	test("maps application email fields to Mailpit's HTTP API", async () => {
		let request: { url: string; init?: RequestInit } | undefined;
		globalThis.fetch = (async (url, init) => {
			request = { url: String(url), init };
			return Response.json({ ID: "mailpit-message-1" });
		}) as typeof fetch;

		const result = await new MailpitEmailTransport().send({
			from: "4HerFrika <hello@4herfrika.org>",
			to: "mentor@example.com",
			subject: "Finish your profile",
			text: "Open the onboarding link",
			attachments: [{ filename: "invite.txt", content: "aGVsbG8=" }],
		});

		expect(result).toEqual({ data: { id: "mailpit-message-1" }, error: null });
		expect(request?.url).toBe("http://127.0.0.1:54324/api/v1/send");
		const payload = JSON.parse(String(request?.init?.body));
		expect(payload).toMatchObject({
			From: { Email: "hello@4herfrika.org", Name: "4HerFrika" },
			To: [{ Email: "mentor@example.com" }],
			Subject: "Finish your profile",
			Text: "Open the onboarding link",
			Attachments: [{ Filename: "invite.txt", Content: "aGVsbG8=" }],
		});
	});

	test("throws when Mailpit rejects a message", async () => {
		globalThis.fetch = (async () =>
			new Response(null, { status: 500 })) as typeof fetch;
		await expect(
			new MailpitEmailTransport().send({
				from: "hello@example.com",
				to: "mentor@example.com",
				subject: "Test",
				text: "Test",
			}),
		).rejects.toThrow("Mailpit email failed with status 500");
	});
});
