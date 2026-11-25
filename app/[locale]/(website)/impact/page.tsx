import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ClosingCta } from "./_components/closing-cta";
import { GoalBand } from "./_components/goal-band";
import { ImpactHero } from "./_components/impact-hero";
import { ImpactStats } from "./_components/impact-stats";
import { ReportsSection } from "./_components/reports-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.impactReports" });
	return { title: t("title"), description: t("description") };
}

export default async function ImpactPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<ImpactHero />
			<ImpactStats />
			<ReportsSection />
			<GoalBand />
			<ClosingCta />
		</main>
	);
}
