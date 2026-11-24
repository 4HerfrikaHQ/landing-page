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
import { formatFeedDate } from "@/app/[locale]/(website)/blog/_utils";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
			imageSrc={project.cover}
			imageAlt=""
			url={absoluteUrl(siteUrl, locale, `/projects/${slug}`)}
			related={related}
		>
			<ProjectContent>
				<Streamdown mode="static" animated>
					{project.content}
				</Streamdown>
			</ProjectContent>
		</ArticleShell>
	);
}
