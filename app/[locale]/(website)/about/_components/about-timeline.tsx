import { FadeIn } from "@/components/motion/fade-in";
import { RevealGroup } from "@/components/motion/reveal-group";
import { cn } from "@/utils/cn";
import { getTranslations } from "next-intl/server";
import { timeline } from "../_schema";
import { SectionEyebrow } from "./section-eyebrow";

export async function AboutTimeline() {
	const t = await getTranslations("about");
	return (
		<section className="bg-muted px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<FadeIn>
					<SectionEyebrow>{t("storyEyebrow")}</SectionEyebrow>
					<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
						{t("storyFirst")}{" "}
						<em className="font-playfair font-black text-primary-500">
							{t("storySecond")}
						</em>
					</h2>
				</FadeIn>
				<section
					aria-label={t("storyScrollLabel")}
					// biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard focusable
					tabIndex={0}
					className="-mx-4 mt-10 snap-x scroll-px-4 overflow-x-auto px-4 pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:mx-0 lg:overflow-visible lg:px-0 [scrollbar-width:none]"
				>
					<RevealGroup as="ol" className="flex gap-4 lg:grid lg:grid-cols-4">
						{timeline.map((item) => (
							<li
								key={item.titleKey}
								className={cn(
									"w-[72%] shrink-0 snap-start rounded-2xl p-5 sm:w-[44%] lg:w-auto",
									item.goal
										? "bg-secondary-500 text-white"
										: "border-t-4 border-primary-500 bg-white",
								)}
							>
								<p
									className={cn(
										"text-sm font-semibold",
										item.goal ? "text-primary-bright" : "text-primary-500",
									)}
								>
									{t(item.periodKey)}
								</p>
								<h3 className="mt-2 text-lg font-semibold">
									{t(item.titleKey)}
								</h3>
								<p
									className={cn(
										"mt-1 text-[15px]",
										item.goal ? "text-white/80" : "text-muted-foreground",
									)}
								>
									{t(item.descriptionKey)}
								</p>
							</li>
						))}
					</RevealGroup>
				</section>
			</div>
		</section>
	);
}
