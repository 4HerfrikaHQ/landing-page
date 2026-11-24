"use client";

import { useState } from "react";
import { type CardData, FeedCard } from "./feed-card";

const PAGE_SIZE = 9;

type Props = {
	cards: CardData[];
	loadMoreLabel: string;
	showingTemplate: string;
};

export function FeedGrid({ cards, loadMoreLabel, showingTemplate }: Props) {
	const [visible, setVisible] = useState(PAGE_SIZE);
	const shown = Math.min(visible, cards.length);
	const hasMore = shown < cards.length;

	return (
		<>
			<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{cards.slice(0, shown).map((card) => (
					<li key={card.href}>
						<FeedCard card={card} />
					</li>
				))}
			</ul>
			{hasMore ? (
				<div className="mt-10 flex flex-col items-center gap-2">
					<button
						type="button"
						onClick={() => setVisible(shown + PAGE_SIZE)}
						className="inline-flex h-12 cursor-pointer items-center rounded-pill border-2 border-primary-500 px-8 font-medium text-primary-500 outline-none hover:bg-primary-500 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
					>
						{loadMoreLabel}
					</button>
					<output className="text-sm text-muted-foreground">
						{showingTemplate
							.replace("{shown}", String(shown))
							.replace("{total}", String(cards.length))}
					</output>
				</div>
			) : null}
		</>
	);
}
