import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { verifyPaystackSignature } from "./signature";

const SECRET = "sk_test_fake_secret_for_unit_tests";

const SAMPLE_PAYLOAD = JSON.stringify({
	event: "charge.success",
	data: {
		id: 302961,
		status: "success",
		reference: "4HF-0123456789ABCDEF",
		amount: 2500000,
		currency: "NGN",
		paid_at: "2026-11-21T14:32:11.000Z",
		customer: { id: 84312, email: "donor@example.com", first_name: "Amara" },
		authorization: { last4: "4081", brand: "visa" },
		plan: {},
		metadata: {
			source: "4herfrika-donate",
			name: "Amara Okafor",
			frequency: "once",
		},
	},
});

function sign(body: string, secret = SECRET) {
	return createHmac("sha512", secret).update(body).digest("hex");
}

describe("verifyPaystackSignature", () => {
	test("accepts a recorded charge.success payload signed with the secret", () => {
		expect(
			verifyPaystackSignature(SAMPLE_PAYLOAD, sign(SAMPLE_PAYLOAD), SECRET),
		).toBe(true);
	});

	test("rejects a body changed after signing", () => {
		const tampered = SAMPLE_PAYLOAD.replace("2500000", "1");
		expect(
			verifyPaystackSignature(tampered, sign(SAMPLE_PAYLOAD), SECRET),
		).toBe(false);
	});

	test("rejects a signature made with another secret", () => {
		expect(
			verifyPaystackSignature(
				SAMPLE_PAYLOAD,
				sign(SAMPLE_PAYLOAD, "other"),
				SECRET,
			),
		).toBe(false);
	});

	test("rejects missing, short and non-hex signatures", () => {
		for (const signature of [null, "", "abc", "z".repeat(128)]) {
			expect(verifyPaystackSignature(SAMPLE_PAYLOAD, signature, SECRET)).toBe(
				false,
			);
		}
	});

	test("rejects everything when no secret is configured", () => {
		expect(
			verifyPaystackSignature(SAMPLE_PAYLOAD, sign(SAMPLE_PAYLOAD, ""), ""),
		).toBe(false);
	});
});
