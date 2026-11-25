import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import Image from "next/image";

import type { ChipTone, ImageFit } from "../_schema";

export type CardData = {
	href: string;
	title: string;
	excerpt: string;
	imageSrc: string;
	imageAlt: string;
	imageFit: ImageFit;
	chipLabel: string;
	tone: ChipTone;
	meta: string;
	cta: string;
};

export const CHIP_CLASSES: Record<ChipTone, string> = {
	navy: "bg-secondary-500 text-white",
	pink: "bg-surface-pink text-primary-500",
	indigo: "bg-surface-indigo text-secondary-500",
	teal: "bg-surface-teal text-foreground",
};

const FIT_CLASSES: Record<ImageFit, string> = {
	cover: "object-cover",
	contain: "object-contain",
};

export function FeedImage({
	src,
	alt,
	fit,
	sizes,
	className,
}: {
	src: string;
	alt: string;
	fit: ImageFit;
	sizes: string;
	className: string;
}) {
	if (!src) {
		return (
			<div aria-hidden="true" className={`${className} bg-surface-pink`} />
		);
	}
	return (
		<div className={`relative overflow-hidden bg-surface-pink ${className}`}>
			<Image
				src={src}
				alt={alt}
				fill
				sizes={sizes}
				className={FIT_CLASSES[fit]}
			/>
		</div>
	);
}

export function FeedCard({ card }: { card: CardData }) {
	return (
		<Link
			href={card.href as Route}
			className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-white text-foreground no-underline shadow-[0_12px_24px_rgba(0,0,0,0.10)] outline-none transition-shadow hover:no-underline! hover:shadow-[0_16px_32px_rgba(0,0,0,0.14)] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:rounded-[20px]"
		>
			<FeedImage
				src={card.imageSrc}
				alt={card.imageAlt}
				fit={card.imageFit}
				sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
				className="aspect-3/2 w-full shrink-0"
			/>
			<div className="flex flex-1 flex-col gap-2 p-5 lg:p-6">
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<span
						className={`rounded-pill px-3 py-1 font-medium ${CHIP_CLASSES[card.tone]}`}
					>
						{card.chipLabel}
					</span>
					<span className="text-muted-foreground">{card.meta}</span>
				</div>
				<h3 className="line-clamp-3 text-lg font-semibold leading-snug text-balance">
					{card.title}
				</h3>
				<p className="line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
					{card.excerpt}
				</p>
				<span className="mt-auto pt-2 text-[15px] font-semibold text-primary-500 group-hover:underline">
					{card.cta} <span aria-hidden="true">→</span>
				</span>
			</div>
		</Link>
	);
}
