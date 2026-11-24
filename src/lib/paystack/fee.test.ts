import { describe, expect, test } from "bun:test";
import {
	canCoverFee,
	chargeFor,
	grossUpForFeeMinor,
	netAfterFeeMinor,
	paystackLocalFeeMinor,
} from "./fee";

const NAIRA = 100;

describe("paystackLocalFeeMinor (Paystack NGN local fee: 1.5% + ₦100, ₦100 waived under ₦2,500, capped at ₦2,000)", () => {
	test("charges 1.5% with no flat fee under ₦2,500", () => {
		expect(paystackLocalFeeMinor(2_000 * NAIRA)).toBe(30 * NAIRA);
	});

	test("adds the ₦100 flat fee from ₦2,500", () => {
		expect(paystackLocalFeeMinor(2_500 * NAIRA)).toBe(3_750 + 10_000);
		expect(paystackLocalFeeMinor(10_000 * NAIRA)).toBe(
			150 * NAIRA + 100 * NAIRA,
		);
	});

	test("caps the fee at ₦2,000", () => {
		expect(paystackLocalFeeMinor(200_000 * NAIRA)).toBe(2_000 * NAIRA);
		expect(paystackLocalFeeMinor(5_000_000 * NAIRA)).toBe(2_000 * NAIRA);
	});
});

describe("grossUpForFeeMinor (Paystack NGN local fee: 1.5% + ₦100, ₦100 waived under ₦2,500, capped at ₦2,000)", () => {
	test("leaves at least the requested net after the fee, never overshooting by more than a naira", () => {
		for (const naira of [
			1_000, 2_400, 2_462, 2_500, 5_000, 10_000, 25_000, 50_000, 133_000,
			150_000, 1_000_000,
		]) {
			const net = naira * NAIRA;
			const gross = grossUpForFeeMinor(net);
			expect(netAfterFeeMinor(gross)).toBeGreaterThanOrEqual(net);
			expect(netAfterFeeMinor(gross)).toBeLessThan(net + 2 * NAIRA);
		}
	});

	test("rounds the charge up to a whole naira", () => {
		expect(grossUpForFeeMinor(2_500_000) % 100).toBe(0);
	});

	test("adds exactly the ₦2,000 cap once the fee would exceed it", () => {
		expect(grossUpForFeeMinor(1_000_000 * NAIRA)).toBe(1_002_000 * NAIRA);
	});
});

describe("chargeFor", () => {
	test("charges the plain amount when the donor does not cover the fee", () => {
		expect(chargeFor(25_000, "NGN", false)).toEqual({
			chargeMinor: 2_500_000,
			feeMinor: 0,
		});
	});

	test("adds the fee for naira gifts when covered", () => {
		const { chargeMinor, feeMinor } = chargeFor(25_000, "NGN", true);
		expect(chargeMinor).toBe(2_500_000 + feeMinor);
		expect(feeMinor).toBeGreaterThan(0);
	});

	test("never adds a fee for dollar gifts", () => {
		expect(canCoverFee("USD")).toBe(false);
		expect(chargeFor(50, "USD", true)).toEqual({
			chargeMinor: 5000,
			feeMinor: 0,
		});
	});
});
