import { HoverCard } from "@/components/motion";
import type { Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import type { Route } from "next";
import Link from "next/link";

export function CampusCard({
	campus,
	readMoreLabel,
}: {
	campus: Content.CampusDocument;
	readMoreLabel: string;
}) {
	const { name, university, country, summary, cover_image } = campus.data;
	const category = country ?? university ?? "";

	return (
		<HoverCard className="h-full rounded-md">
			<Link
				href={`/campuses/${campus.uid}` as Route}
				className="flex flex-col bg-muted rounded-md hover:shadow-lg transition-shadow duration-200 hover:no-underline group h-full"
			>
				<div className="relative w-full h-55">
					<PrismicNextImage
						field={cover_image}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
						className="rounded-t-md object-cover"
					/>
				</div>
				<div className="px-3 py-4 flex flex-col gap-3 flex-1">
					{category && (
						<span className="text-xs font-semibold tracking-wider text-primary-500 uppercase">
							{category}
						</span>
					)}
					<h2 className="text-base font-semibold text-foreground group-hover:text-primary-500 transition-colors">
						{name}
					</h2>
					<p className="text-sm text-muted-foreground line-clamp-3">{summary}</p>
					<div className="flex justify-between items-center text-sm text-foreground mt-auto pt-2">
						<span>
							{new Date(campus.last_publication_date).toLocaleDateString(undefined, {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</span>
						<span className="text-primary-500 font-medium">{readMoreLabel}</span>
					</div>
				</div>
			</Link>
		</HoverCard>
	);
}
