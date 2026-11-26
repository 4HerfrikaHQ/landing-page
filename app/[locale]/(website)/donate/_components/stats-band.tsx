import { CountUp } from "@/components/motion/count-up";
import { RevealGroup } from "@/components/motion/reveal-group";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { year2Report } from "../../impact/two-steps-forward/_report";
import type { FigureKey } from "../../impact/two-steps-forward/_schema";

const DONOR_FIGURES: ReadonlyArray<FigureKey> = [
	"members",
	"campuses",
	"menstrualHealth",
	"bootcampGraduates",
];

const figures = year2Report.figures.filter((figure) =>
	DONOR_FIGURES.includes(figure.key),
);

export async function StatsBand() {
	const t = await getTranslations("donate.stats");
	const tFigures = await getTranslations("impactYear2.numbers.figures");

	return (
		<section className="bg-primary-500/2 px-4 py-12 lg:px-20 lg:py-16">
			<div className="mx-auto max-w-6xl">
				<RevealGroup
					as="ul"
					className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500/20"
				>
					{figures.map((figure) => (
						<li key={figure.key} className="px-2 text-center">
							<p className="whitespace-nowrap text-4xl font-semibold leading-none tracking-tight tabular-nums text-secondary-500 sm:text-5xl">
								<CountUp value={figure.value} />
							</p>
							<p className="mt-3 text-base font-semibold text-secondary-500">
								{tFigures(`${figure.key}.label`)}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{tFigures(`${figure.key}.note`)}
							</p>
						</li>
					))}
				</RevealGroup>
				<p className="mt-10 text-center text-[15px] text-muted-foreground">
					{t("source")}{" "}
					<Link
						href="/impact/two-steps-forward"
						className="font-medium text-primary-500 underline underline-offset-4"
					>
						{t("reportLink")}
					</Link>
				</p>
			</div>
		</section>
	);
}
