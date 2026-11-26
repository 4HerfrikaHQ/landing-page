import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

const NEXT_STEPS = ["reporting", "funding", "playbook"] as const;

export async function ClosingSection() {
	const t = await getTranslations("impactYear2");

	return (
		<>
			<section className="rounded-t-[40px] bg-secondary-500 px-4 py-16 text-white lg:rounded-t-[64px] lg:px-20 lg:py-24">
				<FadeIn className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-primary-bright">
							{t("goal.pill")}
						</span>
						<h2 className="mt-4 text-4xl font-bold leading-tight lg:text-5xl">
							{t("goal.first")}{" "}
							<em className="font-playfair font-black text-primary-bright">
								{t("goal.second")}
							</em>
						</h2>
						<p className="mt-4 text-lg leading-relaxed text-white/80">
							{t("goal.body")}
						</p>
					</div>
					<div>
						<h3 className="text-xl font-semibold">{t("goal.nextTitle")}</h3>
						<ol className="mt-5 space-y-4">
							{NEXT_STEPS.map((key, index) => (
								<li key={key} className="flex gap-4">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-bright font-semibold text-secondary-500">
										{index + 1}
									</span>
									<p className="pt-1.5 text-[15px] text-white/90">
										{t(`goal.next.${key}`)}
									</p>
								</li>
							))}
						</ol>
					</div>
				</FadeIn>
			</section>
			<section className="px-4 py-16 lg:px-20 lg:py-24">
				<FadeIn className="mx-auto max-w-3xl text-center">
					<h2 className="text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
						{t("thanks.first")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("thanks.second")}
						</em>
					</h2>
					<p className="mt-6 text-lg leading-relaxed text-foreground/80">
						{t("thanks.leads")}
					</p>
					<p className="mt-4 text-lg leading-relaxed text-foreground/80">
						{t("thanks.partners")}
					</p>
					<p className="mt-4 text-lg leading-relaxed text-foreground/80">
						{t("thanks.girls")}
					</p>
					<p className="mt-8 font-playfair text-2xl font-bold italic text-primary-500">
						{t("thanks.closing")}
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
							variant="outline"
							size="lg"
							className="min-h-12 px-6 font-medium"
						>
							{t("join")}
						</Button>
					</div>
				</FadeIn>
			</section>
		</>
	);
}
