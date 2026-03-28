import type { Metadata } from "next";
import { FadeIn, StaggerContainer, StaggerItem, TextReveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import F4herfrikaLogo from "./4herfrika";
import beginning from "./beginning.jpg";
import earth from "./earth.png";
import left from "./left.jpg";
import middle from "./middle.jpg";
import milestone1 from "./milestone-1.jpg";
import milestone2 from "./milestone-2.jpg";
import milestone3 from "./milestone-3.jpg";
import right from "./right.jpg";
import Squiggle from "./squiggle";
import yearReport from "./year-report.jpg";

export const metadata: Metadata = {
	title: "Our Impact — 3,000+ Girls Mentored Across 25+ Campuses",
	description:
		"In year one, 4Herfrika mentored 3,000+ girls, reached 25+ campuses across 5 African countries, and graduated 1,000+ women from our Tech Academy. See our story in motion.",
};

export default async function ReportPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("impact");
	const tc = await getTranslations("common");

	return (
		<div className="w-screen overflow-hidden">
			<Image
				src={yearReport}
				alt="Yearly report"
				className="mx-auto max-w-full"
			/>
			<h1 className="text-3xl md:text-5xl font-bold text-foreground mx-auto my-16 md:my-28 text-center">
				<TextReveal>{t("storyInMotion")}</TextReveal>
			</h1>
			<div className="relative flex flex-col items-center mb-20 md:mb-32">
				<div className="absolute overflow-x-hidden left-[2vw] top-1/2 -translate-y-1/2 w-[96vw]">
					<F4herfrikaLogo className="w-[96vw]" />
				</div>
				<Squiggle className="absolute left-0 top-1/2 -translate-y-1/2 w-screen" />
				<FadeIn initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}>
				<Image
					src={earth}
					alt="Earth Icon"
					className="mx-auto max-w-xl relative w-[43vw]"
				/>
				</FadeIn>
				<div className="w-40 md:w-56 h-6 rounded-[50%] bg-black/55 blur-[20px]" />
			</div>
			<p className="max-w-6xl text-center text-foreground text-lg md:text-[32px] font-light mx-auto mb-20 md:mb-52 px-6">
				{t("whatStarted")}
			</p>
			<div className="bg-surface-pink pt-16 md:pt-30 pb-44 md:pb-105 flex flex-col text-center relative">
				<h2 className="text-3xl md:text-5xl text-foreground font-semibold mb-12">
					{t("milestones")}
				</h2>
				<StaggerContainer className="list-disc text-center space-y-4 md:space-y-6 text-lg md:text-2xl" style={{ listStyleType: "disc" }}>
					<StaggerItem><li className="w-fit mx-auto">{t("girlsMentored")}</li></StaggerItem>
					<StaggerItem><li className="w-fit mx-auto">{t("campusesReached")}</li></StaggerItem>
					<StaggerItem><li className="w-fit mx-auto">{t("graduates")}</li></StaggerItem>
					<StaggerItem><li className="w-fit mx-auto">
						{t("academies")}
					</li></StaggerItem>
				</StaggerContainer>
				<div className="grid grid-cols-2 gap-4 px-6 mt-12 md:mt-0">
					<Image
						src={milestone1}
						alt="milestone"
						className="relative md:absolute h-40 left-0 md:top-1/2 md:-translate-y-1/2 md:size-[16vw] object-cover md:rounded-full"
					/>
					<Image
						src={milestone2}
						alt="milestone"
						className="relative md:absolute h-40 md:right-60 md:bottom-48 md:size-[14vw] object-cover md:rounded-full"
					/>
					<Image
						src={milestone3}
						alt="milestone"
						className="relative col-span-2 h-80 md:absolute md:right-20 md:top-20 md:size-[10vw] object-cover md:rounded-full"
					/>
				</div>
			</div>
			<div className="bg-surface-indigo -mt-24 md:-mt-36 relative z-10 rounded-t-[100px] md:rounded-t-[248px]">
				<span className="h-12 md:h-32 block" />
				<p className="px-8 md:px-20 text-foreground text-lg md:text-[32px] text-center mb-12 md:mb-32">
					{t("neverTouched")}
				</p>
				<div className="relative mb-8 md:mb-40 grid grid-cols-2 md:flex gap-4 px-6">
					<Image
						src={middle}
						alt="Girls"
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover mx-auto relative"
					/>
					<Image
						src={right}
						alt="Girls"
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-25 right-0 md:top-32"
					/>
					<Image
						src={left}
						alt="Girls"
						className="col-span-2 w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-[-25deg] left-0 md:top-32"
					/>
				</div>
				<Button
					href="/reports/4herfrika-Annual-report.pdf"
					isExternal
					className="mx-auto w-fit"
				>
					{tc("downloadReport")}
				</Button>
				<span className="h-12 md:h-36 block" />
			</div>
			<FadeIn>
			<div className="px-6 pt-12 pb-8 md:p-20 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-y-8 gap-x-24 items-center">
				<div>
					<h4 className="text-lg md:text-[32px] leading-normal mb-12">
						{t("justTheBeginning")}
					</h4>
					<Button href="/" className="w-fit gap-x-1">
						{tc("goToHomepage")}
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
				<Image
					src={beginning}
					alt="Just the beginning"
					className="w-full h-135 object-cover"
				/>
			</div>
			</FadeIn>
		</div>
	);
}
