import { CountUp } from "@/components/motion/count-up";
import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import { headlineFigures } from "@/app/[locale]/(website)/impact/two-steps-forward/_report";

export async function AboutStats() {
	const t = await getTranslations("about");
	const tFigures = await getTranslations("impactYear2.numbers.figures");
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
					className="mt-10 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500/20"
				>
					{headlineFigures.map((figure) => (
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
			</div>
		</section>
	);
}
