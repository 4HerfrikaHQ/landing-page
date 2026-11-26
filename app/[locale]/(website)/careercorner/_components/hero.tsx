import { SiteImage as Image } from "@/components/ui/site-image";
import heroSourceImage from "@/public/assets/academy/hero-source.jpg";
import { getTranslations } from "next-intl/server";
import { HeroSearch } from "./hero-search";

export async function CareersHero() {
	const t = await getTranslations("careers");

	return (
		<section
			data-hero="full-bleed"
			className="relative flex min-h-150 flex-col justify-end overflow-hidden px-4 pt-32 pb-10 text-white lg:min-h-160 lg:justify-start lg:px-0 lg:pt-48 lg:pb-16"
		>
			<Image
				src={heroSourceImage}
				alt={t("heroImageAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center">
				<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("title")}
				</span>
				<h1 className="text-[40px] font-medium leading-[1.08] tracking-tight lg:text-[68px]">
					<span className="block">{t("heroFirst")}</span>
					<em className="block font-playfair font-black text-primary-bright">
						{t("heroSecond")}
					</em>
				</h1>
				<p className="max-w-xl text-base text-white/85 lg:text-lg">
					{t("heroDescription")}
				</p>
				<HeroSearch
					label={t("searchLabel")}
					placeholder={t("searchPlaceholder")}
				/>
			</div>
		</section>
	);
}
