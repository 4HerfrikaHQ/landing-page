import type { Metadata } from "next";
import { FeaturedStory } from "@/components/featured-story";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCampusCountries, getCampusesTotal, searchCampuses } from "./_actions";
import { CampusesBrowser } from "./_components/campuses-browser";
import { CampusesEmptyState } from "./_components/empty-state";
import { QuickActions } from "./_components/quick-actions";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
	title: "Our Campuses — 4Herfrika Across Africa",
	description:
		"Discover the African universities where 4Herfrika is building community — chapter stories, ambassadors, and how to get involved on your campus.",
};

export default async function CampusesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("campuses");

	const [initialCampuses, total, countries] = await Promise.all([
		searchCampuses({ page: 0, pageSize: PAGE_SIZE }).catch(() => []),
		getCampusesTotal().catch(() => 0),
		getCampusCountries().catch(() => []),
	]);
	const featured = initialCampuses[0];

	return (
		<main className="bg-background">
			<section
				className="-mt-16 lg:-mt-[90px] pt-16 lg:pt-[90px] flex flex-col items-center justify-center text-center px-4 min-h-[580px]"
				style={{
					background:
						"linear-gradient(180deg, rgba(236,0,140,0.18) 0%, rgba(236,0,140,0.08) 45%, rgba(255,255,255,1) 85%)",
				}}
			>
				<div className="max-w-3xl mx-auto flex flex-col items-center gap-6 mt-16">
					<h1 className="text-5xl lg:text-[64px] font-bold leading-[1.1] text-foreground">
						{t("heroTitle")}
					</h1>
					<p className="text-lg lg:text-2xl text-foreground/60 max-w-2xl">
						{t("heroDescription")}
					</p>
					<Link
						href="#campuses-grid"
						className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-full px-8 py-4 text-lg font-medium hover:!no-underline hover:brightness-90 transition-all"
					>
						{t("browseCampusesCta")}
						<ArrowRight className="size-5" />
					</Link>
				</div>
			</section>

			{featured && (
				<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-18">
					<FeaturedStory
						uid={featured.uid ?? ""}
						href={`/campuses/${featured.uid}`}
						title={featured.data.name ?? ""}
						description={featured.data.summary ?? ""}
						imageUrl={featured.data.cover_image?.url ?? ""}
						label={t("featuredLabel")}
						ctaLabel={t("readCampusStory")}
					/>
				</section>
			)}

			<section
				id="campuses-grid"
				className="container mx-auto px-4 sm:px-6 lg:px-8 pb-18"
			>
				{total === 0 ? (
					<CampusesEmptyState />
				) : (
					<CampusesBrowser initialCampuses={initialCampuses} countries={countries} />
				)}
			</section>

			<QuickActions />
		</main>
	);
}
