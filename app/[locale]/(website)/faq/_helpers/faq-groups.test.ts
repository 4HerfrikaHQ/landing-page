import { describe, expect, test } from "bun:test";
import { buildFaqGroups } from "./faq-groups";

describe("buildFaqGroups", () => {
	test("maps Prismic sections, skipping empty entries and deduping ids", () => {
		const groups = buildFaqGroups(
			[
				{
					section: {
						data: {
							title: "General",
							faq: [
								{ question: "Same?", answer: "One.\nTwo." },
								{ question: "Same?", answer: "Again." },
								{ question: "", answer: "orphan" },
							],
						},
					},
				},
				{ section: null },
				{ section: { data: { title: "Empty", faq: [] } } },
			],
			"FAQs",
		);
		expect(groups).toHaveLength(1);
		expect(groups[0]?.id).toBe("general");
		expect(groups[0]?.items.map((item) => item.id)).toEqual(["same", "same-2"]);
		expect(groups[0]?.items[0]?.paragraphs).toEqual(["One.", "Two."]);
	});

	test("uses the fallback title when a section has none", () => {
		const groups = buildFaqGroups(
			[{ section: { data: { faq: [{ question: "Q", answer: "A" }] } } }],
			"FAQs",
		);
		expect(groups[0]?.title).toBe("FAQs");
	});
});
