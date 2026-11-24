import { describe, expect, test } from "bun:test";
import { createSlugger, slugify } from "./slugify";

describe("slugify", () => {
	test("lowercases, strips accents and punctuation", () => {
		expect(slugify("Who can join 4Herfrika?")).toBe("who-can-join-4herfrika");
		expect(slugify("Qu’est-ce que l’académie ?")).toBe(
			"quest-ce-que-lacademie",
		);
	});

	test("returns an empty string when nothing usable remains", () => {
		expect(slugify("???")).toBe("");
	});
});

describe("createSlugger", () => {
	test("suffixes duplicates and falls back when empty", () => {
		const slug = createSlugger();
		expect(slug("Donate", "x")).toBe("donate");
		expect(slug("Donate", "x")).toBe("donate-2");
		expect(slug("???", "topic-1")).toBe("topic-1");
	});
});
