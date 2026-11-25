import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import { type ImpactYear2Report, figureValue } from "../_report";
import { STAT_KEYS, type StatKey } from "../_schema";
import { FigureValue } from "./figure-value";

async function Stat({
	report,
	statKey,
}: { report: ImpactYear2Report; statKey: StatKey }) {
	const t = await getTranslations("impactYear2");
	const value = figureValue(report, statKey);
	const note = value === null ? t("pendingNote") : t(`figures.${statKey}.note`);

	return (
		<li className="px-2 text-center">
			<p className="text-[44px] font-semibold leading-none tabular-nums text-secondary-500 lg:text-5xl">
				<FigureValue value={value} />
			</p>
			<p className="mt-2 text-[15px] font-medium text-foreground">
				{t(`figures.${statKey}.label`)}
			</p>
			<p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
		</li>
	);
}

export function StatRow({ report }: { report: ImpactYear2Report }) {
	return (
		<FadeIn>
			<ul className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500">
				{STAT_KEYS.map((statKey) => (
					<Stat key={statKey} report={report} statKey={statKey} />
				))}
			</ul>
		</FadeIn>
	);
}
