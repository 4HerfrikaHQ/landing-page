import { createClient } from "@/prismicio";
import * as prismic from "@prismicio/client";
import type { Content } from "@prismicio/client";
import { cache } from "react";
import { projects } from "../projects/_schema";
import {
	type FeedCategory,
	type FeedItem,
	PROJECTS_CATEGORY,
	STORIES_CATEGORY,
	feedCategories,
	mergeFeed,
	projectExcerpt,
	readingMinutes,
} from "./_feed";
import { feedItemKindSchema, imageFitSchema } from "./_schema";
import { postText } from "./_utils";

type LinkedCategory = { name?: string };

function toPostItem(
	post: Content.BlogPostDocument,
	storiesName: string,
): FeedItem | null {
	if (!post.uid || !post.data.title) return null;
	const link = post.data.category;
	const linked = prismic.isFilled.contentRelationship(link) ? link : null;
	const cover = post.data.cover_image;
	return {
		kind: feedItemKindSchema.enum.post,
		slug: post.uid,
		href: `/blog/${post.uid}`,
		title: post.data.title,
		excerpt: post.data.description ?? "",
		date: post.first_publication_date ?? "",
		minutes: readingMinutes(postText(post)),
		categorySlug: linked?.uid ?? STORIES_CATEGORY,
		categoryName:
			(linked?.data as LinkedCategory | undefined)?.name ?? storiesName,
		imageSrc: cover?.url ?? "",
		imageAlt: cover?.alt ?? "",
		imageFit: imageFitSchema.enum.cover,
	};
}

function projectItems(projectsName: string): FeedItem[] {
	return Object.entries(projects).map(([slug, project]) => ({
		kind: feedItemKindSchema.enum.project,
		slug,
		href: `/projects/${slug}`,
		title: project.title,
		excerpt: projectExcerpt(project.content),
		date: project.date,
		minutes: readingMinutes(project.content),
		categorySlug: PROJECTS_CATEGORY,
		categoryName: projectsName,
		imageSrc: project.cover,
		imageAlt: "",
		imageFit: project.coverFit,
	}));
}

async function fetchPosts() {
	try {
		return await createClient().getAllByType("blog_post", {
			fetchLinks: ["blog_category.name", "blog_category.uid"],
			orderings: [
				{ field: "document.first_publication_date", direction: "desc" },
			],
		});
	} catch (error) {
		console.error("blog: failed to load posts from Prismic", error);
		return [];
	}
}

async function fetchCategories(): Promise<FeedCategory[]> {
	try {
		const documents = await createClient().getAllByType("blog_category");
		return documents.flatMap((document) =>
			document.uid
				? [
						{
							id: document.id,
							slug: document.uid,
							name: document.data.name ?? document.uid,
						},
					]
				: [],
		);
	} catch (error) {
		console.error("blog: failed to load categories from Prismic", error);
		return [];
	}
}

export const loadFeed = cache(
	async (storiesName: string, projectsName: string) => {
		const [posts, blogCategories] = await Promise.all([
			fetchPosts(),
			fetchCategories(),
		]);
		const postEntries = posts.flatMap((post) => {
			const item = toPostItem(post, storiesName);
			return item ? [item] : [];
		});
		const items = mergeFeed(postEntries, projectItems(projectsName));
		const chips = feedCategories(items, blogCategories, projectsName);
		return { items, chips, blogCategories };
	},
);
