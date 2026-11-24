import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import { type ImpactYear2Report, figureValue } from "../_report";
import { FigureValue } from "./figure-value";

const STATS = [
	"girlsMentored",
	"campuses",
	"countries",
	"graduatesMentoring",
] as const;

export async function StatRow({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<FadeIn>
			<ul className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500">
				{STATS.map((key) => {
					const value = figureValue(report, key);
					return (
						<li key={key} className="px-2 text-center">
							<p className="text-[44px] font-semibold leading-none tabular-nums text-secondary-500 lg:text-5xl">
								<FigureValue value={value} />
							</p>
							<p className="mt-2 text-[15px] font-medium text-foreground">
								{t(`figures.${key}.label`)}
							</p>
							<p className="mt-0.5 text-xs text-muted-foreground">
								{value === null ? t("pendingNote") : t(`figures.${key}.note`)}
							</p>
						</li>
					);
				})}
			</ul>
		</FadeIn>
	);
}
