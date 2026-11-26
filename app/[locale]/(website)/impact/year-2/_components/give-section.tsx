import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { GIVE_KEYS } from "../_schema";
import { SectionHeading } from "./section-heading";

export async function GiveSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section id="give" className="scroll-mt-28 px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<SectionHeading
					pill={t("give.pill")}
					first={t("give.first")}
					second={t("give.second")}
				/>
				<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
					{t("give.intro")}
				</p>
				<ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
					{GIVE_KEYS.map((key, index) => (
						<li key={key}>
							<FadeIn delay={index * 0.08} className="h-full">
								<article className="flex h-full flex-col rounded-[20px] border border-foreground/10 bg-white p-6">
									<h3 className="text-xl font-semibold text-secondary-500">
										{t(`give.items.${key}.title`)}
									</h3>
									<p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">
										{t(`give.items.${key}.body`)}
									</p>
									<p className="mt-5 text-sm font-semibold text-primary-500">
										{t(`give.items.${key}.cost`)}
									</p>
								</article>
							</FadeIn>
						</li>
					))}
				</ul>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
					<Button
						href="/donate"
						size="lg"
						className="min-h-12 px-8 font-medium"
					>
						{t("give.donate")}
					</Button>
					<Button
						href="/contact-us"
						variant="outline"
						size="lg"
						className="min-h-12 px-6 font-medium"
					>
						{t("give.inKindCta")}
					</Button>
				</div>
			</div>
		</section>
	);
}
