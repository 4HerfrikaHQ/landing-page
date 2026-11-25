import { describe, expect, test } from "bun:test";
import {
	type HomeStory,
	hasStoryIdentity,
	newestFirst,
	plainExcerpt,
} from "./_helpers";

const story = (id: string, date: string | null): HomeStory => ({
	id,
	href: `/blog/${id}`,
	title: id,
	category: null,
	isProject: false,
	date,
	imageUrl: null,
	imageAlt: id,
	excerpt: "",
});

describe("home stories", () => {
	test("a project excerpt is its first plain paragraph", () => {
		const markdown = `## Overview\n\n![Photo](https://x/y.jpg)\n\nThe **bootcamp** ran for [two weeks](https://x) on campus.\n\n- a list`;
		expect(plainExcerpt(markdown)).toBe(
			"The bootcamp ran for two weeks on campus.",
		);
	});

	test("posts and projects mix newest first and respect the limit", () => {
		const mixed = newestFirst(
			[
				story("old", "2024-09-12"),
				story("new", "2026-08-01"),
				story("none", null),
				story("mid", "2024-11-01"),
			],
			3,
		);
		expect(mixed.map((s) => s.id)).toEqual(["new", "mid", "old"]);
	});

	test("posts without a uid or title are dropped", () => {
		expect(hasStoryIdentity({ uid: "a", data: { title: "A" } })).toBe(true);
		expect(hasStoryIdentity({ uid: null, data: { title: "A" } })).toBe(false);
		expect(hasStoryIdentity({ uid: "", data: { title: "A" } })).toBe(false);
		expect(hasStoryIdentity({ uid: "a", data: { title: "  " } })).toBe(false);
		expect(hasStoryIdentity({ uid: "a", data: { title: null } })).toBe(false);
	});
});
