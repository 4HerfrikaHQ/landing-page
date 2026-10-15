import { describe, expect, test } from "bun:test";
import { filterMentors } from "./mentor-directory-filters";

const mentors = [
	{
		name: "Déborah Ade",
		nickname: "Debby",
		position: "Senior Product Manager",
		availability: [{}],
	},
	{
		name: "Ada Okafor",
		nickname: null,
		position: "Software Developer",
		availability: [],
	},
	{
		name: "Jane Doe",
		nickname: null,
		position: "Product Designer",
		availability: [{}],
	},
	{
		name: "Grace Bello",
		nickname: null,
		position: "Engineering Manager",
		availability: null,
	},
	{ name: "Mary Smith", nickname: null, position: null },
];

const search = (query: string, available = false) =>
	filterMentors(mentors, query, available).map((mentor) => mentor.name);

describe("mentor directory fuzzy search", () => {
	test("product management finds Product Manager, without matching every product role", () => {
		expect(search("product management")).toEqual(["Déborah Ade"]);
	});

	test("accepts role variants in either direction", () => {
		expect(search("software development")).toEqual(["Ada Okafor"]);
		expect(search("engineer")).toEqual(["Grace Bello"]);
		expect(
			filterMentors(
				[{ name: "Ada", nickname: null, position: "Product Management" }],
				"product manager",
				false,
			),
		).toHaveLength(1);
	});

	test("handles misspellings and adjacent transpositions", () => {
		for (const query of [
			"prodcut manager",
			"product managr",
			"sofware developer",
		]) {
			expect(search(query)).toHaveLength(1);
		}
		expect(search("prodcut managment")).toEqual(["Déborah Ade"]);
	});

	test("normalizes case, accents, spacing and punctuation", () => {
		expect(search("  DEBORAH   product-management ")).toEqual(["Déborah Ade"]);
	});

	test("matches name, nickname, role fragments and reordered words", () => {
		expect(search("debby")).toEqual(["Déborah Ade"]);
		expect(search("okafor")).toEqual(["Ada Okafor"]);
		expect(search("prod")).toEqual(["Déborah Ade", "Jane Doe"]);
		expect(search("manager product")).toEqual(["Déborah Ade"]);
	});

	test("requires every query word and rejects unrelated roles and short-word typos", () => {
		for (const query of [
			"product accountant",
			"astronaut",
			"production manager",
			"xyz",
			"axa",
		]) {
			expect(search(query)).toEqual([]);
		}
	});

	test("blank queries preserve order, including incomplete profiles", () => {
		expect(filterMentors(mentors, "   ", false)).toEqual(mentors);
		expect(search("mary")).toEqual(["Mary Smith"]);
	});

	test("availability remains an independent constraint on fuzzy results", () => {
		expect(search("software development", true)).toEqual([]);
		expect(search("product management", true)).toEqual(["Déborah Ade"]);
		expect(search("", true)).toEqual(["Déborah Ade", "Jane Doe"]);
	});

	test("does not mutate the input list", () => {
		const original = structuredClone(mentors);
		search("product management", true);
		expect(mentors).toEqual(original);
	});
});
