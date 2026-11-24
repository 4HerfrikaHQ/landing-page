import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export async function HowWeCount() {
	const t = await getTranslations("impactYear2");

	return (
		<section
			id="howWeCount"
			className="scroll-mt-20 border-t border-foreground/10 px-4 py-14 lg:px-20 lg:py-20"
		>
			<div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:gap-16">
				<div className="flex-1">
					<h2 className="text-2xl font-semibold text-secondary-500">
						{t("howWeCountTitle")}
					</h2>
					<p className="mt-2 text-muted-foreground">{t("howWeCountBody")}</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Button
						href="/donate"
						size="lg"
						className="min-h-12 px-6 font-medium"
					>
						{t("donate")}
					</Button>
					<Button
						href="/impact/year-1"
						variant="outline"
						size="lg"
						className="min-h-12 px-6 font-medium"
					>
						{t("year1Report")}
					</Button>
				</div>
			</div>
		</section>
	);
}
