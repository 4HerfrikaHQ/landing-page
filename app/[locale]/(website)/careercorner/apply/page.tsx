import { FadeIn } from "@/components/motion/fade-in";
import { careerCornerMetadata } from "@/src/lib/careercorner-seo";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BecomeAMentorForm } from "../_components/become-a-mentor-form";
import { MentorApplyAside } from "../_components/mentor-apply-aside";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "seo.mentorApply" });
	return careerCornerMetadata(locale, t("title"), t("description"), "/apply");
}

export default async function ApplyPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);
	const t = await getTranslations("mentorApply");

	return (
		<main className="overflow-x-clip bg-white text-foreground">
			<div className="mx-auto max-w-6xl px-4 pt-6 pb-16 lg:px-20 lg:pt-12 lg:pb-24">
				<header className="max-w-2xl">
					<span className="inline-block rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("badge")}
					</span>
					<h1 className="mt-4 text-[32px] font-bold leading-tight text-secondary-500 lg:text-5xl">
						{t("titleFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("titleSecond")}
						</em>
					</h1>
					<p className="mt-4 text-[15px] leading-relaxed text-muted-foreground lg:text-lg">
						{t("intro")}
					</p>
				</header>

				<FadeIn className="mt-8 grid gap-6 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
					<BecomeAMentorForm />
					<MentorApplyAside />
				</FadeIn>
			</div>
		</main>
	);
}
