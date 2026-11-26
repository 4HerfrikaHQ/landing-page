import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { careerCornerMetadata } from "@/src/lib/careercorner-seo";
import {
	absoluteSiteUrl,
	localizedCareerCornerPath,
} from "@/src/lib/careercorner-seo";
import { resolveFeaturedMentor } from "@/src/lib/featured-mentor";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getMentors } from "./_actions";
import { DirectoryTransitionProvider } from "./_components/directory-transition";
import { FeaturedMentorCard } from "./_components/featured-mentor-card";
import { CareersHero } from "./_components/hero";
import { HowACallWorks } from "./_components/how-a-call-works";
import { MentorDirectory } from "./_components/mentor-directory";
import { VolunteerBand } from "./_components/volunteer-band";
import { MENTOR_PAGE_SIZE, parseMentorPage } from "./_utils/mentor-search";

const CareersCorner = async ({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{ q?: string; available?: string; page?: string }>;
}) => {
	const { locale } = await params;
	await setLocaleFromParams(params);
	const sp = await searchParams;
	const page = parseMentorPage(sp.page);

	const query = typeof sp.q === "string" ? sp.q : "";
	const isSearching = query.trim().length > 0;

	const [tCareers, { mentors, total }, featured] = await Promise.all([
		getTranslations("careers"),
		getMentors({ query, onlyAvailable: sp.available === "1", page }),
		resolveFeaturedMentor(),
	]);

	const pageUrl = absoluteSiteUrl(localizedCareerCornerPath(locale));
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		"@id": `${pageUrl}#webpage`,
		url: pageUrl,
		name: tCareers("title"),
		description: tCareers("counselingDescription"),
		isPartOf: {
			"@type": "WebSite",
			name: "4Herfrika",
			url: absoluteSiteUrl("/"),
		},
		mainEntity: {
			"@type": "ItemList",
			numberOfItems: total,
			itemListElement: mentors.map((mentor, index) => ({
				"@type": "ListItem",
				position: (page - 1) * MENTOR_PAGE_SIZE + index + 1,
				url: absoluteSiteUrl(
					localizedCareerCornerPath(locale, `/${mentor.slug}`),
				),
				item: {
					"@type": "Person",
					name: mentor.nickname || mentor.name,
					jobTitle: mentor.position || undefined,
					description: mentor.bio?.slice(0, 240) || undefined,
					image: mentor.image ? absoluteSiteUrl(mentor.image) : undefined,
				},
			})),
		},
	};

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<DirectoryTransitionProvider>
				<CareersHero />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
					}}
				/>
				<FeaturedMentorCard mentor={isSearching ? null : featured} />
				<MentorDirectory mentors={mentors} total={total} page={page} />
			</DirectoryTransitionProvider>
			<VolunteerBand />
			<HowACallWorks />
		</main>
	);
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.careers" });
	return careerCornerMetadata(locale, t("title"), t("description"));
}

export default CareersCorner;
