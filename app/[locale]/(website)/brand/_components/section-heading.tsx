import type { ReactNode } from "react";

export function PinkBadge({ children }: { children: ReactNode }) {
	return (
		<span className="inline-flex w-fit rounded-full bg-surface-pink px-3 py-1.5 text-xs font-medium text-primary-500">
			{children}
		</span>
	);
}

export function SectionHeading({
	id,
	first,
	second,
	intro,
}: { id: string; first: string; second: string; intro: string }) {
	return (
		<div className="max-w-2xl">
			<h2
				id={id}
				className="text-3xl font-bold leading-tight text-secondary-500 md:text-4xl lg:text-5xl"
			>
				{first}{" "}
				<em className="font-playfair font-medium text-primary-500">{second}</em>
			</h2>
			<p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg">
				{intro}
			</p>
		</div>
	);
}

export const SECTION_CLASS = "px-4 py-14 sm:px-6 md:py-20 lg:px-8";
export const CONTAINER_CLASS = "mx-auto max-w-6xl";
export const CARD_CLASS =
	"rounded-[20px] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.10)]";
export const PILL_LINK_CLASS =
	"inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary-500 px-5 text-sm font-medium text-primary-500 press hover:bg-primary-500 hover:text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";
