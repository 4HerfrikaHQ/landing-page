import { describe, expect, test } from "bun:test";
import {
	formatAmount,
	fromMinorUnits,
	isAmountWithinLimits,
	parseAmount,
	toMinorUnits,
} from "./amounts";

describe("parseAmount", () => {
	test("reads plain, comma-grouped and symbol-prefixed whole amounts", () => {
		expect(parseAmount("25000")).toBe(25000);
		expect(parseAmount("25,000")).toBe(25000);
		expect(parseAmount(" ₦ 25,000 ")).toBe(25000);
		expect(parseAmount("$50")).toBe(50);
		expect(parseAmount("1000.00")).toBe(1000);
	});

	test("rejects empty, negative, fractional and non-numeric input", () => {
		for (const value of [
			"",
			"abc",
			"-5000",
			"1000.5",
			"1e5",
			"10 000 000 000",
		]) {
			expect(parseAmount(value)).toBeNull();
		}
	});
});

describe("isAmountWithinLimits", () => {
	test("enforces the naira minimum and maximum", () => {
		expect(isAmountWithinLimits(999, "NGN")).toBe(false);
		expect(isAmountWithinLimits(1000, "NGN")).toBe(true);
		expect(isAmountWithinLimits(10_000_000, "NGN")).toBe(true);
		expect(isAmountWithinLimits(10_000_001, "NGN")).toBe(false);
	});

	test("enforces the dollar minimum and maximum", () => {
		expect(isAmountWithinLimits(4, "USD")).toBe(false);
		expect(isAmountWithinLimits(5, "USD")).toBe(true);
		expect(isAmountWithinLimits(10_001, "USD")).toBe(false);
	});

	test("rejects fractional amounts", () => {
		expect(isAmountWithinLimits(1000.5, "NGN")).toBe(false);
	});
});

describe("minor units", () => {
	test("converts to kobo and cents without float drift", () => {
		expect(toMinorUnits(25_000)).toBe(2_500_000);
		expect(toMinorUnits(19.99)).toBe(1999);
		expect(fromMinorUnits(2_500_000)).toBe(25_000);
	});
});

describe("formatAmount", () => {
	test("prefixes the currency symbol and groups thousands", () => {
		expect(formatAmount(25000, "NGN")).toBe("₦25,000");
		expect(formatAmount(50, "USD")).toBe("$50");
	});
});
