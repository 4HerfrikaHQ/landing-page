import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import type { HomeStory } from "../_helpers";
import { FEATURED_COUNT, REGULAR_END_INDEX, StoryVariant } from "../_schema";
import { PillLink } from "./pill-link";
import { SectionHeading } from "./section-heading";

const CARD_CLASSES =
	"group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.10)] hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 lg:rounded-[20px]";

function StoryImage({
	url,
	alt,
	className,
}: { url: string | null | undefined; alt: string; className: string }) {
	if (!url) {
		return (
			<div aria-hidden="true" className={cn("bg-surface-pink", className)} />
		);
	}
	return (
		<div className={cn("relative overflow-hidden", className)}>
			<Image
				src={url}
				alt={alt}
				fill
				sizes="(max-width: 1024px) 100vw, 40vw"
				className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
			/>
		</div>
	);
}

type VariantStyle = {
	slot: string;
	card: string;
	image: string;
	body: string;
	title: string;
	excerpt: string;
};

const VARIANT_STYLES: Record<StoryVariant, VariantStyle> = {
	featured: {
		slot: "lg:col-span-2",
		card: "lg:grid lg:h-100 lg:grid-cols-[1.1fr_1fr]",
		image: "lg:aspect-auto lg:h-full",
		body: "lg:p-8",
		title: "text-2xl",
		excerpt: "line-clamp-4",
	},
	regular: {
		slot: "",
		card: "lg:h-100",
		image: "lg:aspect-auto lg:h-55",
		body: "",
		title: "text-lg",
		excerpt: "line-clamp-2",
	},
	desktopOnly: {
		slot: "max-lg:hidden",
		card: "lg:h-100",
		image: "lg:aspect-auto lg:h-55",
		body: "",
		title: "text-lg",
		excerpt: "line-clamp-2",
	},
};

async function StoryCard({
	story,
	variant,
}: { story: HomeStory; variant: StoryVariant }) {
	const [t, format] = await Promise.all([
		getTranslations("home.stories"),
		getFormatter(),
	]);
	const label = story.isProject ? t("project") : (story.category ?? t("story"));
	const date = story.date
		? format.dateTime(new Date(story.date), {
				dateStyle: "medium",
			})
		: "";
	const meta = [label, date].filter(Boolean).join(" · ");
	const style = VARIANT_STYLES[variant];

	return (
		<Link href={story.href as Route} className={cn(CARD_CLASSES, style.card)}>
			<StoryImage
				url={story.imageUrl}
				alt={story.imageAlt}
				className={cn("aspect-3/2 w-full", style.image)}
			/>
			<div className={cn("flex flex-1 flex-col p-5", style.body)}>
				<p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
					{meta}
				</p>
				<h3 className={cn("mt-2 font-semibold leading-snug", style.title)}>
					{story.title}
				</h3>
				<p
					className={cn(
						"mt-2 text-[15px] text-muted-foreground",
						style.excerpt,
					)}
				>
					{story.excerpt}
				</p>
				<span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-medium text-primary-500">
					{t("read")}
					<ArrowRight
						aria-hidden="true"
						className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
					/>
				</span>
			</div>
		</Link>
	);
}

function variantFor(index: number): StoryVariant {
	if (index < FEATURED_COUNT) return StoryVariant.enum.featured;
	if (index < REGULAR_END_INDEX) return StoryVariant.enum.regular;
	return StoryVariant.enum.desktopOnly;
}

export async function StoriesSection({ stories }: { stories: HomeStory[] }) {
	if (stories.length === 0) return null;
	const t = await getTranslations("home.stories");

	return (
		<section className="bg-muted px-4 py-16 lg:px-20 lg:pt-20 lg:pb-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<SectionHeading
						eyebrow={t("eyebrow")}
						first={t("titleFirst")}
						second={t("titleSecond")}
					/>
				</FadeIn>
				<RevealGroup className="mt-8 grid gap-5 lg:grid-cols-3">
					{stories.map((story, index) => (
						<div
							key={story.id}
							className={VARIANT_STYLES[variantFor(index)].slot}
						>
							<StoryCard story={story} variant={variantFor(index)} />
						</div>
					))}
				</RevealGroup>
				<div className="mt-10 text-center">
					<PillLink href="/blog" variant="outline-primary">
						{t("viewAll")}
					</PillLink>
				</div>
			</div>
		</section>
	);
}
