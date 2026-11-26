import { HoverCard } from "@/components/motion";
import { RevealGroup } from "@/components/motion/reveal-group";
import { getTranslations } from "next-intl/server";
import { HIGHLIGHT_KEYS } from "../_schema";

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
				<RevealGroup
					as="ul"
					className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
				>
					{HIGHLIGHT_KEYS.map((key) => (
						<li key={key}>
							<HoverCard className="h-full rounded-[20px]">
								<article className="h-full rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
									<p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-500">
										{t(`highlights.items.${key}.tag`)}
									</p>
									<h3 className="mt-3 text-xl font-semibold text-secondary-500">
										{t(`highlights.items.${key}.title`)}
									</h3>
									<p className="mt-2 text-[15px] text-muted-foreground">
										{t(`highlights.items.${key}.body`)}
									</p>
								</article>
							</HoverCard>
						</li>
					))}
				</RevealGroup>
			</div>
		</section>
	);
}
