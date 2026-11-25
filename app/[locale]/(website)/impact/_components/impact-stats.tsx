import { CountUp } from "@/components/motion/count-up";
import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import { impactStats } from "../_schema";

export async function ImpactStats() {
	const t = await getTranslations("impactIndex");

	return (
		<section
			aria-label={t("statsCaption")}
			className="bg-primary-500/2 px-4 py-14 lg:px-20 lg:py-20"
		>
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<p className="text-center text-sm font-medium text-muted-foreground">
						{t("statsCaption")}
					</p>
				</FadeIn>
				<RevealGroup
					as="ul"
					className="mt-8 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500"
				>
					{impactStats.map((stat) => (
						<li key={stat.labelKey} className="px-2 text-center">
							<p className="text-[44px] font-semibold leading-none tabular-nums text-secondary-500 lg:text-5xl">
								<CountUp value={stat.value} />
							</p>
							<p className="mt-2 text-[15px] font-medium text-foreground">
								{t(stat.labelKey)}
							</p>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
