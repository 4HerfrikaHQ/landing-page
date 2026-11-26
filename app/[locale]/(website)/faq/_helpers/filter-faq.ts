import type { FaqGroup } from "./faq-groups";

function normalize(text: string) {
	return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function filterFaqGroups(groups: FaqGroup[], query: string) {
	const terms = normalize(query).split(/\s+/).filter(Boolean);
	if (terms.length === 0) return groups;
	return groups.flatMap((group) => {
		const items = group.items.filter((item) => {
			const haystack = normalize(`${item.question} ${item.answer}`);
			return terms.every((term) => haystack.includes(term));
		});
		return items.length > 0 ? [{ ...group, items }] : [];
	});
}

export function countFaqItems(groups: FaqGroup[]) {
	return groups.reduce((total, group) => total + group.items.length, 0);
}
