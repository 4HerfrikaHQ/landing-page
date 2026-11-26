import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import { OUTREACH_KEYS } from "../_schema";
import { SectionHeading } from "./section-heading";

export async function OutreachSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section
			id="outreach"
			className="scroll-mt-28 px-4 py-16 lg:px-20 lg:py-24"
		>
			<div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
				<FadeIn>
					<SectionHeading
						pill={t("outreach.pill")}
						first={t("outreach.first")}
						second={t("outreach.second")}
					/>
					<blockquote className="mt-8 font-playfair text-2xl font-bold italic leading-snug text-secondary-500 lg:text-3xl">
						“{t("outreach.quote")}”
					</blockquote>
					<p className="mt-4 text-[15px] text-muted-foreground">
						{t("outreach.quoteSource")}
					</p>
				</FadeIn>
				<ol className="relative space-y-8 border-l-2 border-primary-500/20 pl-6">
					{OUTREACH_KEYS.map((key, index) => (
						<li key={key} className="relative">
							<span
								aria-hidden="true"
								className="absolute top-1.5 -left-[31px] size-3 rounded-full bg-primary-500 ring-4 ring-white"
							/>
							<FadeIn delay={index * 0.08}>
								<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-500">
									{t(`outreach.items.${key}.when`)}
								</p>
								<h3 className="mt-2 text-xl font-semibold text-secondary-500">
									{t(`outreach.items.${key}.title`)}
								</h3>
								<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
									{t(`outreach.items.${key}.body`)}
								</p>
							</FadeIn>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
