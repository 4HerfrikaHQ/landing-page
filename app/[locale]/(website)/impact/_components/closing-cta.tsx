import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { JOIN_US_URL } from "../../navigation";

export async function ClosingCta() {
	const t = await getTranslations("impactIndex");

	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<FadeIn className="mx-auto flex max-w-6xl flex-col items-center text-center">
				<h2 className="text-[32px] font-bold leading-tight lg:text-5xl">
					{t("ctaFirst")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("ctaSecond")}
					</em>
				</h2>
				<p className="mt-4 max-w-xl text-[15px] text-muted-foreground lg:text-lg">
					{t("ctaDescription")}
				</p>
				<div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Button
						href="/donate"
						size="lg"
						className="min-h-12 px-8 font-medium"
					>
						{t("donate")}
					</Button>
					<Button
						href={JOIN_US_URL}
						isExternal
						variant="outline"
						size="lg"
						className="min-h-12 px-8 font-medium"
					>
						{t("join")}
					</Button>
				</div>
			</FadeIn>
		</section>
	);
}
