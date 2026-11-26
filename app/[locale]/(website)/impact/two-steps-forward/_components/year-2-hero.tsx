import { ScrollDrift } from "@/components/motion/scroll-drift";
import { Button } from "@/components/ui/button";
import { SiteImage as Image } from "@/components/ui/site-image";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
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

function riseDelay(seconds: number) {
	return { animationDelay: `${seconds}s` };
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
				<div
					className="hero-rise flex flex-wrap items-center justify-center gap-2"
					style={riseDelay(0)}
				>
					<span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
						{t("heroEyebrow")}
					</span>
				</div>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-7xl">
					<span className="hero-rise block" style={riseDelay(0.1)}>
						{t("heroFirst")}
					</span>
					<em
						className="hero-rise block font-playfair font-black text-primary-bright"
						style={riseDelay(0.22)}
					>
						{t("heroSecond")}
					</em>
				</h1>
				<div className="hero-rise" style={riseDelay(0.36)}>
					<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
						{t("heroDescription")}
					</p>
				</div>
				<div
					className="hero-rise mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
					style={riseDelay(0.48)}
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
				</div>
			</div>
		</section>
	);
}
