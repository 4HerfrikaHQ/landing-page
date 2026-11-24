import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import { categoryHref } from "../_feed";
import { type CardData, FeedCard } from "./feed-card";

type Props = { cards: CardData[]; categorySlug: string; categoryName: string };

export async function RelatedSection({
	cards,
	categorySlug,
	categoryName,
}: Props) {
	const t = await getTranslations("blogPage");
	if (cards.length === 0) return null;

	return (
		<section className="bg-primary-500/3 px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<div className="flex items-end justify-between gap-4">
					<h2 className="text-[30px] font-bold leading-none lg:text-5xl">
						{t("keep")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("reading")}
						</em>
					</h2>
					<Link
						href={categoryHref(categorySlug) as Route}
						className="hidden h-11 items-center font-medium text-primary-500 underline underline-offset-4 lg:inline-flex"
					>
						{t("allIn", { category: categoryName })}{" "}
						<span aria-hidden="true">&nbsp;→</span>
					</Link>
				</div>
				<ul className="-mx-4 mt-8 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0">
					{cards.map((card) => (
						<li
							key={card.href}
							className="w-[82%] shrink-0 snap-start lg:w-auto"
						>
							<FeedCard card={card} />
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
