import { FadeIn } from "@/components/motion";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { HomeTestimonial } from "../_content";
import { SectionHeading } from "./section-heading";

const MIN_TESTIMONIALS = 2;
const AVATAR_TONES = [
	"bg-surface-indigo text-secondary-500",
	"bg-surface-pink text-primary-500",
	"bg-surface-teal text-foreground",
] as const;

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
			<FadeIn className="relative mx-auto max-w-6xl">
				<SectionHeading
					first={t("titleFirst")}
					second={t("titleSecond")}
					className="text-center"
				/>
				<p className="mt-3 text-center text-lg text-muted-foreground">
					{t("description")}
				</p>
				<ul className="mt-10 grid gap-4 lg:grid-cols-3">
					{testimonials.map((item, index) => (
						<li key={item.id} className="contents">
							<Link
								href={`/careercorner/${item.mentorSlug}` as Route}
								className="group flex flex-col rounded-[28px] bg-white p-6 shadow-sm outline-none hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
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
												AVATAR_TONES[index % AVATAR_TONES.length],
											)}
										>
											{item.menteeFirstName.charAt(0).toUpperCase()}
										</span>
										<span className="text-muted-foreground">
											{t("credit", {
												mentee: item.menteeFirstName,
												mentor: item.mentorCredit,
											})}
										</span>
									</figcaption>
								</figure>
							</Link>
						</li>
					))}
				</ul>
			</FadeIn>
		</section>
	);
}
