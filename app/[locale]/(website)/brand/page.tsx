import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BrandHero } from "./_components/brand-hero";
import { ColoursSection } from "./_components/colours-section";
import { ContactSection } from "./_components/contact-section";
import { LogosSection } from "./_components/logos-section";
import { TypographySection } from "./_components/typography-section";
import { UsageSection } from "./_components/usage-section";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.brand" });
	return { title: t("title"), description: t("description") };
}

export default async function BrandPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<BrandHero />
			<LogosSection />
			<ColoursSection />
			<TypographySection />
			<UsageSection />
			<ContactSection />
		</main>
	);
}
