import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

type RelatedStoriesCardProps = {
	uid: string;
	category: string;
	title: string;
	date: string;
	readTime: string;
	imageUrl: string;
	imageAlt?: string;
};

export function RelatedStoriesCard({
	uid,
	category,
	title,
	date,
	readTime,
	imageUrl,
	imageAlt,
}: RelatedStoriesCardProps) {
	return (
		<Link
			href={`/blog/${uid}` as Route}
			className="flex-shrink-0 w-[267px] rounded-[14px] bg-white border border-[#E5E7EB] overflow-hidden flex flex-col no-underline hover:no-underline! hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-shadow duration-200"
		>
			<div className="relative h-[192px] w-full flex-shrink-0">
				<Image
					src={imageUrl}
					alt={imageAlt ?? title}
					fill
					className="object-cover"
					sizes="267px"
				/>
			</div>
			<div className="px-5 pt-[22px] pb-5 flex flex-col gap-3">
				<span className="inline-block self-start border border-[rgba(236,0,140,0.6)] rounded-xl px-3 py-1 text-xs font-medium leading-4 text-[#EC008C]">
					{category}
				</span>
				<h3 className="text-lg font-medium leading-[22.5px] text-black line-clamp-2">
					{title}
				</h3>
				<div className="flex items-center gap-3 text-xs text-[#6A7282]">
					<span>{date}</span>
					<span aria-hidden>•</span>
					<span>{readTime}</span>
				</div>
			</div>
		</Link>
	);
}
