import { FadeIn } from "@/components/motion/fade-in";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { loadFeed } from "../_data";
import {
	type FeedCategory,
	PROJECTS_CATEGORY,
	filterFeed,
	findCategory,
} from "../_feed";
import { BlogHero } from "./blog-hero";
import { toCardData } from "./card-data";
import { CategoryChips } from "./category-chips";
import { FeaturedCard } from "./featured-card";
import type { CardData } from "./feed-card";
import { FeedGrid } from "./feed-grid";
import { NewsletterBand } from "./newsletter-band";
import { ProjectsMovedBand } from "./projects-moved-band";
import { StoryBand } from "./story-band";

type Props = { locale: string; category: string | null };

function FeaturedSlot({ card }: { card: CardData | null }) {
	if (!card) return null;
	return <FeaturedCard card={card} />;
}

function MovedSlot({ hidden }: { hidden: boolean }) {
	if (hidden) return null;
	return <ProjectsMovedBand />;
}

async function SectionHeading({ active }: { active: FeedCategory | null }) {
	const t = await getTranslations("blogPage");
	if (active) {
		return (
			<h2 className="text-[32px] font-bold leading-none lg:text-5xl">
				<em className="font-playfair font-black text-primary-500">
					{active.name}
				</em>
			</h2>
		);
	}
	return (
		<h2 className="text-[32px] font-bold leading-none lg:text-5xl">
			{t("freshFrom")}{" "}
			<em className="font-playfair font-black text-primary-500">
				{t("freshEm")}
			</em>
		</h2>
	);
}

async function FeedSection({ cards }: { cards: CardData[] }) {
	const t = await getTranslations("blogPage");
	if (cards.length === 0) {
		return (
			<div className="rounded-[20px] bg-surface-pink px-6 py-16 text-center">
				<p className="text-xl font-semibold">{t("empty")}</p>
				<p className="mt-1 text-muted-foreground">{t("emptyHint")}</p>
			</div>
		);
	}
	return (
		<FeedGrid
			cards={cards}
			loadMoreLabel={t("loadMore")}
			showingTemplate={t("showing", { shown: "{shown}", total: "{total}" })}
		/>
	);
}

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
	const [first, ...rest] = cards;
	const featured = active || !first ? null : first;
	const gridCards = featured ? rest : cards;
	const gridKey = active?.slug ?? "all";
	const heroFirst = active ? t("categoryHeroFirst") : t("heroFirst");
	const heroSecond = active ? active.name : t("heroSecond");
	const heroDescription = active
		? t("categoryHeroDescription")
		: t("heroDescription");

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<BlogHero
				withFeatured={featured !== null}
				first={heroFirst}
				second={heroSecond}
				description={heroDescription}
			/>
			<FeaturedSlot card={featured} />

			<section className="px-4 pb-6 pt-16 lg:px-20 lg:pt-24">
				<div className="mx-auto max-w-6xl">
					<FadeIn className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
						<SectionHeading active={active} />
						<p className="text-[15px] text-muted-foreground">
							{t("projectsLiveHere")}
						</p>
					</FadeIn>
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
					<FeedSection key={gridKey} cards={gridCards} />
				</div>
			</section>

			<MovedSlot hidden={active?.slug === PROJECTS_CATEGORY} />
			<StoryBand categories={blogCategories} />
			<NewsletterBand />
		</main>
	);
}
