import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function MentorshipSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<FadeIn className="mx-auto grid max-w-6xl overflow-hidden rounded-[20px] bg-secondary-500 text-white lg:grid-cols-2 lg:rounded-[40px]">
				<div className="p-6 lg:p-12">
					<span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-bright">
						{t("mentorship.pill")}
					</span>
					<h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
						{t("mentorship.first")}{" "}
						<em className="font-playfair font-black text-primary-bright">
							{t("mentorship.second")}
						</em>
					</h2>
					<p className="mt-4 text-lg leading-relaxed text-white/85">
						{t("mentorship.body")}
					</p>
					<Button
						href="/careercorner"
						variant="outline-white"
						size="lg"
						className="mt-6 min-h-12 gap-2 px-6 font-medium"
					>
						{t("mentorship.cta")}{" "}
						<ArrowRight aria-hidden="true" className="size-5" />
					</Button>
				</div>
				<div className="border-t border-white/10 p-6 lg:border-t-0 lg:border-l lg:p-12">
					<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-bright">
						{t("anniversary.date")}
					</p>
					<h3 className="mt-3 text-2xl font-semibold">
						{t("anniversary.title")}
					</h3>
					<p className="mt-3 text-[15px] leading-relaxed text-white/80">
						{t("anniversary.body")}
					</p>
					<p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
						{t("anniversary.partnersLabel")}
					</p>
					<p className="mt-2 text-[15px] text-white/90">
						{t("anniversary.partners")}
					</p>
				</div>
			</FadeIn>
		</section>
	);
}
