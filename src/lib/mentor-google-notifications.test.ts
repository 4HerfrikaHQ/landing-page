import { expect, test } from "bun:test";
import { sendReconnectNoticeOnce } from "./mentor-google-notifications";

test("reconnect notice sentinel prevents a second send", async () => {
	let sentAt: Date | null = null;
	let sends = 0;
	const send = () => {
		sends += 1;
		return Promise.resolve({ data: { id: "email-1" }, error: null });
	};
	const markSent = () => {
		sentAt = new Date("2026-08-02T12:00:00.000Z");
		return Promise.resolve();
	};

	expect(await sendReconnectNoticeOnce({ sentAt, send, markSent })).toBe(true);
	expect(await sendReconnectNoticeOnce({ sentAt, send, markSent })).toBe(false);
	expect(sends).toBe(1);
});

test("response-level send failures do not mark the reconnect notice sent", async () => {
	let marked = 0;

	expect(
		await sendReconnectNoticeOnce({
			sentAt: null,
			send: () =>
				Promise.resolve({
					data: null,
					error: { message: "invalid recipient" },
				}),
			markSent: async () => {
				marked += 1;
			},
		}),
	).toBe(false);
	expect(marked).toBe(0);
});
