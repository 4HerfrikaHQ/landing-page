import { describe, expect, test } from "bun:test";
import type { FaqGroup } from "./faq-groups";
import { countFaqItems, filterFaqGroups } from "./filter-faq";

const groups: FaqGroup[] = [
	{
		id: "mentorship",
		title: "Mentorship",
		items: [
			{
				id: "who",
				question: "Who can join?",
				answer: "Young women in universities.",
				paragraphs: ["Young women in universities."],
			},
			{
				id: "coach",
				question: "What is coaching?",
				answer: "A conversation with a professional.",
				paragraphs: ["A conversation with a professional."],
			},
		],
	},
	{
		id: "donations",
		title: "Donations",
		items: [
			{
				id: "give",
				question: "How can I donate?",
				answer: "Bank transfer.",
				paragraphs: ["Bank transfer."],
			},
		],
	},
];

describe("filterFaqGroups", () => {
	test("returns everything for a blank query", () => {
		expect(filterFaqGroups(groups, "  ")).toBe(groups);
	});

	test("matches question and answer text, ignoring case and accents", () => {
		expect(countFaqItems(filterFaqGroups(groups, "UNIVÉRSITIES"))).toBe(1);
		expect(countFaqItems(filterFaqGroups(groups, "donate"))).toBe(1);
	});

	test("requires every term and drops empty groups", () => {
		const result = filterFaqGroups(groups, "professional conversation");
		expect(result.map((group) => group.id)).toEqual(["mentorship"]);
		expect(filterFaqGroups(groups, "zebra")).toEqual([]);
	});
});
