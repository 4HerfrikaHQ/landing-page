import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import UnderlineSquiggle from "../about/underline-squiggle";

export const metadata: Metadata = {
	title: "4Herfrika Academy — Coming Soon",
	description:
		"4Herfrika Academy is an online learning platform built for African women in tech, business, and climate. Join the waitlist to be first in line.",
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
			<section className="bg-muted py-16 md:py-24 lg:py-28">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
					<FadeIn>
						<p className="text-xs md:text-sm font-semibold tracking-[0.2em] text-primary-500 uppercase mb-5">
							{t("comingSoonBadge")}
						</p>
					</FadeIn>
					<FadeIn delay={0.1}>
						<h1 className="text-pretty text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
							{t("heroTitle")}
						</h1>
					</FadeIn>
					<UnderlineSquiggle width={240} className="mt-4 mb-6" />
					<FadeIn delay={0.15}>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
							{t("heroDescription")}
						</p>
					</FadeIn>
					<FadeIn delay={0.2}>
						<div className="mt-10 flex flex-col sm:flex-row gap-4">
							<Button size="lg" href="/academy#waitlist">
								{t("joinWaitlist")}
							</Button>
							<Button size="lg" variant="outline" href="/contact-us">
								{t("contactUs")}
							</Button>
						</div>
					</FadeIn>
				</div>
			</section>

			<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
				<div className="text-center mb-12 md:mb-16">
					<FadeIn>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground">
							{t("tracksTitle")}
						</h2>
					</FadeIn>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
					{tracks.map((track, i) => (
						<FadeIn key={track} delay={0.05 * i}>
							<div className="flex flex-col">
								<p className="text-xs font-semibold tracking-wider text-primary-500 uppercase mb-3">
									{`0${i + 1}`}
								</p>
								<h3 className="text-2xl md:text-3xl font-bold text-foreground border-b-[3px] border-primary-500 pb-3 mb-4 w-fit">
									{t(`tracks.${track}.title`)}
								</h3>
								<p className="text-base md:text-lg text-muted-foreground">
									{t(`tracks.${track}.description`)}
								</p>
							</div>
						</FadeIn>
					))}
				</div>
			</section>

			<section
				id="waitlist"
				className="relative overflow-hidden bg-primary-500 text-white"
			>
				<div
					className="absolute -top-32 -left-24 size-96 rounded-full bg-white/10"
					aria-hidden
				/>
				<div
					className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-white/10"
					aria-hidden
				/>
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28 relative flex flex-col items-center text-center">
					<FadeIn>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
							{t("waitlistTitle")}
						</h2>
					</FadeIn>
					<FadeIn delay={0.1}>
						<p className="mt-4 text-base md:text-lg max-w-2xl text-white/90">
							{t("waitlistDescription")}
						</p>
					</FadeIn>
					<FadeIn delay={0.15}>
						<div className="mt-8">
							<Button
								size="lg"
								href="/contact-us"
								className="bg-white text-primary-500 hover:bg-white/90"
							>
								{t("joinWaitlist")}
							</Button>
						</div>
					</FadeIn>
				</div>
			</section>
		</main>
	);
}
