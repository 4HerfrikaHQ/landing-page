import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AboutGive } from "./_components/about-give";
import { AboutHero } from "./_components/about-hero";
import { AboutJoin } from "./_components/about-join";
import { AboutPartners } from "./_components/about-partners";
import { AboutStatements } from "./_components/about-statements";
import { AboutStats } from "./_components/about-stats";
import { AboutTimeline } from "./_components/about-timeline";
import { AboutValues } from "./_components/about-values";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.about" });
	return { title: t("title"), description: t("description") };
}

export default async function About({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<AboutHero />
			<AboutStats />
			<AboutStatements />
			<AboutTimeline />
			<AboutValues />
			<AboutGive />
			<AboutPartners />
			<AboutJoin />
		</main>
	);
}
