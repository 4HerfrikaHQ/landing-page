import { CountUp } from "@/components/motion/count-up";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import { STATS } from "../_schema";

export async function StatsRow() {
	const t = await getTranslations("home.stats");

	return (
		<section
			aria-label={t("label")}
			className="bg-primary-500/2 px-4 py-14 lg:px-20 lg:py-20"
		>
			<RevealGroup
				as="ul"
				className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500"
			>
				{STATS.map((stat) => (
					<li key={stat.labelKey} className="text-center">
						<p className="text-[44px] font-semibold tabular-nums text-secondary-500 lg:text-5xl">
							<CountUp value={stat.value} />
						</p>
						<p className="mt-1 text-[15px] font-medium">{t(stat.labelKey)}</p>
						<p className="text-xs text-muted-foreground">{t("year")}</p>
					</li>
				))}
			</RevealGroup>
		</section>
	);
}
