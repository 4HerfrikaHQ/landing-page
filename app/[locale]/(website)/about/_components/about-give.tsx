import { ClipReveal } from "@/components/motion/clip-reveal";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import giveImage from "../assets/give.jpg";
import { SectionEyebrow } from "./section-eyebrow";

export async function AboutGive() {
	const t = await getTranslations("about");
	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] bg-secondary-500 lg:min-h-155 lg:flex-row lg:rounded-t-[64px]">
			<div className="flex flex-col items-start justify-center px-6 py-14 text-white lg:w-1/2 lg:px-20 lg:py-24">
				<SectionEyebrow>{t("giveEyebrow")}</SectionEyebrow>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
					{t("giveFirst")}{" "}
					<em className="font-playfair font-black text-primary-bright">
						{t("giveSecond")}
					</em>
				</h2>
				<p className="mt-4 text-[15px] leading-relaxed text-white/80 lg:text-lg">
					{t("giveDescription")}
				</p>
				<div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Button
						href="/donate"
						className="h-12 bg-primary-bright px-6 text-base font-semibold text-secondary-500 lg:py-0 lg:text-base"
					>
						{t("donateNow")}
					</Button>
					<Button
						href="/projects"
						variant="outline-white"
						className="h-12 border-2 px-6 text-base font-medium lg:py-0 lg:text-base"
					>
						{t("viewProjects")}
					</Button>
				</div>
			</div>
			<ClipReveal className="relative aspect-square w-full lg:aspect-auto lg:w-1/2">
				<Image
					src={giveImage}
					alt={t("giveImageAlt")}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					className="object-cover"
				/>
			</ClipReveal>
		</section>
	);
}
