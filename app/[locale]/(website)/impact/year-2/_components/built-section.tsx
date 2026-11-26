import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import { BUILT_KEYS } from "../_schema";
import { SectionHeading } from "./section-heading";

export async function BuiltSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section
			id="built"
			className="scroll-mt-28 bg-primary-500/2 px-4 py-16 lg:px-20 lg:py-24"
		>
			<div className="mx-auto max-w-6xl">
				<SectionHeading
					pill={t("built.pill")}
					first={t("built.first")}
					second={t("built.second")}
				/>
				<ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{BUILT_KEYS.map((key, index) => (
						<li key={key}>
							<FadeIn delay={index * 0.08} className="h-full">
								<article className="h-full rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
									<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-500">
										{t(`built.items.${key}.when`)}
									</p>
									<h3 className="mt-3 text-xl font-semibold text-secondary-500">
										{t(`built.items.${key}.title`)}
									</h3>
									<p className="mt-2 text-[15px] text-muted-foreground">
										{t(`built.items.${key}.body`)}
									</p>
								</article>
							</FadeIn>
						</li>
					))}
				</ol>
				<p className="mt-10 max-w-3xl text-lg text-muted-foreground">
					{t("built.closing")}
				</p>
			</div>
		</section>
	);
}
