import { ClipReveal } from "@/components/motion/clip-reveal";
import { SiteImage as Image } from "@/components/ui/site-image";
import { getTranslations } from "next-intl/server";
import right from "../right.jpg";

export async function GoalBand() {
	const t = await getTranslations("impactIndex");
	const tImpact = await getTranslations("impact");

	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] bg-secondary-500 text-white lg:min-h-180 lg:flex-row lg:rounded-t-[64px]">
			<div className="flex flex-col justify-center px-6 py-14 lg:w-1/2 lg:px-20 lg:py-24">
				<span className="w-fit rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-bright">
					{t("goalPill")}
				</span>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
					{t("goalFirst")}{" "}
					<em className="font-playfair font-black text-primary-bright">
						{t("goalSecond")}
					</em>
				</h2>
				<p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 lg:text-lg">
					{t("goalDescription")}
				</p>
			</div>
			<ClipReveal className="relative aspect-square w-full lg:aspect-auto lg:w-1/2">
				<Image
					src={right}
					alt={tImpact("altRight")}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					className="object-cover object-[50%_30%]"
				/>
			</ClipReveal>
		</section>
	);
}
