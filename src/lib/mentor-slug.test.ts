import { describe, expect, test } from "bun:test";
import { isUniqueViolation, parseMentorSlug } from "./mentor-slug";

describe("parseMentorSlug", () => {
	test("normalizes casing and surrounding whitespace", () => {
		expect(parseMentorSlug("  Mentor-42 ")).toEqual({
			success: true,
			slug: "mentor-42",
		});
	});

	test("accepts URL-safe slugs", () => {
		expect(parseMentorSlug("ronnie-the-storyteller").success).toBe(true);
	});

	test("rejects blank, malformed, and reserved slugs", () => {
		for (const value of [
			"",
			"two words",
			"emoji-✨",
			"two--hyphens",
			"apply",
		]) {
			expect(parseMentorSlug(value).success).toBe(false);
		}
	});
});

describe("isUniqueViolation", () => {
	test("recognizes Postgres unique violations", () => {
		expect(isUniqueViolation({ code: "23505" })).toBe(true);
		expect(isUniqueViolation({ code: "23514" })).toBe(false);
		expect(isUniqueViolation(new Error("duplicate"))).toBe(false);
	});
});
