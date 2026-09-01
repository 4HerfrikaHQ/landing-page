import { FadeIn } from "@/components/motion/fade-in";
import { careerCornerMetadata } from "@/src/lib/careercorner-seo";
import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FourHerfrikaLogo from "../../4herfrika-logo";
import { BecomeAMentorForm } from "../_components/become-a-mentor-form";

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

	return (
		<main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-surface-pink via-white to-white px-4 py-16">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-surface-pink to-transparent"
			/>
			<FadeIn className="relative mx-auto w-full max-w-2xl">
				<div className="flex flex-col items-center text-center">
					<FourHerfrikaLogo className="h-10 w-auto" />
					<h1 className="mt-8 font-heading text-3xl font-semibold tracking-tight text-foreground">
						Become a 4HerFrika mentor
					</h1>
					<p className="mt-3 max-w-md text-muted-foreground">
						Tell us a bit about you. Our team reviews every application and
						reaches out within a few days.
					</p>
				</div>

				<div className="mt-10 rounded-2xl border border-border/60 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-8">
					<BecomeAMentorForm />
				</div>
			</FadeIn>
		</main>
	);
}
