import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { type ImpactYear2Report, figureValue } from "../_report";
import { FigureValue } from "./figure-value";

export async function AcademySection({
	report,
}: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");
	const locale = await getLocale();
	const date = new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(report.academyLaunchDate));

	return (
		<section id="academy" className="scroll-mt-20 px-4 py-16 lg:px-20 lg:py-24">
			<FadeIn className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-16">
				<div className="relative mx-auto w-full max-w-md lg:max-w-none">
					<Image
						src="/assets/academy/impact-source.jpg"
						alt={t("academyAlt")}
						width={1200}
						height={900}
						sizes="(min-width: 1024px) 560px, 100vw"
						className="aspect-4/5 w-full rounded-[20px] object-cover lg:rounded-[40px]"
					/>
					<div className="absolute -bottom-6 right-4 rounded-[20px] bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:-right-8">
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-500">
							{t("launches")}
						</p>
						<p className="text-3xl font-semibold tabular-nums text-secondary-500">
							{date}
						</p>
					</div>
				</div>
				<div>
					<span className="inline-flex rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("academyPill")}
					</span>
					<h2 className="mt-4 text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
						{t("academyFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("academySecond")}
						</em>
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						{t("academyDescription", { date })}
					</p>
					<ul className="mt-6 grid gap-3">
						<li className="flex items-center gap-3 rounded-xl border border-foreground/10 p-4">
							<b className="w-24 shrink-0 text-2xl font-semibold tabular-nums text-secondary-500">
								<FigureValue value={figureValue(report, "academyGraduates")} />
							</b>
							<span className="text-[15px]">
								{t("figures.academyGraduates.label")},{" "}
								{t("figures.academyGraduates.note")}
							</span>
						</li>
						<li className="flex items-center gap-3 rounded-xl border border-foreground/10 p-4">
							<b className="w-24 shrink-0 text-2xl font-semibold text-secondary-500">
								{t("free")}
							</b>
							<span className="text-[15px]">{t("freeLabel")}</span>
						</li>
					</ul>
					<Button
						href="/academy"
						size="lg"
						className="mt-6 min-h-12 gap-2 px-6 font-medium"
					>
						{t("exploreAcademy")}{" "}
						<ArrowRight aria-hidden="true" className="size-5" />
					</Button>
				</div>
			</FadeIn>
		</section>
	);
}
