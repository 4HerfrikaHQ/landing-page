import { createSlugger } from "./slugify";

export type FaqItem = {
	id: string;
	question: string;
	answer: string;
	paragraphs: string[];
};

export type FaqGroup = {
	id: string;
	title: string;
	items: FaqItem[];
};

type RawFaqSection = {
	section?: {
		data?: {
			title?: string | null;
			faq?: Array<{
				question?: string | null;
				answer?: string | null;
			}>;
		};
	} | null;
};

export function splitParagraphs(answer: string) {
	return answer
		.split(/\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
}

export function buildFaqGroups(
	sections: ReadonlyArray<unknown>,
	fallbackTitle: string,
): FaqGroup[] {
	const slug = createSlugger();
	return (sections as RawFaqSection[]).flatMap((entry, sectionIndex) => {
		const data = entry.section?.data;
		const title = data?.title?.trim() || fallbackTitle;
		const items = (data?.faq ?? []).flatMap((raw, itemIndex) => {
			const question = raw.question?.trim();
			const answer = raw.answer?.trim();
			if (!question || !answer) return [];
			return [
				{
					id: slug(question, `question-${sectionIndex}-${itemIndex}`),
					question,
					answer,
					paragraphs: splitParagraphs(answer),
				},
			];
		});
		if (items.length === 0) return [];
		return [{ id: slug(title, `topic-${sectionIndex}`), title, items }];
	});
}
