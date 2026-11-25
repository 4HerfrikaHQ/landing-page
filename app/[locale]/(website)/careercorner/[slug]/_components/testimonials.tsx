import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { MentorTestimonial } from "../_testimonials";

export async function Testimonials({
	testimonials,
}: { testimonials: MentorTestimonial[] }) {
	if (testimonials.length === 0) return null;
	const t = await getTranslations("mentorProfile.testimonials");

	return (
		<div>
			<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary">
				{t("tag")}
			</span>
			<h2 className="mt-4 text-[28px] font-bold leading-tight lg:text-4xl">
				{t.rich("title", {
					em: (chunks) => (
						<em className="font-playfair font-black text-primary">{chunks}</em>
					),
				})}
			</h2>
			<ul className="mt-6 space-y-3">
				{testimonials.map((testimonial) => (
					<li
						key={testimonial.bookingId}
						className="rounded-[24px] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
					>
						<p
							role="img"
							aria-label={t("rating", { rating: testimonial.rating })}
							className="flex gap-0.5 text-primary"
						>
							{Array.from({ length: testimonial.rating }).map((_, index) => (
								<Star
									// biome-ignore lint/suspicious/noArrayIndexKey: static star row
									key={index}
									className="size-4 fill-current"
									aria-hidden="true"
								/>
							))}
						</p>
						<blockquote className="mt-3 whitespace-pre-wrap text-[16px] leading-relaxed text-foreground/80">
							{testimonial.comment}
						</blockquote>
						<p className="mt-3 text-[15px] font-semibold">
							{t("from", { name: testimonial.menteeFirstName })}
						</p>
					</li>
				))}
			</ul>
		</div>
	);
}
