import { Button } from "@/components/ui/button";
import { SiteImage as Image } from "@/components/ui/site-image";
import { getTranslations } from "next-intl/server";
import { JOIN_US_URL } from "../../navigation";
import heroImage from "../assets/hero.jpg";
import { SectionEyebrow } from "./section-eyebrow";

export async function AboutHero() {
	const t = await getTranslations("about");
	return (
		<section
			data-hero="full-bleed"
			className="relative flex min-h-160 flex-col justify-end overflow-hidden px-4 pb-12 pt-32 text-white lg:min-h-190 lg:justify-start lg:px-0 lg:pb-12 lg:pt-60"
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
			<div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-5 text-center">
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
						<span className="sr-only"> {t("newTabHint")}</span>
					</Button>
					<Button
						href="/donate"
						variant="outline-white"
						className="h-12 border-2 px-6 text-base font-medium lg:text-base lg:py-0 lg:px-6"
					>
						{t("donateCta")}
					</Button>
				</div>
			</div>
		</section>
	);
}
