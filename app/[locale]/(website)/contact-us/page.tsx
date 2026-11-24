import { FadeIn } from "@/components/motion";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "./_components/contact-form";
import { ContactHero } from "./_components/contact-hero";
import { DirectDetails } from "./_components/direct-details";
import { PartnersBand } from "./_components/partners-band";
import { QuickAnswers } from "./_components/quick-answers";
import { SentGate } from "./_components/sent-gate";
import { TopicCards } from "./_components/topic-cards";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.contact" });
	return { title: t("title"), description: t("description") };
}

export default async function Contact({
	params,
}: { params: Promise<{ locale: string }> }) {
	await setLocaleFromParams(params);
	const t = await getTranslations("contact");

	return (
		<SentGate>
			<main className="overflow-x-clip bg-white text-foreground">
				<ContactHero />

				<section
					id="topics"
					className="scroll-mt-24 bg-primary-500/2 px-4 py-14 lg:px-20 lg:py-24"
				>
					<FadeIn className="mx-auto max-w-6xl">
						<div className="text-center">
							<h2 className="text-[32px] font-bold leading-tight lg:text-5xl">
								{t("topicsHeading")}{" "}
								<em className="font-playfair font-black text-primary-500">
									{t("topicsAccent")}
								</em>
							</h2>
							<p className="mt-3 text-[17px] text-muted-foreground">
								{t("topicsHint")}
							</p>
						</div>
						<TopicCards />
					</FadeIn>
				</section>

				<section
					id="form"
					className="scroll-mt-24 px-4 py-14 lg:px-20 lg:py-24"
				>
					<FadeIn className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
						<ContactForm />
						<DirectDetails />
					</FadeIn>
				</section>

				<PartnersBand />
				<QuickAnswers />
			</main>
		</SentGate>
	);
}
