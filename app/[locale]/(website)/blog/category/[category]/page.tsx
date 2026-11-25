import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BlogIndex } from "../../_components/blog-index";
import { loadFeed } from "../../_data";
import { PROJECTS_CATEGORY, findCategory } from "../../_feed";

export const revalidate = 3600;

type Params = Promise<{ locale: Locale; category: string }>;

export async function generateMetadata({
	params,
}: { params: Params }): Promise<Metadata> {
	const { locale, category } = await params;
	if (category === PROJECTS_CATEGORY) {
		const t = await getTranslations({ locale, namespace: "seo.projects" });
		return { title: t("title"), description: t("description") };
	}
	const [t, tp] = await Promise.all([
		getTranslations({ locale, namespace: "seo.blogCategory" }),
		getTranslations({ locale, namespace: "blogPage" }),
	]);
	const { chips, blogCategories } = await loadFeed(
		tp("stories"),
		tp("projects"),
	);
	const found = findCategory(category, chips, blogCategories);
	if (!found) return {};
	return {
		title: t("title", { name: found.name }),
		description: t("description", { name: found.name }),
	};
}

export default async function BlogCategoryPage({
	params,
}: { params: Promise<{ locale: string; category: string }> }) {
	const locale = await setLocaleFromParams(params);
	const { category } = await params;
	return <BlogIndex locale={locale} category={category} />;
}
