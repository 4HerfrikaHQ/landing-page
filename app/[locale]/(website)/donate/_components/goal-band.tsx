import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function GoalBand() {
	const t = await getTranslations("donate.goal");
	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] lg:min-h-[620px] lg:flex-row lg:rounded-t-[64px]">
			<div className="bg-secondary-500 px-6 py-14 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-20 lg:py-20">
				<span className="w-fit rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("badge")}
				</span>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-[44px]">
					{t("titleFirst")}{" "}
					<em className="font-playfair font-extrabold text-primary-bright">
						{t("titleSecond")}
					</em>
				</h2>
				<p className="mt-4 text-[17px] leading-relaxed text-[#c2c4e0]">
					{t("body")}
				</p>
				<div className="mt-8">
					<div className="flex justify-between gap-4 text-sm text-[#c2c4e0]">
						<span>{t("progressLeft")}</span>
						<span>{t("progressRight")}</span>
					</div>
					<div
						className="mt-2 h-3 overflow-hidden rounded-full bg-white/15"
						aria-hidden="true"
					>
						<span className="block h-full w-[2%] rounded-full bg-primary-bright" />
					</div>
					<p className="mt-2 text-xs text-[#c2c4e0]">{t("progressNote")}</p>
				</div>
				<a
					href="#give"
					className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-white px-6 font-medium text-secondary-500 outline-offset-2 focus-visible:outline-2 focus-visible:outline-white"
				>
					{t("cta")}
				</a>
			</div>
			<div className="relative aspect-square w-full lg:aspect-auto lg:min-h-full lg:w-1/2">
				<Image
					src="/assets/donate/goal.jpg"
					alt={t("imageAlt")}
					fill
					sizes="(min-width: 1024px) 50vw, 100vw"
					className="object-cover"
				/>
			</div>
		</section>
	);
}
