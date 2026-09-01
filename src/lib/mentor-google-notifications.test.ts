import { expect, test } from "bun:test";
import { sendClaimedNoticeOnce } from "./mentor-google-notifications";

test("a won claim sends, and does not release", async () => {
	let sends = 0;
	let releases = 0;

	const sent = await sendClaimedNoticeOnce({
		claim: () => Promise.resolve(true),
		send: () => {
			sends += 1;
			return Promise.resolve({ data: { id: "email-1" }, error: null });
		},
		release: async () => {
			releases += 1;
		},
	});

	expect(sent).toBe(true);
	expect(sends).toBe(1);
	expect(releases).toBe(0);
});

test("a lost claim never sends", async () => {
	let sends = 0;

	const sent = await sendClaimedNoticeOnce({
		claim: () => Promise.resolve(false),
		send: () => {
			sends += 1;
			return Promise.resolve({ data: { id: "email-1" }, error: null });
		},
		release: () => Promise.resolve(),
	});

	expect(sent).toBe(false);
	expect(sends).toBe(0);
});

test("a response-level send failure releases the claim so it can retry", async () => {
	let releases = 0;

	const sent = await sendClaimedNoticeOnce({
		claim: () => Promise.resolve(true),
		send: () =>
			Promise.resolve({ data: null, error: { message: "invalid recipient" } }),
		release: async () => {
			releases += 1;
		},
	});

	expect(sent).toBe(false);
	expect(releases).toBe(1);
});

test("a thrown send failure also releases the claim", async () => {
	let releases = 0;

	const sent = await sendClaimedNoticeOnce({
		claim: () => Promise.resolve(true),
		send: () => Promise.reject(new Error("network down")),
		release: async () => {
			releases += 1;
		},
	});

	expect(sent).toBe(false);
	expect(releases).toBe(1);
});
