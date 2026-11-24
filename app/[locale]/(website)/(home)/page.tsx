import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { CourseBand } from "./_components/course-band";
import { DonateBand } from "./_components/donate-band";
import { HomeHero } from "./_components/home-hero";
import { MentorsSection } from "./_components/mentors-section";
import { PathsSection } from "./_components/paths-section";
import { StatsRow } from "./_components/stats-row";
import { StoriesSection } from "./_components/stories-section";
import { TestimonialsSection } from "./_components/testimonials-section";
import { getHomeContent } from "./_content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.home" });
	return { title: t("title"), description: t("description") };
}

export default async function HomePage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const { mentors, posts, testimonials } = await getHomeContent();

	return (
		<main className="overflow-x-clip bg-background text-foreground">
			<HomeHero />
			<StatsRow />
			<PathsSection />
			<MentorsSection mentors={mentors} />
			<CourseBand />
			<StoriesSection posts={posts} />
			<TestimonialsSection testimonials={testimonials} />
			<DonateBand />
		</main>
	);
}
