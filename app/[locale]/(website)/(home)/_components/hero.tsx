import { Button } from "@/components/ui/button";
import { FadeIn, ParallaxImage } from "@/components/motion";
import type { Content } from "@prismicio/client";
import { PrismicImage } from "@prismicio/react";
import { getTranslations } from "next-intl/server";
import { Statistic } from "../../_components/statistic";
import CurvedArrowIcon from "../../_components/icons/curved-arrow";
import HeroCurveIcon from "../../_components/icons/hero-curve";
import { JOIN_FORM_LINK } from "../_schema";

interface HeroProps {
	heroImage: Content.HomepageDocumentData["hero_image"];
	members: Content.HomepageDocumentData["members"];
	countries: Content.HomepageDocumentData["countries"];
	campuses: Content.HomepageDocumentData["campuses"];
}

export const Hero = async ({
	heroImage,
	campuses,
	countries,
	members,
}: HeroProps) => {
	const t = await getTranslations("home");
	const tc = await getTranslations("common");

	return (
		<section className="px-4 sm:px-6 md:px-7 relative overflow-x-hidden">
			<div className="w-80 h-60 sm:h-72 md:h-80 rounded-full top-0 left-0 bg-primary-500/20 absolute blur-[374px]" />
			<div className="w-80 h-60 sm:h-72 md:h-80 rounded-full top-0 right-0 bg-primary-500/20 absolute blur-[374px]" />
			<HeroCurveIcon
				width="100%"
				className="w-full h-full left-0 -bottom-4 sm:-bottom-6 md:-bottom-8 lg:bottom-20 absolute -z-1"
			/>

			<section className="grid lg:grid-cols-[1fr_1.2fr] gap-6 sm:gap-8 pt-6 sm:pt-8 md:pt-16 xl:pt-32 relative z-1 mx-auto container">
				<div className="w-full">
					<FadeIn>
						<p className="text-foreground text-center lg:text-left text-5xl xl:text-6xl leading-tight mb-3 lg:mb-8 lg:tracking-widest font-bold capitalize">
							{t.rich("heroTitle", {
								highlight: (chunks) => (
									<span className="text-primary-500">
										{chunks}
									</span>
								),
							})}
						</p>
					</FadeIn>
					<PrismicImage
						field={heroImage}
						className="aspect-[1.16] mx-auto object-cover lg:hidden mb-4 w-full max-w-md"
						width={278}
					/>
					<FadeIn delay={0.3}>
						<p className="text-lg lg:text-2xl mx-auto max-w-2xl py-4 lg:py-0 text-muted-foreground mb-6 lg:mb-14 tracking-wider xl:max-w-182.5 text-center lg:text-left">
							{t("heroDescription")}
						</p>
					</FadeIn>
					<FadeIn delay={0.6}>
						<div className="flex items-center gap-3 sm:gap-4 lg:gap-5 justify-center lg:justify-start flex-wrap">
							<Button
								href="/about"
								variant="outline"
								className="w-40 md:w-auto px-8 py-3 md:py-4 text-base md:text-xl"
							>
								{tc("learnMore")}
							</Button>
							<Button
								href={JOIN_FORM_LINK}
								isExternal
								variant="solid"
								className="w-40 md:w-auto px-8 py-3 md:py-4 text-base md:text-xl"
							>
								{tc("getStarted")}
							</Button>
						</div>
					</FadeIn>
				</div>
				<ParallaxImage speed={0.3} className="hidden lg:block shrink-0 relative aspect-square self-end w-full">
					<PrismicImage
						field={heroImage}
						className="aspect-[1.16] object-cover w-full"
						width={723}
					/>
				</ParallaxImage>
			</section>
			<section className="py-12 md:py-16 mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 z-10 relative">
				<Statistic value={members} label={t("members")} />
				<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
				<Statistic value={campuses} label={t("campuses")} />
				<hr className="hidden sm:block border h-16 md:h-20 lg:h-24 w-0 border-primary-500 mx-4 md:mx-8 lg:mx-24" />
				<Statistic value={countries} label={t("africanCountries")} />
			</section>
			<CurvedArrowIcon className="text-center mt-4 mx-auto mb-7 w-24 lg:w-32" />
		</section>
	);
};
