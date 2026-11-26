"use client";

import { RevealGroup } from "@/components/motion/reveal-group";
import { RollLabel } from "@/components/ui/roll-label";
import { useState } from "react";
import { type CardData, FeedCard } from "./feed-card";

const PAGE_SIZE = 9;

type Props = {
	cards: CardData[];
	loadMoreLabel: string;
	showingTemplate: string;
};

type MoreProps = {
	shown: number;
	total: number;
	loadMoreLabel: string;
	showingTemplate: string;
	onMore: () => void;
};

function LoadMore({
	shown,
	total,
	loadMoreLabel,
	showingTemplate,
	onMore,
}: MoreProps) {
	if (shown >= total) return null;
	return (
		<div className="mt-10 flex flex-col items-center gap-2">
			<button
				type="button"
				onClick={onMore}
				className="press inline-flex h-12 cursor-pointer items-center rounded-pill border-2 border-primary-500 px-8 font-medium text-primary-500 outline-none hover:bg-primary-500 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
			>
				<RollLabel>{loadMoreLabel}</RollLabel>
			</button>
			<output className="text-sm text-muted-foreground">
				{showingTemplate
					.replace("{shown}", String(shown))
					.replace("{total}", String(total))}
			</output>
		</div>
	);
}

export function FeedGrid({ cards, loadMoreLabel, showingTemplate }: Props) {
	const [visible, setVisible] = useState(PAGE_SIZE);
	const shown = Math.min(visible, cards.length);

	return (
		<>
			<RevealGroup
				as="ul"
				className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 sm:max-lg:[&>li:last-child:nth-child(odd)]:col-span-2 sm:max-lg:[&>li:last-child:nth-child(odd)]:w-[calc(50%-0.75rem)] sm:max-lg:[&>li:last-child:nth-child(odd)]:justify-self-center"
			>
				{cards.slice(0, shown).map((card) => (
					<li key={card.href}>
						<FeedCard card={card} />
					</li>
				))}
			</RevealGroup>
			<LoadMore
				shown={shown}
				total={cards.length}
				loadMoreLabel={loadMoreLabel}
				showingTemplate={showingTemplate}
				onMore={() => setVisible(shown + PAGE_SIZE)}
			/>
		</>
	);
}
