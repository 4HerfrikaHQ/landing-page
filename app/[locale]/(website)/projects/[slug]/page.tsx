import { ArticleShell } from "@/app/[locale]/(website)/blog/_components/article-shell";
import { toCardData } from "@/app/[locale]/(website)/blog/_components/card-data";
import { loadFeed } from "@/app/[locale]/(website)/blog/_data";
import {
	PROJECTS_CATEGORY,
	absoluteUrl,
	projectExcerpt,
	readingMinutes,
	relatedItems,
} from "@/app/[locale]/(website)/blog/_feed";
import { imageFitSchema } from "@/app/[locale]/(website)/blog/_schema";
import { formatFeedDate } from "@/app/[locale]/(website)/blog/_utils";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { ProjectContent } from "../_components/project-content";
import { type ProjectSlug, projects } from "../_schema";

export function generateStaticParams() {
	return Object.keys(projects).map((slug) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const project = projects[slug as ProjectSlug];
	if (!project) return {};
	return {
		title: project.title,
		description: projectExcerpt(project.content),
	};
}

function PosterCover({
	src,
	alt,
	fit,
}: { src: string; alt: string; fit: string }) {
	if (fit !== imageFitSchema.enum.contain) return null;
	return (
		<Image
			src={src}
			alt={alt}
			width={1280}
			height={1280}
			sizes="(min-width: 1024px) 680px, 100vw"
			className="mb-8 h-auto w-full rounded-[20px]"
		/>
	);
}

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ locale: string; slug: string }>;
}) {
	const locale = await setLocaleFromParams(params);
	const { slug } = await params;
	const project = projects[slug as ProjectSlug];
	if (!project) notFound();

	const t = await getTranslations("blogPage");
	const { items } = await loadFeed(t("stories"), t("projects"));
	const labels = {
		minRead: (count: number) => t("minRead", { minutes: count }),
		readStory: t("readStory"),
		readProject: t("readProject"),
	};
	const related = relatedItems(items, {
		href: `/projects/${slug}`,
		categorySlug: PROJECTS_CATEGORY,
	}).map((item) => toCardData(item, locale, labels));
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";

	return (
		<ArticleShell
			title={project.title}
			categorySlug={PROJECTS_CATEGORY}
			categoryName={t("projects")}
			meta={[
				formatFeedDate(project.date, locale),
				labels.minRead(readingMinutes(project.content)),
			].join(" · ")}
			author=""
			imageSrc={
				project.coverFit === imageFitSchema.enum.cover ? project.cover : ""
			}
			imageAlt=""
			url={absoluteUrl(siteUrl, locale, `/projects/${slug}`)}
			related={related}
		>
			<PosterCover
				src={project.cover}
				alt={project.title}
				fit={project.coverFit}
			/>
			<ProjectContent>
				<Streamdown
					mode="static"
					animated
					translations={{ downloadImage: t("downloadImage") }}
				>
					{project.content}
				</Streamdown>
			</ProjectContent>
		</ArticleShell>
	);
}
