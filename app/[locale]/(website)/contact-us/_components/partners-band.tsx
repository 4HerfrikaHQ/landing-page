import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { PartnerButton } from "./partner-button";

export async function PartnersBand() {
	const t = await getTranslations("contact");

	return (
		<div className="bg-surface-indigo">
			<section className="flex flex-col overflow-hidden rounded-t-[40px] lg:h-140 lg:flex-row lg:rounded-t-[64px]">
				<div className="bg-secondary px-6 py-14 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-20 lg:py-20">
					<span className="w-fit rounded-full bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
						{t("partnersBadge")}
					</span>
					<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-[44px]">
						{t("partnersFirst")}
						<em className="block font-playfair font-black text-primary-bright">
							{t("partnersSecond")}
						</em>
					</h2>
					<p className="mt-4 text-[17px] text-[#c2c4e0]">
						{t("partnersDescription")}
					</p>
					<PartnerButton>{t("partnersCta")}</PartnerButton>
				</div>
				<div className="relative aspect-4/3 w-full lg:aspect-auto lg:h-full lg:w-1/2">
					<Image
						src="/assets/contact/partners.jpg"
						alt={t("partnersImageAlt")}
						fill
						sizes="(max-width: 1024px) 100vw, 50vw"
						className="object-cover"
					/>
				</div>
			</section>
		</div>
	);
}
