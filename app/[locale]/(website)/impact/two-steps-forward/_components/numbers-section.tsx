import { FadeIn } from "@/components/motion";
import { CountUp } from "@/components/motion/count-up";
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
			<FadeIn className="mx-auto max-w-6xl">
				<h2 className="text-center text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("numbers.first")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("numbers.second")}
					</em>
				</h2>
				<ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-y-14">
					{report.figures.map((figure) => (
						<li key={figure.key} className="px-2 text-center">
							<p className="text-[44px] font-semibold leading-none tabular-nums text-secondary-500 lg:text-5xl">
								<CountUp value={figure.value} />
							</p>
							<p className="mt-2 text-[15px] font-medium">
								{t(`numbers.figures.${figure.key}`)}
							</p>
						</li>
					))}
				</ul>
			</FadeIn>
		</section>
	);
}
