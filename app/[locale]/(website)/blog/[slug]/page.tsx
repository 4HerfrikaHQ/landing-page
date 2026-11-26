import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { components } from "@/slices";
import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { articleJsonLd } from "../_article";
import { ArticleShell } from "../_components/article-shell";
import { toCardData } from "../_components/card-data";
import { loadFeed } from "../_data";
import {
	STORIES_CATEGORY,
	absoluteUrl,
	readingMinutes,
	relatedItems,
} from "../_feed";
import { formatFeedDate, postText } from "../_utils";
import { getBlogPost } from "./_actions";

export const revalidate = 86400;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
	params,
}: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	try {
		const post = await getBlogPost(slug);
		const image = post.data.cover_image?.url;
		return {
			title: post.data.title ?? "",
			description: post.data.description ?? "",
			openGraph: {
				title: post.data.title ?? "",
				description: post.data.description ?? "",
				type: "article",
				publishedTime: post.first_publication_date ?? undefined,
				...(image ? { images: [{ url: image }] } : {}),
			},
		};
	} catch {
		return {};
	}
}

export default async function BlogPostPage({ params }: { params: Params }) {
	const locale = await setLocaleFromParams(params);
	const { slug } = await params;

	const post = await getBlogPost(slug).catch(() => null);
	if (!post) notFound();

	const t = await getTranslations("blogPage");
	const { items } = await loadFeed(t("stories"), t("projects"));
	const current = items.find((item) => item.href === `/blog/${slug}`);

	const categorySlug = current?.categorySlug ?? STORIES_CATEGORY;
	const categoryName = current?.categoryName ?? t("stories");
	const minutes = readingMinutes(postText(post));
	const date = post.first_publication_date ?? "";
	const labels = {
		minRead: (count: number) => t("minRead", { minutes: count }),
		readStory: t("readStory"),
		readProject: t("readProject"),
	};
	const related = relatedItems(items, {
		href: `/blog/${slug}`,
		categorySlug,
	}).map((item) => toCardData(item, locale, labels));

	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";
	const url = absoluteUrl(siteUrl, locale, `/blog/${slug}`);
	const cover = post.data.cover_image;

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialised with angle brackets escaped
				dangerouslySetInnerHTML={{
					__html: articleJsonLd({
						title: post.data.title ?? "",
						description: post.data.description ?? "",
						image: cover?.url ?? "",
						date,
						author: post.data.author ?? "",
						url,
					}),
				}}
			/>
			<ArticleShell
				title={post.data.title ?? ""}
				categorySlug={categorySlug}
				categoryName={categoryName}
				meta={[formatFeedDate(date, locale), labels.minRead(minutes)]
					.filter(Boolean)
					.join(" · ")}
				author={post.data.author ?? ""}
				imageSrc={cover?.url ?? ""}
				imageAlt={cover?.alt ?? ""}
				url={url}
				related={related}
			>
				<div className="flex flex-col gap-6">
					<SliceZone slices={post.data.slices} components={components} />
				</div>
			</ArticleShell>
		</>
	);
}
