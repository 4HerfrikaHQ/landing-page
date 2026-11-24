import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { JOIN_US_URL } from "../../navigation";
import heroImage from "../assets/hero.jpg";
import { SectionEyebrow } from "./section-eyebrow";

export async function AboutHero() {
	const t = await getTranslations("about");
	return (
		<section
			data-hero="full-bleed"
			className="relative h-160 overflow-hidden text-white lg:h-190"
		>
			<Image
				src={heroImage}
				alt={t("heroImageAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<FadeIn
				delay={0.1}
				className="absolute inset-x-4 bottom-12 mx-auto flex max-w-4xl flex-col items-center gap-5 text-center lg:inset-x-0 lg:bottom-auto lg:top-60"
			>
				<SectionEyebrow>{t("whoWeAre")}</SectionEyebrow>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-7xl">
					{t("heroFirst")}
					<em className="block font-playfair font-black text-primary-bright">
						{t("heroSecond")}
					</em>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-white/90 lg:text-xl">
					{t("heroDescription")}
				</p>
				<div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Button
						href={JOIN_US_URL}
						isExternal
						className="h-12 px-6 text-base font-medium lg:text-base lg:py-0 lg:px-6"
					>
						{t("joinCta")}
					</Button>
					<Button
						href="/donate"
						variant="outline-white"
						className="h-12 border-2 px-6 text-base font-medium lg:text-base lg:py-0 lg:px-6"
					>
						{t("donateCta")}
					</Button>
				</div>
			</FadeIn>
		</section>
	);
}
