import { FadeIn } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import type { HomeStory } from "../_helpers";
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

async function StoryCard({
	story,
	variant,
}: { story: HomeStory; variant: "featured" | "regular" | "desktopOnly" }) {
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
	const isFeatured = variant === "featured";

	return (
		<Link
			href={story.href as Route}
			className={cn(
				CARD_CLASSES,
				isFeatured && "lg:col-span-2 lg:grid lg:h-100 lg:grid-cols-[1.1fr_1fr]",
				variant === "regular" && "lg:h-100",
				variant === "desktopOnly" && "max-lg:hidden lg:h-100",
			)}
		>
			<StoryImage
				url={story.imageUrl}
				alt={story.imageAlt}
				className={cn(
					"aspect-3/2 w-full",
					isFeatured ? "lg:aspect-auto lg:h-full" : "lg:aspect-auto lg:h-55",
				)}
			/>
			<div className={cn("flex flex-1 flex-col p-5", isFeatured && "lg:p-8")}>
				<p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
					{meta}
				</p>
				<h3
					className={cn(
						"mt-2 font-semibold leading-snug",
						isFeatured ? "text-2xl" : "text-lg",
					)}
				>
					{story.title}
				</h3>
				<p
					className={cn(
						"mt-2 text-[15px] text-muted-foreground",
						isFeatured ? "line-clamp-4" : "line-clamp-2",
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

function variantFor(index: number) {
	if (index === 0) return "featured";
	if (index < 3) return "regular";
	return "desktopOnly";
}

export async function StoriesSection({ stories }: { stories: HomeStory[] }) {
	if (stories.length === 0) return null;
	const t = await getTranslations("home.stories");

	return (
		<section className="bg-muted px-4 py-16 lg:px-20 lg:pt-20 lg:pb-24">
			<FadeIn className="mx-auto max-w-6xl">
				<SectionHeading
					eyebrow={t("eyebrow")}
					first={t("titleFirst")}
					second={t("titleSecond")}
				/>
				<div className="mt-8 grid gap-5 lg:grid-cols-3">
					{stories.map((story, index) => (
						<StoryCard
							key={story.id}
							story={story}
							variant={variantFor(index)}
						/>
					))}
				</div>
				<div className="mt-10 text-center">
					<PillLink href="/blog" variant="outline-primary">
						{t("viewAll")}
					</PillLink>
				</div>
			</FadeIn>
		</section>
	);
}
