import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { type ImpactYear2Report, hasPendingFigures } from "../_report";

export async function NewsletterCta({ report }: { report: ImpactYear2Report }) {
	if (!hasPendingFigures(report)) {
		return null;
	}

	const t = await getTranslations("impactYear2");

	return (
		<section className="px-4 py-14 lg:px-20 lg:py-20">
			<FadeIn className="mx-auto flex max-w-6xl flex-col items-center rounded-[20px] bg-surface-pink px-6 py-12 text-center lg:rounded-[40px] lg:py-16">
				<h2 className="text-[32px] font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("newsletterFirst")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("newsletterSecond")}
					</em>
				</h2>
				<p className="mt-4 max-w-xl text-[15px] text-muted-foreground lg:text-lg">
					{t("newsletterDescription")}
				</p>
				<Button
					href="#newsletter"
					size="lg"
					className="mt-6 min-h-12 w-full px-8 font-medium sm:w-auto"
				>
					{t("getFirst")}
				</Button>
			</FadeIn>
		</section>
	);
}
