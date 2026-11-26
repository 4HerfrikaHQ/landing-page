import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { HomeTestimonial } from "../_content";
import { AVATAR_TONES, MIN_TESTIMONIALS } from "../_schema";
import { SectionHeading } from "./section-heading";

async function TestimonialCard({
	item,
	index,
}: { item: HomeTestimonial; index: number }) {
	const t = await getTranslations("home.testimonials");
	const tone = AVATAR_TONES[index % AVATAR_TONES.length];
	const initial = item.menteeFirstName.charAt(0).toUpperCase();
	const credit = t("credit", {
		mentee: item.menteeFirstName,
		mentor: item.mentorCredit,
	});

	return (
		<Link
			href={`/careercorner/${item.mentorSlug}` as Route}
			className="group flex w-full flex-col rounded-[20px] bg-white p-6 shadow-sm hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
		>
			<figure className="flex h-full flex-col">
				<blockquote className="line-clamp-6 text-lg leading-relaxed">
					“{item.comment}”
				</blockquote>
				<figcaption className="mt-auto flex items-center gap-3 pt-5 text-sm">
					<span
						aria-hidden="true"
						className={cn(
							"flex size-11 shrink-0 items-center justify-center rounded-full font-semibold",
							tone,
						)}
					>
						{initial}
					</span>
					<span className="text-muted-foreground">{credit}</span>
				</figcaption>
			</figure>
		</Link>
	);
}

export async function TestimonialsSection({
	testimonials,
}: { testimonials: HomeTestimonial[] }) {
	if (testimonials.length < MIN_TESTIMONIALS) return null;
	const t = await getTranslations("home.testimonials");

	return (
		<section className="relative overflow-hidden bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24">
			<Image
				src="/assets/academy/decorative-logo.png"
				alt=""
				width={173}
				height={251}
				className="pointer-events-none absolute -right-8 bottom-6 w-40 -rotate-12 opacity-15 lg:top-10 lg:bottom-auto lg:w-56"
			/>
			<div className="relative mx-auto max-w-6xl">
				<FadeIn>
					<SectionHeading
						first={t("titleFirst")}
						second={t("titleSecond")}
						className="text-center"
					/>
					<p className="mt-3 text-center text-lg text-muted-foreground">
						{t("description")}
					</p>
				</FadeIn>
				<RevealGroup as="ul" className="mt-10 grid gap-4 lg:grid-cols-3">
					{testimonials.map((item, index) => (
						<li key={item.id} className="flex">
							<TestimonialCard item={item} index={index} />
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
