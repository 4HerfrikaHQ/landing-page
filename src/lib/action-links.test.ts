import { describe, expect, test } from "bun:test";
import { generateActionLinkToken, hashActionLinkToken } from "./action-links";

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
