import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import type { ImpactYear2Report } from "../_report";
import { LESSON_KEYS } from "../_schema";
import { SectionHeading } from "./section-heading";

async function CountNote({ report }: { report: ImpactYear2Report }) {
	if (report.fullCountPublished) return null;
	const t = await getTranslations("impactYear2");

	return (
		<p className="mt-8 text-center text-sm text-muted-foreground">
			{t("numbers.pendingNote")}
		</p>
	);
}

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
				<SectionHeading
					pill={t("numbers.pill")}
					first={t("numbers.first")}
					second={t("numbers.second")}
					className="text-center"
				/>
				<FadeIn>
					<ul className="mt-12 grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-primary-500">
						{report.figures.map((figure) => (
							<li key={figure.key} className="px-2 text-center">
								<p className="text-[44px] font-semibold leading-none tabular-nums text-secondary-500 lg:text-5xl">
									{figure.value}
								</p>
								<p className="mt-2 text-[15px] font-medium">
									{t(`numbers.figures.${figure.key}.label`)}
								</p>
								<p className="mt-0.5 text-xs text-muted-foreground">
									{t(`numbers.figures.${figure.key}.note`)}
								</p>
							</li>
						))}
					</ul>
				</FadeIn>
				<CountNote report={report} />

				<h3 className="mt-20 text-3xl font-bold text-secondary-500 lg:mt-28 lg:text-4xl">
					{t("lessons.title")}
				</h3>
				<p className="mt-3 max-w-2xl text-lg text-muted-foreground">
					{t("lessons.intro")}
				</p>
				<ul className="mt-8 grid gap-4 lg:grid-cols-3 lg:gap-6">
					{LESSON_KEYS.map((key, index) => (
						<li key={key}>
							<FadeIn delay={index * 0.08} className="h-full">
								<article className="h-full rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
									<h4 className="text-lg font-semibold text-secondary-500">
										{t(`lessons.items.${key}.title`)}
									</h4>
									<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
										{t(`lessons.items.${key}.body`)}
									</p>
								</article>
							</FadeIn>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
