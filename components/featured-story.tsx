import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";

import { cn } from "@/utils/cn";

type FeaturedStoryProps = {
	uid: string;
	title: string;
	description: string;
	imageUrl: string;
	className?: string;
	label?: string;
	href?: string;
	ctaLabel?: string;
};

export function FeaturedStory({
	uid,
	title,
	description,
	imageUrl,
	className,
	label = "Featured Story",
	href,
	ctaLabel = "Read Full Story",
}: FeaturedStoryProps) {
	const resolvedHref = (href ?? `/blog/${uid}`) as Route;
	return (
		<div
			className={cn(
				"group relative flex h-[400px] sm:h-[659px] w-full flex-col justify-end overflow-hidden",
				"rounded-tl-[16px] rounded-tr-[16px] rounded-br-[60px] rounded-bl-[60px] sm:rounded-br-[124px] sm:rounded-bl-[124px]",
				"pl-[6%] pb-8 sm:pb-[65px]",
				className,
			)}
		>
			<Image
				src={imageUrl}
				alt={title}
				fill
				className="object-cover transition-transform duration-700 group-hover:scale-105"
				priority
			/>
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
			<div className="relative z-10 flex max-w-[768px] flex-col gap-4 sm:gap-6">
				<span className="inline-flex w-fit items-center rounded-full bg-primary-500 px-3 py-1 sm:px-4 sm:py-[6.5px] text-xs sm:text-sm font-medium text-white">
					{label}
				</span>

				<h2 className="text-[28px] sm:text-[42px] font-bold leading-[1.2] text-white">
					{title}
				</h2>

				<p className="text-base sm:text-lg font-normal leading-relaxed text-white/90">
					{description}
				</p>

				<Link
					href={resolvedHref}
					className="flex w-fit items-center gap-2 text-white hover:!no-underline"
				>
					<span className="text-sm sm:text-base font-medium">{ctaLabel}</span>
					<ArrowRight className="size-4 sm:size-5 transition-transform duration-300 group-hover:translate-x-1" />
				</Link>
			</div>
		</div>
	);
}
