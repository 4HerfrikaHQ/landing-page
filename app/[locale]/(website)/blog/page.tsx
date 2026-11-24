import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BlogIndex } from "./_components/blog-index";

export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.blog" });
	return { title: t("title"), description: t("description") };
}

export default async function BlogPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	const locale = await setLocaleFromParams(params);
	return <BlogIndex locale={locale} category={null} />;
}
