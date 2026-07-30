"use client";

import { FadeIn } from "@/components/motion";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/utils/cn";
import { Star } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

export type Review = {
	id: string;
	quote: string;
	name: string;
	title?: string | null;
	rating?: number | null;
	image?: {
		src: string;
		alt: string;
	} | null;
};

type ReviewsSectionProps = {
	heading: ReactNode;
	subheading?: ReactNode;
	reviews: readonly Review[];
	layout?: "grid" | "carousel";
	className?: string;
	decorations?: ReactNode;
};

function ReviewCard({ review }: { review: Review }) {
	const rating = Math.max(0, Math.min(5, Math.round(review.rating ?? 5)));

	return (
		<article className="relative min-w-0 pl-10 sm:pl-[41px]">
			<div className="flex min-h-[209px] min-w-0 flex-col rounded-2xl bg-[#c62979] py-8 pl-16 pr-8 text-white shadow-[2px_10px_25px_rgba(0,0,0,0.18)] sm:pl-[57px] sm:pr-[41px]">
				<p className="text-base font-medium leading-6 sm:text-lg sm:leading-[23px]">
					{review.quote}
				</p>
				<div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
					<div className="min-w-0">
						<h3 className="text-xl font-semibold leading-[25px]">
							{review.name}
						</h3>
						{review.title && (
							<p className="mt-2 text-sm leading-[18px]">{review.title}</p>
						)}
					</div>
					{rating > 0 && (
						<div
							aria-label={`${rating} out of 5 stars`}
							className="flex shrink-0 gap-1"
						>
							{Array.from({ length: rating }, (_, index) => (
								<Star
									key={`${review.id}-${index}`}
									aria-hidden="true"
									className="size-5 fill-current"
								/>
							))}
						</div>
					)}
				</div>
			</div>
			{review.image && (
				<Image
					src={review.image.src}
					alt={review.image.alt}
					width={82}
					height={82}
					className="absolute left-0 top-1/2 size-[82px] -translate-y-1/2 rounded-full object-cover"
				/>
			)}
		</article>
	);
}

/**
 * A presentation-only reviews section. Callers normalize their source data at
 * the boundary, so this component remains independent of Prismic or any other
 * CMS while retaining the Academy card treatment.
 */
export function ReviewsSection({
	heading,
	subheading,
	reviews,
	layout = "grid",
	className,
	decorations,
}: ReviewsSectionProps) {
	if (reviews.length === 0) return null;

	return (
		<section
			aria-label="Reviews"
			className={cn(
				"relative overflow-x-clip bg-[#f5f5f5] px-6 py-20 xl:px-12 xl:py-[75px] 2xl:px-20",
				className,
			)}
		>
			{decorations}
			<div className="relative z-10 mx-auto max-w-[1280px]">
				<FadeIn>
					<div className="mx-auto max-w-[880px] text-center">
						<h2 className="text-[63px] font-semibold leading-[66px] max-sm:text-4xl max-sm:leading-tight">
							{heading}
						</h2>
						{subheading && (
							<p className="mt-6 text-xl font-medium leading-[27px]">
								{subheading}
							</p>
						)}
					</div>
				</FadeIn>

				{layout === "carousel" ? (
					<FadeIn>
						<Carousel opts={{ align: "start" }} className="mt-14 w-full">
							<CarouselContent className="-ml-10">
								{reviews.map((review) => (
									<CarouselItem
										key={review.id}
										className="basis-[calc(100%-1rem)] pl-10 md:basis-1/2"
									>
										<ReviewCard review={review} />
									</CarouselItem>
								))}
							</CarouselContent>
							<div className="mt-10 flex justify-center gap-4">
								<CarouselPrevious className="static translate-y-0 border-[#ec008c] text-[#ec008c] hover:bg-[#ec008c] hover:text-white" />
								<CarouselNext className="static translate-y-0 border-[#ec008c] text-[#ec008c] hover:bg-[#ec008c] hover:text-white" />
							</div>
						</Carousel>
					</FadeIn>
				) : (
					<div className="mt-14 grid grid-cols-1 gap-x-[52px] gap-y-14 md:grid-cols-2">
						{reviews.map((review) => (
							<ReviewCard key={review.id} review={review} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}
