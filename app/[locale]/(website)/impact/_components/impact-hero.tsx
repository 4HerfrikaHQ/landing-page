import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import beginning from "../beginning.jpg";

export async function ImpactHero() {
	const t = await getTranslations("impactIndex");
	const tImpact = await getTranslations("impact");

	return (
		<section
			data-hero="full-bleed"
			className="relative flex min-h-160 items-center justify-center overflow-hidden px-6 pb-16 pt-32 text-white lg:min-h-180"
		>
			<Image
				src={beginning}
				alt={tImpact("altBeginning")}
				fill
				priority
				sizes="100vw"
				className="object-cover object-[50%_30%]"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
				<span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
					{t("heroEyebrow")}
				</span>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-7xl">
					<span className="block">{t("heroFirst")}</span>
					<em className="block font-playfair font-black text-primary-bright">
						{t("heroSecond")}
					</em>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
					{t("heroDescription")}
				</p>
				<div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Button
						href="#reports"
						size="lg"
						className="min-h-12 gap-2 px-6 font-medium"
					>
						{t("seeReports")} <ArrowDown className="size-5" />
					</Button>
					<Button
						href="/donate"
						variant="outline-white"
						size="lg"
						className="min-h-12 px-6 font-medium"
					>
						{t("donate")}
					</Button>
				</div>
			</div>
		</section>
	);
}
