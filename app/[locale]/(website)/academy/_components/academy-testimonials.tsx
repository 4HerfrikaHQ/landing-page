import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { SiteImage as Image } from "@/components/ui/site-image";
import { createClient } from "@/prismicio";
import decorativeLogoImage from "@/public/assets/academy/decorative-logo.png";
import { getTranslations } from "next-intl/server";
import { CommunityTestimonial } from "../_schema";

const MIN_TESTIMONIALS = 2;

async function getCommunityTestimonials() {
	try {
		const homepage = await createClient().getSingle("homepage");
		return homepage.data.testimonials.flatMap((entry) => {
			const parsed = CommunityTestimonial.safeParse(entry);
			return parsed.success ? [parsed.data] : [];
		});
	} catch (error) {
		console.error("[academy] testimonials failed", error);
		return [];
	}
}

export async function AcademyTestimonials() {
	const testimonials = await getCommunityTestimonials();
	if (testimonials.length < MIN_TESTIMONIALS) return null;
	const t = await getTranslations("academy.testimonials");

	return (
		<section className="relative overflow-hidden bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24">
			<Image
				src={decorativeLogoImage}
				alt=""
				width={173}
				height={251}
				className="pointer-events-none absolute -right-8 bottom-6 w-40 -rotate-12 opacity-15 lg:top-10 lg:bottom-auto lg:w-56"
			/>
			<div className="relative mx-auto max-w-6xl">
				<FadeIn>
					<h2 className="text-center font-heading text-[32px] leading-[1.1] font-medium tracking-tight text-secondary-500 lg:text-5xl">
						{t("titleFirst")}{" "}
						<span className="font-playfair text-primary-500 italic">
							{t("titleSecond")}
						</span>
					</h2>
					<p className="mt-3 text-center text-lg text-muted-foreground">
						{t("description")}
					</p>
				</FadeIn>
				<RevealGroup
					as="ul"
					className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
				>
					{testimonials.map((item) => (
						<li
							key={item.name}
							className="flex flex-col rounded-[20px] bg-white p-6 shadow-sm"
						>
							<figure className="flex h-full flex-col">
								<blockquote className="text-lg leading-relaxed">
									“{item.testimonial}”
								</blockquote>
								<figcaption className="mt-auto flex items-center gap-3 pt-5 text-sm">
									<Image
										src={item.profile_picture.url}
										alt=""
										width={48}
										height={48}
										className="size-12 shrink-0 rounded-full object-cover"
									/>
									<span>
										<span className="block font-semibold text-foreground">
											{item.name}
										</span>
										<span className="text-muted-foreground">
											{item.role_and_location}
										</span>
									</span>
								</figcaption>
							</figure>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
