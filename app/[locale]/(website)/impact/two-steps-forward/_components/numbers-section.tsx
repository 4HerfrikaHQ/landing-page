import { CountUp } from "@/components/motion/count-up";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import type { ImpactYear2Report } from "../_report";

export async function NumbersSection({
	report,
}: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<section
			id="numbers"
			className="scroll-mt-28 bg-primary-500/2 px-4 py-16 lg:px-20 lg:py-24"
		>
			<div className="mx-auto max-w-6xl">
				<h2 className="text-center text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("numbers.first")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("numbers.second")}
					</em>
				</h2>
				<RevealGroup
					as="ul"
					className="mt-14 grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-y-16 [&>li:nth-child(even)]:border-l lg:[&>li]:border-l-0 lg:[&>li:not(:nth-child(4n+1))]:border-l"
				>
					{report.figures.map((figure) => (
						<li
							key={figure.key}
							className="border-primary-500/15 px-3 text-center lg:px-6"
						>
							<p className="whitespace-nowrap text-4xl font-semibold leading-none tracking-tight tabular-nums text-secondary-500 sm:text-5xl lg:text-6xl">
								<CountUp value={figure.value} />
							</p>
							<p className="mt-3 text-base font-semibold text-secondary-500 lg:text-lg">
								{t(`numbers.figures.${figure.key}.label`)}
							</p>
							<p className="mt-1 text-sm text-muted-foreground">
								{t(`numbers.figures.${figure.key}.note`)}
							</p>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
