import { FadeIn } from "@/components/motion";
import {
	Droplet,
	GraduationCap,
	HeartHandshake,
	Landmark,
	type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HIGHLIGHT_KEYS } from "../_schema";

const ICONS: Record<(typeof HIGHLIGHT_KEYS)[number], LucideIcon> = {
	registered: Landmark,
	careerCorner: HeartHandshake,
	menstrualHealth: Droplet,
	academies: GraduationCap,
};

const CARD_STAGGER = 0.14;

export async function HighlightsSection() {
	const t = await getTranslations("impactYear2");

	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<h2 className="text-center text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("highlights.first")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("highlights.second")}
					</em>
				</h2>
				<ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{HIGHLIGHT_KEYS.map((key, index) => {
						const Icon = ICONS[key];
						return (
							<li key={key}>
								<FadeIn delay={index * CARD_STAGGER} className="h-full">
									<article className="group h-full rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)] transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(3,6,92,0.14)] active:scale-[0.98] motion-reduce:transition-none">
										<FadeIn
											direction="scale"
											delay={index * CARD_STAGGER + 0.25}
										>
											<span className="flex size-12 items-center justify-center rounded-2xl bg-surface-pink text-primary-500 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none">
												<Icon aria-hidden="true" className="size-6" />
											</span>
										</FadeIn>
										<p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-primary-500">
											{t(`highlights.items.${key}.tag`)}
										</p>
										<h3 className="mt-2 text-xl font-semibold text-secondary-500">
											{t(`highlights.items.${key}.title`)}
										</h3>
										<p className="mt-2 text-[15px] text-muted-foreground">
											{t(`highlights.items.${key}.body`)}
										</p>
									</article>
								</FadeIn>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}
