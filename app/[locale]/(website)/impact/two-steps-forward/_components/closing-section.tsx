import { FadeIn, TextReveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function ClosingSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section className="rounded-t-[40px] bg-secondary-500 px-4 py-16 text-white lg:rounded-t-[64px] lg:px-20 lg:py-24">
			<FadeIn className="mx-auto max-w-3xl text-center">
				<h2 className="text-4xl font-bold leading-tight lg:text-5xl">
					<TextReveal>{t("goal.first")}</TextReveal>
					<em className="font-playfair font-black text-primary-bright">
						<TextReveal delay={0.2}>{t("goal.second")}</TextReveal>
					</em>
				</h2>
				<p className="mt-4 text-lg leading-relaxed text-white/80">
					{t("goal.body")}
				</p>
				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<Button
						href="/donate"
						size="lg"
						className="min-h-12 px-8 font-medium"
					>
						{t("donate")}
					</Button>
					<Button
						href="/join-us"
						variant="outline-white"
						size="lg"
						className="min-h-12 px-6 font-medium"
					>
						{t("join")}
					</Button>
				</div>
			</FadeIn>
		</section>
	);
}
