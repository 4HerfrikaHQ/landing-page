import { CountUp } from "@/components/motion/count-up";
import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import { stats } from "../_schema";

export async function AboutStats() {
	const t = await getTranslations("about");
	return (
		<section className="bg-primary-500/2 px-4 py-14 lg:px-20 lg:py-20">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<h2 className="text-center text-[28px] font-semibold lg:text-4xl">
						{t.rich("weHaveReached", {
							pink: (chunks) => (
								<span className="text-primary-500">{chunks}</span>
							),
						})}
					</h2>
				</FadeIn>
				<RevealGroup
					as="ul"
					className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500"
				>
					{stats.map((stat) => (
						<li key={stat.labelKey} className="text-center">
							<p className="text-[44px] font-semibold tabular-nums text-secondary-500 lg:text-5xl">
								<CountUp value={stat.value} />
							</p>
							<p className="mt-1 text-[15px] font-medium">{t(stat.labelKey)}</p>
							<p className="text-xs text-muted-foreground">{t("statPeriod")}</p>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
