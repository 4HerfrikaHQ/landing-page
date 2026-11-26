import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BuiltSection } from "./_components/built-section";
import { CampusesSection } from "./_components/campuses-section";
import { ClosingSection } from "./_components/closing-section";
import { FounderNote } from "./_components/founder-note";
import { GiveSection } from "./_components/give-section";
import { MentorshipSection } from "./_components/mentorship-section";
import { NumbersSection } from "./_components/numbers-section";
import { OutreachSection } from "./_components/outreach-section";
import { SectionMenu } from "./_components/section-menu";
import { Year2Hero } from "./_components/year-2-hero";
import { year2Report } from "./_report";

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
		robots: year2Report.fullCountPublished ? undefined : { index: false },
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
			<FounderNote />
			<BuiltSection />
			<OutreachSection />
			<CampusesSection />
			<MentorshipSection />
			<NumbersSection report={year2Report} />
			<GiveSection />
			<ClosingSection />
		</main>
	);
}
