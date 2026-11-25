import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { PaystackTransaction } from "@/src/lib/paystack/transaction";

const REFERENCE = "4HF-0123456789ABCDEF";

let verified: PaystackTransaction | null = null;
let verifyCalls = 0;

mock.module("@/src/lib/paystack/client", () => ({
	PaystackError: class PaystackError extends Error {
		constructor(
			message: string,
			readonly status: number,
		) {
			super(message);
		}
	},
	verifyTransaction: async () => {
		verifyCalls += 1;
		return verified;
	},
}));

const { resolveOutcome } = await import("./outcome");

function transaction(
	overrides: Partial<PaystackTransaction> = {},
): PaystackTransaction {
	return {
		status: "success",
		reference: REFERENCE,
		amount: 2_500_000,
		currency: "NGN",
		customer: { email: "ada@example.com" },
		metadata: { source: "4herfrika-donate", name: "Ada Obi" },
		...overrides,
	};
}

beforeEach(() => {
	verified = transaction();
	verifyCalls = 0;
});

describe("resolveOutcome", () => {
	test("reports success only for a verified donation with the same reference", async () => {
		const outcome = await resolveOutcome(REFERENCE);
		expect(outcome.status).toBe("success");
		if (outcome.status === "success") {
			expect(outcome.gift.amount).toBe(25_000);
			expect(outcome.gift.name).toBe("Ada");
		}
	});

	test("rejects a reference that was not issued by this site without calling Paystack", async () => {
		for (const reference of [
			"abc",
			"../../x",
			"4HF-123",
			"ORD-0123456789ABCDEF",
		]) {
			expect((await resolveOutcome(reference)).status).toBe("failed");
		}
		expect(verifyCalls).toBe(0);
	});

	test("fails when Paystack returns a different transaction than requested", async () => {
		verified = transaction({ reference: "4HF-FFFFFFFFFFFFFFFF" });
		expect((await resolveOutcome(REFERENCE)).status).toBe("failed");
	});

	test("fails for a transaction that is not a donation", async () => {
		verified = transaction({ metadata: { source: "other-shop" } });
		expect((await resolveOutcome(REFERENCE)).status).toBe("failed");
	});

	test("reports pending while the payment is in flight and failed when abandoned", async () => {
		verified = transaction({ status: "ongoing" });
		expect((await resolveOutcome(REFERENCE)).status).toBe("pending");
		verified = transaction({ status: "abandoned" });
		expect((await resolveOutcome(REFERENCE)).status).toBe("failed");
	});
});
