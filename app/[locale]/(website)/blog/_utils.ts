import type { Content } from "@prismicio/client";

export function postText(post: Content.BlogPostDocument): string {
	return post.data.slices
		.flatMap((slice) => {
			if (slice.slice_type !== "blog_content") return [];
			if (slice.variation === "quote") return [String(slice.primary.text)];
			return (slice.primary.text as Array<{ text: string }>).map(
				(node) => node.text,
			);
		})
		.join(" ");
}

export function formatFeedDate(iso: string, locale: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(date);
}
