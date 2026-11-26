import { RollLabel } from "@/components/ui/roll-label";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function ContactHero() {
	const t = await getTranslations("contact");

	return (
		<section
			data-hero="full-bleed"
			className="relative flex min-h-150 flex-col justify-end overflow-hidden px-4 pb-12 pt-32 text-white lg:min-h-160 lg:justify-start lg:px-20 lg:pb-16 lg:pt-56"
		>
			<Image
				src="/assets/contact/hero.jpg"
				alt={t("heroImageAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover object-[center_25%]"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
				<span className="rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("heroBadge")}
				</span>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-[72px]">
					{t("heroFirst")}
					<em className="block font-playfair font-black text-primary-bright">
						{t("heroSecond")}
					</em>
				</h1>
				<p className="max-w-xl text-base leading-relaxed text-white/90 lg:text-xl">
					{t("heroDescription")}
				</p>
				<a
					href="#topics"
					className="press mt-2 inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-6 font-medium text-white outline-none transition hover:no-underline hover:brightness-90 focus-visible:ring-4 focus-visible:ring-white/60"
				>
					<RollLabel>{t("chooseTopic")}</RollLabel>
				</a>
			</div>
		</section>
	);
}
