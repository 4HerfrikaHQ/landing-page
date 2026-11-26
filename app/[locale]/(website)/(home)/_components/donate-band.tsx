import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import { PillLink } from "./pill-link";

export async function DonateBand() {
	const t = await getTranslations("home.cta");

	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<FadeIn className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[20px] bg-primary-500 p-8 text-white lg:flex-row lg:items-center lg:rounded-[40px] lg:p-14">
				<div className="flex-1">
					<h2 className="text-[32px] font-bold leading-tight lg:text-[44px]">
						{t("titleFirst")}{" "}
						<em className="font-playfair font-black">{t("titleSecond")}</em>
					</h2>
					<p className="mt-3 text-lg text-white/90">{t("description")}</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<PillLink href="/donate" variant="white">
						{t("donate")}
					</PillLink>
					<PillLink href="/careercorner/apply" variant="outline-white">
						{t("volunteer")}
					</PillLink>
				</div>
			</FadeIn>
		</section>
	);
}
