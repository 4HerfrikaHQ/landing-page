import { FadeIn } from "@/components/motion";
import { cn } from "@/utils/cn";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { type ImpactYear2Report, figureValue } from "../_report";
import { FigureValue } from "./figure-value";

export async function Wins({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<div className="mt-16 lg:mt-24">
			<h2 className="mt-4 text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
				{t("winsFirst")}
				<br />
				<em className="font-playfair font-black text-primary-500">
					{t("winsSecond")}
				</em>
			</h2>
			<p className="mt-4 text-lg text-muted-foreground">
				<span className="lg:hidden">{t("winsIntroMobile")}</span>
				<span className="hidden lg:inline">{t("winsIntro")}</span>
			</p>
			<ul className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-8 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-12">
				{report.wins.map((win, index) => (
					<li
						key={win.key}
						className={cn(
							"relative w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-auto",
							index === 1 && "lg:translate-y-10",
						)}
					>
						<FadeIn delay={index * 0.1} className="h-full">
							<article className="h-full rounded-[20px] bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:p-6">
								<Image
									src={win.photo}
									alt={t(`wins.${win.key}.alt`)}
									sizes="(min-width: 1024px) 360px, 80vw"
									className="aspect-3/2 w-full rounded-xl object-cover"
								/>
								<p className="mt-4 text-4xl font-semibold leading-none tabular-nums text-secondary-500">
									<FigureValue value={figureValue(report, win.figureKey)} />
								</p>
								<h3 className="mt-2 text-lg font-semibold">
									{t(`wins.${win.key}.title`)}
								</h3>
								<p className="mt-1 text-[15px] text-muted-foreground">
									{t(`wins.${win.key}.body`)}
								</p>
							</article>
						</FadeIn>
					</li>
				))}
			</ul>
		</div>
	);
}
