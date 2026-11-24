import { FadeIn } from "@/components/motion";
import { MessageCircleHeart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ImpactYear2Report } from "../_report";

export async function QuotesSection({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<section
			id="stories"
			className="scroll-mt-20 bg-surface-indigo px-4 py-16 lg:px-20 lg:py-24"
		>
			<div className="mx-auto max-w-6xl">
				<h2 className="text-center text-4xl font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("quotesFirst")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("quotesSecond")}
					</em>
				</h2>
				{report.quotes.length === 0 ? (
					<FadeIn className="mx-auto mt-10 flex max-w-xl flex-col items-center rounded-[20px] bg-white p-8 text-center shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
						<span className="flex size-12 items-center justify-center rounded-full bg-surface-pink text-primary-500">
							<MessageCircleHeart aria-hidden="true" className="size-6" />
						</span>
						<h3 className="mt-4 text-xl font-semibold">
							{t("quotesEmptyTitle")}
						</h3>
						<p className="mt-2 text-[15px] text-muted-foreground">
							{t("quotesEmptyBody")}
						</p>
					</FadeIn>
				) : (
					<ul className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-6">
						{report.quotes.map((quote) => (
							<li key={quote.id}>
								<FadeIn className="h-full">
									<figure className="h-full rounded-[20px] bg-white p-6 shadow-[0_12px_24px_rgba(0,0,0,0.10)]">
										<blockquote className="text-lg leading-relaxed">
											“{quote.text}”
										</blockquote>
										<figcaption className="mt-5 flex items-center gap-3 text-sm">
											<span
												aria-hidden="true"
												className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-indigo font-semibold text-secondary-500"
											>
												{quote.name.charAt(0)}
											</span>
											<span>
												<b>{quote.name}</b>
												<br />
												<span className="text-muted-foreground">
													{quote.role} · {quote.country}
												</span>
											</span>
										</figcaption>
									</figure>
								</FadeIn>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
