import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { cn } from "@/utils/cn";

export const metadata: Metadata = {
	title: "4Herfrika Academy — Coming Soon",
	description:
		"4Herfrika Academy is an online learning platform built for African women in tech, business, and climate. Join the waitlist to be first in line.",
};

const circle = (size: "big" | "small", extra: string) => {
	const base = "absolute rounded-full border-[#F13EA8]";
	const variant =
		size === "big"
			? "size-50 border-50 sm:border-[100px]"
			: "size-35 border-[30px] sm:border-[60px]";
	return cn(base, variant, extra);
};

export default async function AcademyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("academy");

	const tracks = ["tech", "business", "climate"] as const;

	return (
		<main className="bg-background">
			<section
				className="-mt-16 lg:-mt-[90px] pt-16 lg:pt-[90px] flex flex-col items-center justify-center text-center px-4 min-h-[640px]"
				style={{
					background:
						"linear-gradient(180deg, rgba(236,0,140,0.18) 0%, rgba(236,0,140,0.08) 45%, rgba(255,255,255,1) 85%)",
				}}
			>
				<div className="max-w-3xl mx-auto flex flex-col items-center gap-6 mt-16">
					<span className="text-xs lg:text-sm font-medium uppercase tracking-[0.2em] text-primary-500">
						{t("comingSoonBadge")}
					</span>
					<h1 className="text-5xl lg:text-[72px] font-bold leading-[1.05] text-foreground">
						{t("heroTitle")}
					</h1>
					<p className="text-lg lg:text-2xl text-foreground/60 max-w-2xl">
						{t("heroDescription")}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 mt-2">
						<Link
							href="#waitlist"
							className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-full px-8 py-4 text-lg font-medium hover:!no-underline hover:brightness-90 transition-all"
						>
							{t("joinWaitlist")}
							<ArrowRight className="size-5" />
						</Link>
						<Button size="lg" variant="outline" href="/contact-us">
							{t("contactUs")}
						</Button>
					</div>
				</div>
			</section>

			<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
				<div className="text-center mb-12 md:mb-16">
					<h2 className="text-4xl md:text-[48px] font-semibold text-[#333333]">
						{t("tracksTitle")}
					</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
					{tracks.map((track, i) => (
						<div
							key={track}
							className="rounded-[20px] border border-[#E0E0E0] p-8 flex flex-col"
						>
							<span className="text-xs font-medium uppercase tracking-wide text-primary-500 mb-4">
								{`Track 0${i + 1}`}
							</span>
							<h3 className="text-2xl md:text-[28px] font-semibold leading-[1.3] text-foreground mb-4">
								{t(`tracks.${track}.title`)}
							</h3>
							<p className="text-base font-normal leading-relaxed text-[#636363]">
								{t(`tracks.${track}.description`)}
							</p>
						</div>
					))}
				</div>
			</section>

			<section
				id="waitlist"
				className="mx-4 sm:mx-8 my-16 h-[420px] sm:h-[600px] relative overflow-hidden rounded-[40px] bg-[#F24DAF] px-6 sm:px-8 lg:px-24 py-12 sm:py-20"
			>
				<div
					className={circle(
						"big",
						"top-0 -translate-y-[50%] left-1 sm:left-9 sm:size-[470px]",
					)}
				/>
				<div
					className={circle(
						"small",
						"top-0 -translate-y-[50%] right-4 sm:right-50 sm:size-[262px]",
					)}
				/>
				<div
					className={circle(
						"small",
						"bottom-0 left-4 sm:left-64 translate-y-[50%] sm:size-[270px] h-[140px] sm:h-[262px]",
					)}
				/>
				<div
					className={circle(
						"big",
						"bottom-0 right-4 sm:right-12 translate-y-[50%] sm:size-120",
					)}
				/>
				<div className="relative z-10 flex flex-col justify-center items-center text-center max-w-[733px] mx-auto h-full">
					<h2 className="text-[32px] sm:text-[56px] font-bold leading-[1.4] text-white mb-4 sm:mb-6">
						{t("waitlistTitle")}
					</h2>
					<p className="text-base sm:text-lg text-white mb-10 sm:mb-20">
						{t("waitlistDescription")}
					</p>
					<Link
						href="/contact-us"
						className="inline-flex items-center gap-2 bg-white text-primary-500 rounded-full px-8 py-4 text-lg font-medium hover:!no-underline hover:brightness-95 transition-all"
					>
						{t("joinWaitlist")}
						<ArrowRight className="size-5" />
					</Link>
				</div>
			</section>
		</main>
	);
}
