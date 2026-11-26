import { FadeIn, TextReveal } from "@/components/motion";
import { ScrollDrift } from "@/components/motion/scroll-drift";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ImpactYear2Report } from "../_report";
import hero from "../hero.jpg";

async function ReportAction({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	if (report.pdf) {
		return (
			<Button
				href={report.pdf.url}
				isExternal
				variant="outline-white"
				size="lg"
				className="min-h-12 px-6 font-medium"
			>
				{t("downloadPdf", { size: report.pdf.sizeMb })}
			</Button>
		);
	}

	return (
		<Button
			href="/donate"
			variant="outline-white"
			size="lg"
			className="min-h-12 px-6 font-medium"
		>
			{t("donate")}
		</Button>
	);
}

export async function Year2Hero({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<section
			data-hero="full-bleed"
			className="relative flex min-h-160 items-center justify-center overflow-hidden px-6 pb-16 pt-32 text-white lg:min-h-190"
		>
			<ScrollDrift className="absolute -inset-y-32 inset-x-0">
				<div className="animate-hero-settle absolute inset-0">
					<Image
						src={hero}
						alt={t("heroAlt")}
						fill
						priority
						sizes="100vw"
						className="object-cover object-[50%_80%]"
					/>
				</div>
			</ScrollDrift>
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
				<FadeIn className="flex flex-wrap items-center justify-center gap-2">
					<span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
						{t("heroEyebrow")}
					</span>
				</FadeIn>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-7xl">
					<TextReveal className="block" delay={0.1}>
						{t("heroFirst")}
					</TextReveal>
					<em className="block font-playfair font-black text-primary-bright">
						<TextReveal delay={0.25}>{t("heroSecond")}</TextReveal>
					</em>
				</h1>
				<FadeIn delay={0.4}>
					<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
						{t("heroDescription")}
					</p>
				</FadeIn>
				<FadeIn
					delay={0.5}
					className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
				>
					<Button
						href="#numbers"
						size="lg"
						className="min-h-12 gap-2 px-6 font-medium"
					>
						{t("readReport")}{" "}
						<ArrowDown aria-hidden="true" className="size-5" />
					</Button>
					<ReportAction report={report} />
				</FadeIn>
			</div>
		</section>
	);
}
