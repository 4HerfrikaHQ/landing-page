export const PROJECTS_CATEGORY = "projects";
export const STORIES_CATEGORY = "stories";

export type FeedItemKind = "post" | "project";

export type FeedItem = {
	kind: FeedItemKind;
	slug: string;
	href: string;
	title: string;
	excerpt: string;
	date: string;
	minutes: number;
	categorySlug: string;
	categoryName: string;
	imageSrc: string;
	imageAlt: string;
};

export type FeedCategory = { slug: string; name: string; id?: string };

export type ChipTone = "navy" | "pink" | "indigo" | "teal";

const WORDS_PER_MINUTE = 200;
const EXCERPT_LENGTH = 150;
const CHIP_TONES: readonly ChipTone[] = ["pink", "indigo", "teal"];

function timestamp(item: FeedItem) {
	const value = new Date(item.date).getTime();
	return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
}

export function mergeFeed(...lists: FeedItem[][]): FeedItem[] {
	return lists.flat().sort((a, b) => timestamp(b) - timestamp(a));
}

export function filterFeed(items: FeedItem[], category: string | null) {
	if (!category) return items;
	return items.filter((item) => item.categorySlug === category);
}

export function feedCategories(
	items: FeedItem[],
	blogCategories: FeedCategory[],
	projectsName: string,
): FeedCategory[] {
	const used = new Set(items.map((item) => item.categorySlug));
	const blog = blogCategories.filter(
		(category) =>
			category.slug !== PROJECTS_CATEGORY && used.has(category.slug),
	);
	return [{ slug: PROJECTS_CATEGORY, name: projectsName }, ...blog];
}

export function findCategory(
	slug: string,
	chips: FeedCategory[],
	blogCategories: FeedCategory[],
): FeedCategory | null {
	return (
		[...chips, ...blogCategories].find((category) => category.slug === slug) ??
		null
	);
}

export function readingMinutes(text: string) {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function chipTone(slug: string): ChipTone {
	if (slug === PROJECTS_CATEGORY) return "navy";
	if (slug === STORIES_CATEGORY) return "pink";
	let hash = 0;
	for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) % 997;
	return CHIP_TONES[hash % CHIP_TONES.length];
}

export function stripMarkdown(markdown: string) {
	return markdown
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[*_`>#]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

export function projectExcerpt(markdown: string) {
	const firstParagraph = markdown.split(/\n{2,}/)[0] ?? "";
	const text = stripMarkdown(firstParagraph);
	if (text.length <= EXCERPT_LENGTH) return text;
	const cut = text.slice(0, EXCERPT_LENGTH);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_LENGTH)}…`;
}

export function splitTitle(title: string) {
	const index = title.indexOf(": ");
	if (index < 1) return { lead: title, accent: "" };
	return {
		lead: title.slice(0, index + 1),
		accent: title.slice(index + 2),
	};
}

export function relatedItems(
	items: FeedItem[],
	current: Pick<FeedItem, "href" | "categorySlug">,
	limit = 3,
) {
	return items
		.filter(
			(item) =>
				item.categorySlug === current.categorySlug &&
				item.href !== current.href,
		)
		.slice(0, limit);
}

export function categoryHref(slug: string) {
	return `/blog/category/${slug}`;
}

export function shareLinks(url: string, title: string) {
	const encodedUrl = encodeURIComponent(url);
	return {
		whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
		x: `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodedUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
	};
}

export function absoluteUrl(siteUrl: string, locale: string, path: string) {
	const prefix = locale === "en" ? "" : `/${locale}`;
	return `${siteUrl.replace(/\/$/, "")}${prefix}${path}`;
}
