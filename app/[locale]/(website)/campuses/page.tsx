import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import UnderlineSquiggle from "../about/underline-squiggle";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCampusesTotal, searchCampuses } from "./_actions";
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

	const [initialCampuses, total] = await Promise.all([
		searchCampuses({ page: 0, pageSize: PAGE_SIZE }).catch(() => []),
		getCampusesTotal().catch(() => 0),
	]);

	return (
		<main className="bg-background">
			<section className="bg-muted py-16 md:py-24 lg:py-28">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
					<FadeIn>
						<h1 className="text-pretty text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
							{t("heroTitle")}
						</h1>
					</FadeIn>
					<UnderlineSquiggle width={220} className="mt-4 mb-6" />
					<FadeIn delay={0.1}>
						<p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
							{t("heroDescription")}
						</p>
					</FadeIn>
					{total > 0 && (
						<FadeIn delay={0.15}>
							<p className="mt-6 text-sm md:text-base font-semibold tracking-wider text-primary-500 uppercase">
								{total} {t("breadcrumb")}
							</p>
						</FadeIn>
					)}
				</div>
			</section>

			<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
				{total === 0 ? (
					<CampusesEmptyState />
				) : (
					<CampusesBrowser initialCampuses={initialCampuses} />
				)}
			</section>

			<QuickActions />
		</main>
	);
}
