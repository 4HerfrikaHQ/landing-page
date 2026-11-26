import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { TextReveal } from "@/components/motion/text-reveal";
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
			<div className="mx-auto max-w-6xl px-4 pb-6 lg:px-20">
				<Link
					href="/impact"
					className="inline-flex min-h-11 items-center gap-2 rounded-full text-[15px] font-medium text-primary-500 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
				>
					<ArrowLeft aria-hidden="true" className="size-4" />
					{ti("allReports")}
				</Link>
			</div>
			<Image
				src={yearReport}
				alt={t("altYearReport")}
				className="mx-auto max-w-full"
			/>
			<h1 className="mx-auto my-16 text-center text-3xl font-bold text-secondary-500 md:my-28 md:text-5xl">
				<TextReveal>{t("storyInMotion")}</TextReveal>
			</h1>
			<div className="relative flex flex-col items-center mb-20 md:mb-32">
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
			<p className="mx-auto mb-20 max-w-6xl px-6 text-center text-lg leading-relaxed text-muted-foreground md:mb-52 md:text-[32px] md:leading-snug">
				{t("whatStarted")}
			</p>
			<div className="bg-surface-pink pt-16 md:pt-30 pb-44 md:pb-105 flex flex-col text-center relative">
				<FadeIn>
					<h2 className="mb-12 text-3xl font-bold text-secondary-500 md:text-5xl">
						{t("milestones")}
					</h2>
				</FadeIn>
				<RevealGroup
					as="ul"
					className="list-disc space-y-4 px-6 text-center text-lg text-foreground marker:text-primary-500 md:space-y-6 md:text-2xl"
				>
					<li className="mx-auto w-fit">{t("girlsMentored")}</li>
					<li className="mx-auto w-fit">{t("campusesReached")}</li>
					<li className="mx-auto w-fit">{t("graduates")}</li>
					<li className="mx-auto w-fit">{t("academies")}</li>
				</RevealGroup>
				<div className="grid grid-cols-2 gap-4 px-6 mt-12 lg:mt-0">
					<Image
						src={milestone1}
						alt={t("altMilestone1")}
						className="relative lg:absolute h-40 left-0 lg:top-1/2 lg:-translate-y-1/2 lg:size-[16vw] object-cover lg:rounded-full"
					/>
					<Image
						src={milestone2}
						alt={t("altMilestone2")}
						className="relative lg:absolute h-40 lg:right-60 lg:bottom-48 lg:size-[14vw] object-cover lg:rounded-full"
					/>
					<Image
						src={milestone3}
						alt={t("altMilestone3")}
						className="relative col-span-2 h-80 lg:absolute lg:right-20 lg:top-20 lg:size-[10vw] object-cover lg:rounded-full"
					/>
				</div>
			</div>
			<div className="bg-surface-indigo -mt-24 md:-mt-36 relative z-10 rounded-t-[100px] md:rounded-t-[248px]">
				<span className="h-12 md:h-32 block" />
				<p className="mb-12 px-8 text-center text-lg leading-relaxed text-muted-foreground md:mb-32 md:px-20 md:text-[32px] md:leading-snug">
					{t("neverTouched")}
				</p>
				<div className="relative mb-8 md:mb-40 grid grid-cols-2 md:flex gap-4 px-6">
					<Image
						src={middle}
						alt={t("altMiddle")}
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover mx-auto relative"
					/>
					<Image
						src={right}
						alt={t("altRight")}
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-25 right-0 md:top-32"
					/>
					<Image
						src={left}
						alt={t("altLeft")}
						className="col-span-2 w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-[-25deg] left-0 md:top-32"
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
				<div className="px-6 pt-12 pb-8 md:p-20 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-y-8 gap-x-24 items-center">
					<div>
						<h2 className="mb-12 text-lg font-bold leading-normal text-secondary-500 md:text-[32px]">
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
						className="w-full h-135 object-cover"
					/>
				</div>
			</FadeIn>
		</div>
	);
}
