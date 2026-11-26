import { describe, expect, test } from "bun:test";
import { isActivePath } from "./is-active-path";

describe("isActivePath", () => {
	test("matches the exact path", () => {
		expect(isActivePath("/academy", "/academy")).toBe(true);
	});

	test("matches nested paths", () => {
		expect(isActivePath("/careercorner/jane-doe", "/careercorner")).toBe(true);
		expect(isActivePath("/blog/some-post", "/blog")).toBe(true);
	});

	test("does not match sibling paths sharing a prefix", () => {
		expect(isActivePath("/about-us", "/about")).toBe(false);
		expect(isActivePath("/impactful", "/impact")).toBe(false);
	});

	test("does not match the home path against nav links", () => {
		expect(isActivePath("/", "/about")).toBe(false);
	});
});
