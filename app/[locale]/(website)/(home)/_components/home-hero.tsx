import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { HeroMorphWord } from "./hero-morph-word";
import { PillLink } from "./pill-link";

export async function HomeHero() {
	const t = await getTranslations("home.hero");
	const morphWords = t.raw("morphWords") as string[];

	return (
		<section
			data-hero="full-bleed"
			className="relative h-170 overflow-hidden text-white lg:h-180"
		>
			<Image
				src="/assets/home/hero.jpg"
				alt={t("imageAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover object-top"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="absolute inset-x-4 bottom-10 mx-auto flex max-w-4xl flex-col items-center gap-4 text-center lg:inset-x-0 lg:top-56 lg:bottom-auto">
				<span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
					{t("badge")}
				</span>
				<h1 className="text-[44px] font-medium leading-[1.05] tracking-tight lg:text-[76px]">
					<span className="sr-only">
						{t("titleFirst")}{" "}
						{t.rich("titleSecond", { word: (chunks) => chunks })}
					</span>
					<span aria-hidden="true">
						{t("titleFirst")}
						<br />
						<em className="font-playfair font-black text-primary-bright">
							{t.rich("titleSecond", {
								word: () => <HeroMorphWord words={morphWords} />,
							})}
						</em>
					</span>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
					{t("description")}
				</p>
				<div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<PillLink href="/academy" variant="solid">
						{t("startCourse")}
					</PillLink>
					<PillLink href="/careercorner" variant="outline-light">
						{t("bookMentor")}
					</PillLink>
				</div>
			</div>
		</section>
	);
}
