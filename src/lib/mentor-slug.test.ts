import { describe, expect, test } from "bun:test";
import {
	isUniqueViolation,
	normalizeMentorSlugInput,
	parseMentorSlug,
} from "./mentor-slug";

describe("normalizeMentorSlugInput", () => {
	test("lowercases input and replaces whitespace with hyphens", () => {
		expect(normalizeMentorSlugInput("My  Unique Link")).toBe("my-unique-link");
	});
});

describe("parseMentorSlug", () => {
	test("normalizes casing and surrounding whitespace", () => {
		expect(parseMentorSlug("  Mentor-42 ")).toEqual({
			success: true,
			slug: "mentor-42",
		});
	});

	test("normalizes spaces before validating", () => {
		expect(parseMentorSlug("My Unique Link")).toEqual({
			success: true,
			slug: "my-unique-link",
		});
	});

	test("accepts URL-safe slugs", () => {
		expect(parseMentorSlug("ronnie-the-storyteller").success).toBe(true);
	});

	test("rejects blank, malformed, and reserved slugs", () => {
		for (const value of ["", "emoji-✨", "two--hyphens", "apply"]) {
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
