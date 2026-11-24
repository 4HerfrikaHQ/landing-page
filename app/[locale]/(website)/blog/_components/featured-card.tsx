import { Link } from "@/i18n/navigation";
import type { Route } from "next";
import { CHIP_CLASSES, type CardData, FeedImage } from "./feed-card";

export function FeaturedCard({ card }: { card: CardData }) {
	return (
		<section className="relative z-10 -mt-28 px-4 lg:-mt-32 lg:px-20">
			<div className="mx-auto max-w-6xl">
				<Link
					href={card.href as Route}
					className="group grid overflow-hidden rounded-[32px] bg-white text-foreground no-underline shadow-[0_12px_24px_rgba(0,0,0,0.10)] outline-none hover:no-underline! focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:grid-cols-2 lg:rounded-[40px]"
				>
					<FeedImage
						src={card.imageSrc}
						alt={card.imageAlt}
						sizes="(min-width: 1152px) 576px, 100vw"
						className="aspect-3/2 w-full lg:aspect-auto lg:min-h-[360px]"
					/>
					<div className="flex flex-col gap-3 p-6 lg:justify-center lg:p-12">
						<div className="flex flex-wrap items-center gap-2 text-sm">
							<span
								className={`rounded-pill px-3 py-1 font-medium ${CHIP_CLASSES[card.tone]}`}
							>
								{card.chipLabel}
							</span>
							<span className="text-muted-foreground">{card.meta}</span>
						</div>
						<h2 className="line-clamp-4 text-2xl font-bold leading-tight text-balance lg:text-[40px]">
							{card.title}
						</h2>
						<p className="line-clamp-4 text-[15px] leading-relaxed text-muted-foreground lg:text-lg">
							{card.excerpt}
						</p>
						<span className="mt-2 inline-flex h-12 w-fit items-center rounded-pill bg-primary-500 px-6 font-medium text-white group-hover:brightness-90">
							{card.cta} <span aria-hidden="true">&nbsp;→</span>
						</span>
					</div>
				</Link>
			</div>
		</section>
	);
}
