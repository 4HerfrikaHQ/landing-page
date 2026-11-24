import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { loadFeed } from "../_data";
import { PROJECTS_CATEGORY, filterFeed, findCategory } from "../_feed";
import { BlogHero } from "./blog-hero";
import { toCardData } from "./card-data";
import { CategoryChips } from "./category-chips";
import { FeaturedCard } from "./featured-card";
import { FeedGrid } from "./feed-grid";
import { NewsletterBand } from "./newsletter-band";
import { ProjectsMovedBand } from "./projects-moved-band";
import { StoryBand } from "./story-band";

type Props = { locale: string; category: string | null };

export async function BlogIndex({ locale, category }: Props) {
	const t = await getTranslations("blogPage");
	const { items, chips, blogCategories } = await loadFeed(
		t("stories"),
		t("projects"),
	);

	const active = category
		? findCategory(category, chips, blogCategories)
		: null;
	if (category && !active) notFound();

	const visible = filterFeed(items, active?.slug ?? null);
	const labels = {
		minRead: (minutes: number) => t("minRead", { minutes }),
		readStory: t("readStory"),
		readProject: t("readProject"),
	};
	const cards = visible.map((item) => toCardData(item, locale, labels));
	const [featured, ...rest] = cards;
	const hasFeatured = !active && featured !== undefined;
	const gridCards = hasFeatured ? rest : cards;
	const isProjects = active?.slug === PROJECTS_CATEGORY;

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<BlogHero withFeatured={hasFeatured} />
			{hasFeatured ? <FeaturedCard card={featured} /> : null}

			<section className="px-4 pb-6 pt-16 lg:px-20 lg:pt-24">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
						<h2 className="text-[32px] font-bold leading-none lg:text-5xl">
							{active ? (
								<em className="font-playfair font-black text-primary-500">
									{active.name}
								</em>
							) : (
								<>
									{t("freshFrom")}{" "}
									<em className="font-playfair font-black text-primary-500">
										{t("freshEm")}
									</em>
								</>
							)}
						</h2>
						<p className="text-[15px] text-muted-foreground">
							{t("projectsLiveHere")}
						</p>
					</div>
					<CategoryChips
						label={t("filterLabel")}
						allLabel={t("all")}
						categories={chips}
						active={active?.slug ?? null}
					/>
				</div>
			</section>

			<section className="px-4 pb-16 lg:px-20 lg:pb-24">
				<div className="mx-auto max-w-6xl">
					{gridCards.length > 0 ? (
						<FeedGrid
							cards={gridCards}
							loadMoreLabel={t("loadMore")}
							showingTemplate={t("showing", {
								shown: "{shown}",
								total: "{total}",
							})}
						/>
					) : (
						<div className="rounded-[20px] bg-surface-pink px-6 py-16 text-center">
							<p className="text-xl font-semibold">{t("empty")}</p>
							<p className="mt-1 text-muted-foreground">{t("emptyHint")}</p>
						</div>
					)}
				</div>
			</section>

			{isProjects ? null : <ProjectsMovedBand />}
			<StoryBand categories={blogCategories} />
			<NewsletterBand />
		</main>
	);
}
