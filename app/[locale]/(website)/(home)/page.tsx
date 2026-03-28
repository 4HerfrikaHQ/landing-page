import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { PrismicImage } from "@prismicio/react";
import type { Route } from "next";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Sponsors from "../_components/sponsors";
import AfricaLogo from "../_components/icons/africa-logo";
import { getHomepage } from "./_actions";
import { ExploreCommunity } from "./_components/explore-community";
import { Hero } from "./_components/hero";
import { TestimonialCarousel } from "./_components/testimonial-carousel";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("home");
	const page = await getHomepage();

	const {
		testimonials,
		ambassador_description,
		ambassador_image,
		ambassador_link,
		hero_image: heroImage,
		members,
		campuses,
		countries,
	} = page.data;

	return (
		<section className="bg-background">
			<Hero
				heroImage={heroImage}
				members={members}
				campuses={campuses}
				countries={countries}
			/>
			<Sponsors />
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
							href={"/" as Route}
							variant="outline"
							className="px-8 py-3 md:py-4 text-base md:text-xl"
						>
							View Projects
						</Button>

						<Button
							className="px-8 py-3 md:py-4 text-base md:text-xl"
							href={(ambassador_link.text || "/") as Route}
							isExternal
						>
							Join Us
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
			{testimonials.length > 0 && (
				<section className="relative bg-muted px-4 py-12 lg:px-7 lg:pt-20 lg:pb-24 overflow-x-hidden">
					<AfricaLogo className="w-24 absolute -right-12 top-24 lg:w-67.5 lg:-right-8 lg:top-8" />
					<AfricaLogo className="hidden lg:block w-67.5 absolute left-4 bottom-0" />

					<FadeIn>
					<h1 className="text-center text-foreground text-3xl lg:text-4xl font-semibold mb-4 lg:mb-8">
						{t.rich("wordsOnStreet", {
							pink: (chunks) => <span className="text-primary-500">{chunks}</span>,
						})}
					</h1>

					<p className="text-center text-foreground text-lg mb-8 lg:text-xl">
						{t("wordsOnStreetSub")}
					</p>
					</FadeIn>

					<div className="container mx-auto px-2">
						<TestimonialCarousel testimonials={testimonials} />
					</div>
				</section>
			)}
		</section>
	);
}
