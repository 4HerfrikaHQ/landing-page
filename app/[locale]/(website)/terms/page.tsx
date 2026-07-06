import { FadeIn } from "@/components/motion";
import { routing } from "@/i18n/routing";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

// Prerender every locale we serve; a locale outside routing falls back to en.
export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.terms" });
	return { title: t("title"), description: t("description") };
}

export default async function TermsPage({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}) {
	await setLocaleFromParams(params);
	const { locale } = await params;

	// Load the localized terms. Fall back to English if a locale file is missing.
	const key = routing.locales.includes(
		locale as (typeof routing.locales)[number],
	)
		? locale
		: routing.defaultLocale;
	const { default: Terms } = await import(`@/content/terms/${key}.mdx`).catch(
		() => import("@/content/terms/en.mdx"),
	);

	return (
		<div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
			<FadeIn>
				<article
					className="
            prose prose-gray max-w-none
            prose-headings:scroll-mt-24
            prose-h1:text-foreground prose-h1:font-extrabold
            prose-h2:text-foreground prose-h2:font-bold
            prose-p:text-foreground
            prose-strong:text-foreground
            prose-li:marker:text-foreground
            prose-a:text-pink-700 prose-a:no-underline hover:prose-a:underline
          "
				>
					<Terms />
				</article>
			</FadeIn>
		</div>
	);
}
