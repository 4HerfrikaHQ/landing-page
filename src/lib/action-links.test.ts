import { describe, expect, test } from "bun:test";
import {
	generateActionLinkToken,
	hashActionLinkToken,
	validateActionLinkRecord,
} from "./action-links";

const FUTURE = new Date(Date.now() + 24 * 60 * 60 * 1000);

describe("action-link tokens", () => {
	test("generates compact 128-bit base64url tokens", () => {
		const first = generateActionLinkToken();
		const second = generateActionLinkToken();
		expect(first).toMatch(/^[A-Za-z0-9_-]{22}$/);
		expect(second).toMatch(/^[A-Za-z0-9_-]{22}$/);
		expect(second).not.toBe(first);
	});

	test("hashes tokens deterministically without preserving plaintext", () => {
		const token = "J7vQm2xR8kNp4sTw6cYzLA";
		const hash = hashActionLinkToken(token);
		expect(hash).toHaveLength(64);
		expect(hash).toBe(hashActionLinkToken(token));
		expect(hash).not.toContain(token);
	});
});

describe("action-link validation", () => {
	const valid = {
		action: "mentor_onboard",
		resourceId: "3d6f4d9a-47ca-4f68-a7a3-8ef725db88ac",
		expiresAt: FUTURE,
		usedAt: null,
	};

	test("accepts a matching unused link before expiry", () => {
		expect(validateActionLinkRecord(valid, "mentor_onboard")).toEqual({
			ok: true,
			action: "mentor_onboard",
			resourceId: valid.resourceId,
		});
	});

	test("rejects wrong-action, used, and expired links", () => {
		expect(validateActionLinkRecord(valid, "feedback")).toEqual({
			ok: false,
			reason: "wrong_action",
		});
		expect(
			validateActionLinkRecord(
				{ ...valid, usedAt: new Date(Date.now() - 60 * 1000) },
				"mentor_onboard",
			),
		).toEqual({ ok: false, reason: "used" });
		expect(
			validateActionLinkRecord(
				{ ...valid, expiresAt: new Date(Date.now() - 60 * 1000) },
				"mentor_onboard",
			),
		).toEqual({ ok: false, reason: "expired" });
	});
});
