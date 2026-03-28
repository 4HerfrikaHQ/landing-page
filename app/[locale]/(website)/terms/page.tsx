import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import type { Route } from "next";
import { hasLocale } from "next-intl";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { routing } from "@/i18n/routing";

export default async function TermsPage({
	params,
}: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) return null;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("terms");

	const sections = [
		{ title: t("acceptanceTitle"), content: t("acceptanceContent") },
		{ title: t("useTitle"), content: t("useContent") },
		{ title: t("intellectualPropertyTitle"), content: t("intellectualPropertyContent") },
		{ title: t("userConductTitle"), content: t("userConductContent") },
		{ title: t("disclaimerTitle"), content: t("disclaimerContent") },
		{ title: t("limitationTitle"), content: t("limitationContent") },
		{ title: t("changesTitle"), content: t("changesContent") },
		{ title: t("governingLawTitle"), content: t("governingLawContent") },
		{ title: t("contactTitle"), content: t("contactContent") },
	] as const;

	return (
		<>
			<section className="bg-secondary-500 pt-32 pb-16 md:pt-40 md:pb-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<FadeIn>
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center">
							{t("title")}
						</h1>
						<p className="text-white/60 text-center mt-4 text-lg">
							{t("lastUpdated")}
						</p>
					</FadeIn>
				</div>
			</section>

			<section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto max-w-4xl">
					<FadeIn>
						<p className="text-lg text-muted-foreground mb-12 leading-relaxed">
							{t("intro")}
						</p>
					</FadeIn>

					<StaggerContainer className="space-y-10">
						{sections.map((section, index) => (
							<StaggerItem key={section.title}>
								<div className="group">
									<div className="flex items-start gap-4 mb-3">
										<span className="text-primary-500 font-bold text-lg mt-0.5 shrink-0">
											{String(index + 1).padStart(2, "0")}
										</span>
										<h2 className="text-xl md:text-2xl font-semibold text-foreground">
											{section.title}
										</h2>
									</div>
									<p className="text-muted-foreground leading-relaxed pl-10 md:pl-12">
										{section.content}
									</p>
								</div>
							</StaggerItem>
						))}
					</StaggerContainer>

					<FadeIn>
						<div className="mt-16 p-8 bg-muted rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
							<div>
								<h3 className="text-xl font-semibold text-foreground mb-1">
									{t("questionsTitle")}
								</h3>
								<p className="text-muted-foreground">
									{t("questionsContent")}
								</p>
							</div>
							<Link
								href={"/contact-us" as Route}
								className="shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary-500 hover:bg-primary-600 transition-colors"
							>
								{t("contactUs")}
							</Link>
						</div>
					</FadeIn>
				</div>
			</section>
		</>
	);
}
