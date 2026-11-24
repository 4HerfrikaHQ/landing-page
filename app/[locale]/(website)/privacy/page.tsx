import { routing } from "@/i18n/routing";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "../_components/legal/legal-page";

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.privacy" });
	return { title: t("title"), description: t("description") };
}

export default async function PrivacyPage({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	const locale = await setLocaleFromParams(params);
	return <LegalPage kind="privacy" locale={locale} />;
}
