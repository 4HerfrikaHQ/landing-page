import { describe, expect, test } from "bun:test";
import { isBannerHidden } from "./banner-visibility";

describe("isBannerHidden", () => {
	test("hides on the donate page", () => {
		expect(isBannerHidden("/donate")).toBe(true);
	});

	test("hides on the Year 2 report", () => {
		expect(isBannerHidden("/impact/year-2")).toBe(true);
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
