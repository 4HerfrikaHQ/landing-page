import type { Content } from "@prismicio/client";
import { createClient } from "@/prismicio";

export async function getBlogPosts() {
	const client = createClient();
	return client.getAllByType("blog_post", {
		fetchLinks: ["blog_category.name", "blog_category.uid"],
		orderings: [{ field: "document.first_publication_date", direction: "desc" }],
	});
}

export async function getCategories() {
	const client = createClient();
	return client.getAllByType("blog_category");
}

export function computeReadTime(post: Content.BlogPostDocument): string {
	const text = post.data.slices
		.flatMap((slice) => {
			if (slice.slice_type === "blog_content" && slice.variation === "default") {
				return (slice.primary.text as Array<{ text: string }>).map((n) => n.text);
			}
			return [];
		})
		.join(" ");
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function formatPrismicDate(post: Content.BlogPostDocument): string {
	const date = post.first_publication_date;
	if (!date) return "";
	return new Date(date).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}
