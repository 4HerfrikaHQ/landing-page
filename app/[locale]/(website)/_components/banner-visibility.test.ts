import { describe, expect, test } from "bun:test";
import { isBannerExpired, isBannerHidden } from "./banner-visibility";

describe("isBannerHidden", () => {
	test("hides on the donate page", () => {
		expect(isBannerHidden("/donate")).toBe(true);
	});

	test("hides on the Year 2 report", () => {
		expect(isBannerHidden("/impact/two-steps-forward")).toBe(true);
	});

	test("shows on the career corner directory", () => {
		expect(isBannerHidden("/careercorner")).toBe(false);
	});

	test("hides on mentor profile and booking pages", () => {
		expect(isBannerHidden("/careercorner/some-mentor")).toBe(true);
	});

	test("shows on the academy catalog", () => {
		expect(isBannerHidden("/academy")).toBe(false);
	});

	test("hides on course and lesson pages", () => {
		expect(isBannerHidden("/academy/some-course")).toBe(true);
	});

	test("shows on the home page", () => {
		expect(isBannerHidden("/")).toBe(false);
	});
});

describe("isBannerExpired", () => {
	test("shows through 31 December 2026 in Lagos", () => {
		expect(isBannerExpired(Date.parse("2026-12-31T23:59:00+01:00"))).toBe(
			false,
		);
	});

	test("hides from 1 January 2027", () => {
		expect(isBannerExpired(Date.parse("2027-01-01T00:00:00+01:00"))).toBe(true);
	});
});
