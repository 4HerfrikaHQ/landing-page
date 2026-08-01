import { FadeIn } from "@/components/motion";
import {
	type Review,
	ReviewsSection,
} from "@/components/reviews/reviews-section";
import { Button } from "@/components/ui/button";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { asImageSrc } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import type { Metadata } from "next";
import type { Route } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import AfricaLogo from "../africa-logo";
import { JOIN_US_URL } from "../navigation";
import { getHomepage } from "./_actions";
import { ExploreCommunity } from "./_components/explore-community";
import { Hero } from "./_components/hero";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.home" });
	return { title: t("title"), description: t("description") };
}

export default async function HomePage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const t = await getTranslations("home");
	const tc = await getTranslations("common");
	const page = await getHomepage();

	const {
		testimonials,
		ambassador_description,
		ambassador_image,
		hero_image: heroImage,
		members,
		campuses,
		countries,
	} = page.data;
	const reviews: Review[] = testimonials.map((testimonial, index) => {
		const imageSrc = asImageSrc(testimonial.profile_picture);
		const name = testimonial.name || `Community member ${index + 1}`;

		return {
			id: `${name}-${index}`,
			quote: testimonial.testimonial || "",
			name,
			title: testimonial.role_and_location,
			rating: Number(testimonial.rating) || 5,
			image: imageSrc
				? {
						src: imageSrc,
						alt: testimonial.profile_picture.alt || name,
					}
				: null,
		};
	});

	return (
		<section className="bg-background">
			<Hero
				heroImage={heroImage}
				members={members}
				campuses={campuses}
				countries={countries}
			/>
			<ExploreCommunity />

			<section className="px-4 sm:px-6 md:px-7 container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 w-full lg:pt-20 py-12 lg:pb-28">
				<FadeIn direction="right">
					<div>
						<h3 className="text-foreground text-center lg:text-left text-3xl lg:text-4xl font-bold capitalize tracking-wide mb-3 sm:mb-4 lg:mb-6">
							{t("becomeAmbassador")}{" "}
						</h3>
						<p className=" text-center lg:text-left text-lg lg:text-xl text-muted-foreground mb-4 sm:mb-6 lg:mb-9">
							{ambassador_description}
						</p>
						<div className="lg:hidden relative w-full aspect-[1.16]">
							<PrismicImage
								field={ambassador_image}
								className="object-cover rounded-xl w-full h-full"
							/>
						</div>
						<div className="flex items-center gap-3 sm:gap-4 mt-8 lg:mt-0 lg:gap-6 flex-wrap justify-center lg:justify-start">
							<Button
								href={"/projects" as Route}
								variant="outline"
								className="px-8 py-3 md:py-4 text-base md:text-xl"
							>
								{tc("viewProjects")}
							</Button>

							<Button
								className="px-8 py-3 md:py-4 text-base md:text-xl"
								href={JOIN_US_URL}
								isExternal
							>
								{tc("joinUs")}
							</Button>
						</div>
					</div>
				</FadeIn>
				<FadeIn direction="left">
					<div className="hidden lg:block relative w-full aspect-[1.16]">
						<PrismicImage
							field={ambassador_image}
							className="object-cover rounded-xl w-full h-full"
						/>
					</div>
				</FadeIn>
			</section>
			{/* Words of the street */}
			{reviews.length > 0 && (
				<ReviewsSection
					heading={t.rich("wordsOnStreet", {
						pink: (chunks) => (
							<span className="text-primary-500">{chunks}</span>
						),
					})}
					subheading={t("wordsOnStreetSub")}
					reviews={reviews}
					layout="carousel"
					decorations={
						<>
							<AfricaLogo className="pointer-events-none absolute -right-12 top-24 w-24 lg:-right-8 lg:top-8 lg:w-67.5" />
							<AfricaLogo className="pointer-events-none absolute bottom-0 left-4 hidden w-67.5 lg:block" />
						</>
					}
				/>
			)}
		</section>
	);
}
