import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import { CAMPUS_KEYS } from "../_schema";
import { SectionHeading } from "./section-heading";

export async function CampusesSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section
			id="campuses"
			className="scroll-mt-28 bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24"
		>
			<div className="mx-auto max-w-6xl">
				<SectionHeading
					pill={t("campuses.pill")}
					first={t("campuses.first")}
					second={t("campuses.second")}
				/>
				<ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
					{CAMPUS_KEYS.map((key, index) => (
						<li key={key}>
							<FadeIn delay={index * 0.08} className="h-full">
								<article className="flex h-full flex-col rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
									<h3 className="text-2xl font-bold text-secondary-500">
										{t(`campuses.items.${key}.name`)}
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										{t(`campuses.items.${key}.lead`)}
									</p>
									<p className="mt-4 rounded-xl bg-surface-pink px-4 py-3 text-[15px] font-semibold text-primary-700">
										{t(`campuses.items.${key}.highlight`)}
									</p>
									<p className="mt-4 text-[15px] leading-relaxed text-foreground/80">
										{t(`campuses.items.${key}.body`)}
									</p>
								</article>
							</FadeIn>
						</li>
					))}
				</ul>
				<p className="mt-10 max-w-3xl text-lg text-muted-foreground">
					{t("campuses.closing")}
				</p>
			</div>
		</section>
	);
}
