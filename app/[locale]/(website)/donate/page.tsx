import { RollLabel } from "@/components/ui/roll-label";
import { SiteImage as Image } from "@/components/ui/site-image";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import heroImage from "@/public/assets/donate/hero.jpg";
import { isOnlineGivingConfigured } from "@/src/lib/paystack/client";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { DonateFaq } from "./_components/donate-faq";
import { GiveBar } from "./_components/give-bar";
import { GiveSection } from "./_components/give-section";
import { GoalBand } from "./_components/goal-band";
import { StatsBand } from "./_components/stats-band";
import { WaysToGive } from "./_components/ways-to-give";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.donate" });
	return { title: t("title"), description: t("description") };
}

export default async function DonationPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const t = await getTranslations("donate.hero");
	const online = isOnlineGivingConfigured();

	return (
		<main className="overflow-x-clip bg-background text-foreground">
			<section
				data-hero="full-bleed"
				className="relative flex min-h-[680px] items-end overflow-hidden text-white lg:min-h-[760px] lg:items-start"
			>
				<Image
					src={heroImage}
					alt={t("imageAlt")}
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/60" />
				<div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 pb-10 pt-32 text-center lg:pb-20 lg:pt-60">
					<span className="rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("badge")}
					</span>
					<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-[72px]">
						{t("titleFirst")}
						<br />
						<em className="font-playfair font-black text-primary-bright">
							{t("titleSecond")}
						</em>
					</h1>
					<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
						{t("description")}
					</p>
					<a
						href="#give"
						className="press mt-1 inline-flex h-12 items-center justify-center rounded-full bg-primary-500 px-8 text-lg font-medium text-white outline-offset-2 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-white"
					>
						<RollLabel>{t("cta")}</RollLabel>
					</a>
				</div>
			</section>
			<style>
				{
					"html{scroll-padding-bottom:96px}@media (min-width:1024px){html{scroll-padding-bottom:0}}"
				}
			</style>
			<StatsBand />
			<GiveSection online={online} />
			<GoalBand />
			<WaysToGive />
			<DonateFaq online={online} />
			<GiveBar />
		</main>
	);
}
