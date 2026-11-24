import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { HeroSearch } from "./hero-search";

export async function CareersHero() {
	const t = await getTranslations("careers");

	return (
		<section
			data-hero="full-bleed"
			className="relative h-150 overflow-hidden text-white lg:h-160"
		>
			<Image
				src="/assets/academy/hero-source.jpg"
				alt={t("heroImageAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="absolute inset-x-4 bottom-10 mx-auto flex max-w-3xl flex-col items-center gap-5 text-center lg:inset-x-0 lg:bottom-auto lg:top-48">
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
