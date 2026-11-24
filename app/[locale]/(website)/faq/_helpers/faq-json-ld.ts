import type { FaqGroup } from "./faq-groups";

export function buildFaqJsonLd(groups: FaqGroup[]) {
	const json = JSON.stringify({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: groups.flatMap((group) =>
			group.items.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: { "@type": "Answer", text: item.answer },
			})),
		),
	});
	return json.replace(/</g, "\\u003c");
}
