import { FadeIn } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ClosingSection } from "./_components/closing-section";
import { HighlightsSection } from "./_components/highlights-section";
import { NumbersSection } from "./_components/numbers-section";
import { ReportBand } from "./_components/report-band";
import { Year2Hero } from "./_components/year-2-hero";
import { year2Report } from "./_report";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "impactYear2.seo" });
	return { title: t("title"), description: t("description") };
}

export default async function YearTwoReportPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const t = await getTranslations("impactYear2");

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<Year2Hero report={year2Report} />
			<div className="mx-auto max-w-6xl px-4 pt-6 lg:px-20">
				<Link
					href="/impact"
					className="inline-flex min-h-11 items-center gap-2 rounded-full text-[15px] font-medium text-primary-500 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					{t("allReports")}
				</Link>
			</div>
			<FadeIn>
				<p className="mx-auto max-w-5xl px-6 py-16 text-center text-lg leading-relaxed text-muted-foreground lg:py-24 lg:text-[32px] lg:leading-snug">
					{t("intro")}
				</p>
			</FadeIn>
			<NumbersSection report={year2Report} />
			<HighlightsSection />
			<ReportBand report={year2Report} />
			<ClosingSection />
		</main>
	);
}
