import type { Content } from "@prismicio/client";
import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";

export async function getBlogPost(
	uid: string,
	previewData?: Record<string, unknown>,
) {
	const client = createClient({ previewData });
	return client.getByUID("blog_post", uid, {
		fetchLinks: ["blog_category.name", "blog_category.uid"],
	});
}

export async function getRelatedPosts(
	currentId: string,
	categoryId: string | null,
	limit = 4,
	previewData?: Record<string, unknown>,
): Promise<Content.BlogPostDocument[]> {
	const client = createClient({ previewData });
	const notCurrent = prismic.filter.not("document.id", currentId);

	if (!categoryId) {
		return client.getAllByType("blog_post", {
			filters: [notCurrent],
			orderings: [{ field: "document.first_publication_date", direction: "desc" }],
			pageSize: limit,
		});
	}

	const sameCategory = await client.getAllByType("blog_post", {
		filters: [notCurrent, prismic.filter.at("my.blog_post.category", categoryId)],
		orderings: [{ field: "document.first_publication_date", direction: "desc" }],
		pageSize: limit,
	});

	if (sameCategory.length >= limit) return sameCategory;

	const sameCategoryIds = new Set(sameCategory.map((p) => p.id));
	const backfill = await client.getAllByType("blog_post", {
		filters: [notCurrent, prismic.filter.not("my.blog_post.category", categoryId)],
		orderings: [{ field: "document.first_publication_date", direction: "desc" }],
		pageSize: limit - sameCategory.length,
	});

	return [...sameCategory, ...backfill];
}

export function formatPrismicDateShort(post: Content.BlogPostDocument): string {
	const date = post.first_publication_date;
	if (!date) return "";
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}
