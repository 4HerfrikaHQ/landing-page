import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { Route } from "next";

import { cn } from "@/utils/cn";

type BlogCardProps = {
	uid: string;
	category: string;
	title: string;
	description: string;
	date: string;
	readTime: string;
	imageUrl: string;
	className?: string;
};

export function BlogCard({
	uid,
	category,
	title,
	description,
	date,
	readTime,
	imageUrl,
	className,
}: BlogCardProps) {
	return (
		<Link
			href={`/blog/${uid}` as Route}
			className={cn("group flex flex-col w-full no-underline hover:no-underline!", className)}
		>
			<div className="relative h-60 w-full overflow-hidden rounded-[14px]">
				<Image
					src={imageUrl}
					alt={title}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>
			</div>

			<div className="mt-4 flex flex-col grow">
				<span className="text-xs font-medium uppercase tracking-wide text-primary-500">
					{category}
				</span>

				<h3 className="mt-3 pb-2 mb-auto text-[22px] font-semibold leading-[1.3] text-foreground">
					{title}
				</h3>
				<p className="text-base font-normal leading-relaxed text-[#636363]">
					{description}
        </p>

				<div className="mt-6 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<span className="text-sm text-[#999999]">{date}</span>
						<div className="flex items-center gap-1">
							<Clock className="size-4 text-[#999999]" />
							<span className="text-sm text-[#999999]">{readTime}</span>
						</div>
					</div>

					<div className="flex items-center gap-1">
						<span className="text-sm font-medium text-primary-500">Read More</span>
						<ArrowRight className="size-4 text-primary-500 transition-transform duration-200 group-hover:translate-x-1" />
					</div>
				</div>
			</div>
		</Link>
	);
}
