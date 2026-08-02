import { expect, test } from "bun:test";
import { sendReconnectNoticeOnce } from "./mentor-google-notifications";

test("reconnect notice sentinel prevents a second send", async () => {
	let sentAt: Date | null = null;
	let sends = 0;
	const send = () => {
		sends += 1;
		return Promise.resolve();
	};
	const markSent = () => {
		sentAt = new Date("2026-08-02T12:00:00.000Z");
		return Promise.resolve();
	};

	expect(await sendReconnectNoticeOnce({ sentAt, send, markSent })).toBe(true);
	expect(await sendReconnectNoticeOnce({ sentAt, send, markSent })).toBe(false);
	expect(sends).toBe(1);
});
