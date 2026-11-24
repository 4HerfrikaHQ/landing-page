import { FadeIn, TextReveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import { cn } from "@/utils/cn";
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

const MILESTONES = [
	"girlsMentored",
	"campusesReached",
	"graduates",
	"academies",
] as const;

const MILESTONE_PHOTOS = [
	{ src: milestone1, alt: "altMilestone1" },
	{ src: milestone2, alt: "altMilestone2" },
	{ src: milestone3, alt: "altMilestone3" },
] as const;

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
						className="mx-auto mt-10 w-full max-w-5xl rounded-[20px] shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:mt-14 lg:rounded-[40px]"
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
			<section className="bg-surface-pink px-4 pt-16 pb-40 lg:px-20 lg:pt-24 lg:pb-56">
				<div className="mx-auto max-w-6xl">
					<h2 className="text-center text-[32px] font-bold leading-tight text-secondary-500 lg:text-5xl">
						{t("milestones")}
					</h2>
					<ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:gap-6">
						{MILESTONES.map((key) => (
							<li
								key={key}
								className="flex items-center gap-4 rounded-[20px] bg-white p-6 text-lg font-medium text-foreground shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:p-8 lg:text-2xl"
							>
								<span
									aria-hidden="true"
									className="size-3 shrink-0 rounded-full bg-primary-500"
								/>
								{t(key)}
							</li>
						))}
					</ul>
					<div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:mt-14 lg:gap-6">
						{MILESTONE_PHOTOS.map((photo, index) => (
							<Image
								key={photo.alt}
								src={photo.src}
								alt={t(photo.alt)}
								sizes="(min-width: 1024px) 360px, 50vw"
								className={cn(
									"aspect-4/3 h-auto w-full rounded-[20px] object-cover shadow-[0_12px_24px_rgba(0,0,0,0.10)]",
									index === 2 &&
										"col-span-2 aspect-video md:col-span-1 md:aspect-4/3",
								)}
							/>
						))}
					</div>
				</div>
			</section>
			<div className="bg-surface-indigo -mt-24 md:-mt-36 relative z-10 rounded-t-[100px] md:rounded-t-[248px]">
				<span className="h-12 md:h-32 block" />
				<p className="mx-auto mb-12 max-w-4xl px-6 text-center text-lg leading-relaxed text-muted-foreground lg:mb-32 lg:px-20 lg:text-[32px] lg:leading-snug">
					{t("neverTouched")}
				</p>
				<div className="relative mb-8 md:mb-40 grid grid-cols-2 md:flex gap-4 px-6">
					<Image
						src={middle}
						alt={t("altMiddle")}
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover mx-auto relative rounded-[20px] shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
					/>
					<Image
						src={right}
						alt={t("altRight")}
						className="w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-25 right-0 md:top-32 rounded-[20px] shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
					/>
					<Image
						src={left}
						alt={t("altLeft")}
						className="col-span-2 w-full h-full md:w-[30vw] md:h-141.25 object-cover md:absolute md:rotate-[-25deg] left-0 md:top-32 rounded-[20px] shadow-[0_12px_24px_rgba(0,0,0,0.10)]"
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
						className="h-135 w-full rounded-[20px] object-cover shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:rounded-[40px]"
					/>
				</div>
			</FadeIn>
		</div>
	);
}
