export function firstName(fullName: string) {
	return fullName.trim().split(/\s+/)[0] ?? "";
}

export function mentorCreditName({
	name,
	nickname,
}: { name: string; nickname: string | null }) {
	const preferred = nickname?.trim();
	return preferred ? `${preferred} (${name})` : name;
}

export type HomeStory = {
	id: string;
	href: string;
	title: string;
	category: string | null;
	isProject: boolean;
	date: string | null;
	imageUrl: string | null;
	imageAlt: string;
	excerpt: string;
};

const MARKDOWN_NOISE = /[*_`>#]|!\[[^\]]*\]\([^)]*\)|\[([^\]]*)\]\([^)]*\)/g;

export function plainExcerpt(markdown: string) {
	const paragraph =
		markdown
			.split(/\n\s*\n/)
			.map((block) => block.trim())
			.find((block) => block && !/^(#|!\[|[-*] |\d+\. )/.test(block)) ?? "";
	return paragraph
		.replace(
			MARKDOWN_NOISE,
			(_match, linkText: string | undefined) => linkText ?? "",
		)
		.replace(/\s+/g, " ")
		.trim();
}

export function newestFirst(stories: HomeStory[], limit: number) {
	return [...stories]
		.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
		.slice(0, limit);
}

export function hasStoryIdentity(post: {
	uid?: string | null;
	data: { title?: string | null };
}) {
	return Boolean(post.uid) && Boolean(post.data.title?.trim());
}
