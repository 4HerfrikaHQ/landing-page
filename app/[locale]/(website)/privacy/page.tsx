import { FadeIn } from "@/components/motion";
import { routing } from "@/i18n/routing";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";

// Prerender every locale we serve; a locale outside routing falls back to en.
export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

const TITLES: Record<string, string> = {
	en: "Privacy Policy — 4Herfrika",
	fr: "Politique de confidentialité — 4Herfrika",
	sw: "Sera ya Faragha — 4Herfrika",
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	return { title: TITLES[locale] ?? TITLES.en };
}

export default async function PrivacyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	await setLocaleFromParams(params);
	const { locale } = await params;

	// Load the localized policy. Fall back to English if a locale file is missing.
	const key = routing.locales.includes(
		locale as (typeof routing.locales)[number],
	)
		? locale
		: routing.defaultLocale;
	const { default: Privacy } = await import(
		`@/content/privacy/${key}.mdx`
	).catch(() => import("@/content/privacy/en.mdx"));

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
					<Privacy />
				</article>
			</FadeIn>
		</div>
	);
}
