import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getFaqPage } from "./_actions";
import { FaqHero } from "./_components/faq-hero";
import { FaqResults } from "./_components/faq-results";
import { FaqSearch } from "./_components/faq-search";
import { StillStuck } from "./_components/still-stuck";
import { type FaqGroup, buildFaqGroups } from "./_helpers/faq-groups";
import { buildFaqJsonLd } from "./_helpers/faq-json-ld";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.faq" });
	return { title: t("title"), description: t("description") };
}

async function loadFaq(fallbackTitle: string) {
	try {
		const page = await getFaqPage();
		return {
			groups: buildFaqGroups(
				page.data.frequently_asked_questions,
				fallbackTitle,
			),
			image: page.data.header_image,
		};
	} catch {
		return { groups: [], image: null };
	}
}

function HeroSearch({ groups }: { groups: FaqGroup[] }) {
	if (groups.length === 0) return null;
	return <FaqSearch />;
}

async function FaqBody({ groups }: { groups: FaqGroup[] }) {
	if (groups.length === 0) {
		const t = await getTranslations("faq");
		return (
			<output className="mx-auto block max-w-xl px-4 py-20 text-center text-lg text-muted-foreground">
				{t("loadError")}
			</output>
		);
	}
	return (
		<>
			<FaqResults groups={groups} />
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD with escaped "<"
				dangerouslySetInnerHTML={{ __html: buildFaqJsonLd(groups) }}
			/>
		</>
	);
}

export default async function FAQPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const t = await getTranslations("faq");
	const { groups, image } = await loadFaq(t("title"));

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<FaqHero imageUrl={image?.url ?? null} imageAlt={image?.alt ?? ""}>
				<HeroSearch groups={groups} />
			</FaqHero>
			<FaqBody groups={groups} />
			<StillStuck />
		</main>
	);
}
