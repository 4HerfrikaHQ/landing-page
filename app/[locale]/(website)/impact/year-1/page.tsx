import {
	FadeIn,
	StaggerContainer,
	StaggerItem,
	TextReveal,
} from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { REPORT_PDF_URL } from "../_schema";
import beginning from "../beginning.jpg";
import right from "../right.jpg";
import yearReport from "../year-report.jpg";
import F4herfrikaLogo from "./4herfrika";
import earth from "./earth.png";
import left from "./left.jpg";
import middle from "./middle.jpg";
import milestone1 from "./milestone-1.jpg";
import milestone2 from "./milestone-2.jpg";
import milestone3 from "./milestone-3.jpg";
import Squiggle from "./squiggle";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.impact" });
	return { title: t("title"), description: t("description") };
}

export default async function YearOneReportPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const t = await getTranslations("impact");
	const tc = await getTranslations("common");
	const ti = await getTranslations("impactIndex");

	return (
		<div className="w-full overflow-x-clip">
			<header className="px-4 pt-6 pb-14 lg:px-20 lg:pt-8 lg:pb-24">
				<div className="mx-auto max-w-6xl">
					<Link
						href="/impact"
						className="inline-flex min-h-11 items-center gap-2 rounded-full text-[15px] font-medium text-primary-500 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
					>
						<ArrowLeft aria-hidden="true" className="size-4" />
						{ti("allReports")}
					</Link>
					<div className="mt-6 flex flex-col items-center text-center">
						<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
							{ti("year1.label")}
						</span>
						<h1 className="mt-4 text-[44px] font-bold leading-tight text-secondary-500 lg:text-6xl">
							<TextReveal>{t("storyInMotion")}</TextReveal>
						</h1>
					</div>
					<Image
						src={yearReport}
						alt={t("altYearReport")}
						priority
						sizes="(max-width: 1024px) 100vw, 1024px"
						className="mx-auto mt-10 w-full max-w-5xl rounded-[28px] shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:mt-14 lg:rounded-[40px]"
					/>
				</div>
			</header>
			<div className="relative flex flex-col items-center mb-14 lg:mb-24">
				<div className="absolute overflow-x-hidden left-[2vw] top-1/2 -translate-y-1/2 w-[96vw]">
					<F4herfrikaLogo className="w-[96vw]" />
				</div>
				<Squiggle className="absolute left-0 top-1/2 -translate-y-1/2 w-screen" />
				<FadeIn direction="scale">
					<Image
						src={earth}
						alt={t("altEarth")}
						className="mx-auto max-w-xl relative w-[43vw]"
					/>
				</FadeIn>
				<div className="w-40 md:w-56 h-6 rounded-[50%] bg-black/55 blur-[20px]" />
			</div>
			<p className="mx-auto mb-16 max-w-4xl px-6 text-center text-lg leading-relaxed text-muted-foreground lg:mb-52 lg:px-20 lg:text-[32px] lg:leading-snug">
				{t("whatStarted")}
			</p>
			<div className="bg-surface-pink pt-16 md:pt-30 pb-44 md:pb-105 flex flex-col text-center relative">
				<h2 className="mb-12 text-[32px] font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("milestones")}
				</h2>
				<StaggerContainer
					className="list-disc space-y-4 px-6 text-center text-lg text-foreground marker:text-primary-500 md:space-y-6 md:text-2xl"
					style={{ listStyleType: "disc" }}
				>
					<StaggerItem>
						<li className="w-fit mx-auto">{t("girlsMentored")}</li>
					</StaggerItem>
					<StaggerItem>
						<li className="w-fit mx-auto">{t("campusesReached")}</li>
					</StaggerItem>
					<StaggerItem>
						<li className="w-fit mx-auto">{t("graduates")}</li>
					</StaggerItem>
					<StaggerItem>
						<li className="w-fit mx-auto">{t("academies")}</li>
					</StaggerItem>
				</StaggerContainer>
				<div className="grid grid-cols-2 gap-4 px-6 mt-12 md:mt-0">
					<Image
						src={milestone1}
						alt={t("altMilestone1")}
						className="relative md:absolute h-40 left-0 md:top-1/2 md:-translate-y-1/2 md:size-[16vw] object-cover md:rounded-full"
					/>
					<Image
						src={milestone2}
						alt={t("altMilestone2")}
						className="relative md:absolute h-40 md:right-60 md:bottom-48 md:size-[14vw] object-cover md:rounded-full"
					/>
					<Image
						src={milestone3}
						alt={t("altMilestone3")}
						className="relative col-span-2 h-80 md:absolute md:right-20 md:top-20 md:size-[10vw] object-cover md:rounded-full"
					/>
				</div>
			</div>
			<div className="bg-surface-indigo -mt-24 md:-mt-36 relative z-10 rounded-t-[100px] md:rounded-t-[248px]">
				<span className="h-12 md:h-32 block" />
				<p className="mx-auto mb-12 max-w-4xl px-6 text-center text-lg leading-relaxed text-muted-foreground lg:mb-32 lg:px-20 lg:text-[32px] lg:leading-snug">
					{t("neverTouched")}
				</p>
				<div className="relative mb-8 md:mb-40 grid grid-cols-2 md:flex gap-4 px-6">
					<Image
						src={middle}
						alt={t("altMiddle")}
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover mx-auto relative rounded-[28px] shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
					/>
					<Image
						src={right}
						alt={t("altRight")}
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-25 right-0 md:top-32 rounded-[28px] shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
					/>
					<Image
						src={left}
						alt={t("altLeft")}
						className="col-span-2 w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-[-25deg] left-0 md:top-32 rounded-[28px] shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
					/>
				</div>
				<div className="flex justify-center">
					<Button
						href={REPORT_PDF_URL}
						isExternal
						size="lg"
						className="min-h-12 w-fit px-6 font-medium"
					>
						{tc("downloadReport")}
					</Button>
				</div>
				<span className="h-12 md:h-36 block" />
			</div>
			<FadeIn>
				<div className="px-4 py-14 lg:px-20 lg:py-24 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-y-8 gap-x-24 items-center">
					<div>
						<h2 className="mb-10 text-2xl font-bold leading-tight text-secondary-500 lg:text-4xl">
							{t("justTheBeginning")}
						</h2>
						<Button
							href="/"
							size="lg"
							className="min-h-12 w-fit gap-2 px-6 font-medium"
						>
							{tc("goToHomepage")}
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
					<Image
						src={beginning}
						alt={t("altBeginning")}
						className="h-135 w-full rounded-[28px] object-cover shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:rounded-[40px]"
					/>
				</div>
			</FadeIn>
		</div>
	);
}
