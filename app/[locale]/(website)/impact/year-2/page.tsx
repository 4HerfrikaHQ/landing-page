import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AcademySection } from "./_components/academy-section";
import { HowWeCount } from "./_components/how-we-count";
import { NewsletterCta } from "./_components/newsletter-cta";
import { PartnersSection } from "./_components/partners-section";
import { QuotesSection } from "./_components/quotes-section";
import { SectionMenu } from "./_components/section-menu";
import { StatRow } from "./_components/stat-row";
import { Wins } from "./_components/wins";
import { Year2Hero } from "./_components/year-2-hero";
import { hasPendingFigures, year2Report } from "./_report";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "impactYear2.seo" });
	return {
		title: t("title"),
		description: t("description"),
		robots: hasPendingFigures(year2Report) ? { index: false } : undefined,
	};
}

export default async function YearTwoReportPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<Year2Hero report={year2Report} />
			<SectionMenu />
			<section
				id="numbers"
				className="scroll-mt-20 bg-primary-500/2 px-4 py-14 lg:px-20 lg:py-24"
			>
				<div className="mx-auto max-w-6xl">
					<StatRow report={year2Report} />
					<Wins report={year2Report} />
				</div>
			</section>
			<AcademySection report={year2Report} />
			<QuotesSection report={year2Report} />
			<PartnersSection report={year2Report} />
			<NewsletterCta report={year2Report} />
			<HowWeCount />
		</main>
	);
}
