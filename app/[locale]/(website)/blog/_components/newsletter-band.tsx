import { SiteImage as Image } from "@/components/ui/site-image";
import impactSourceImage from "@/public/assets/academy/impact-source.jpg";
import { getTranslations } from "next-intl/server";
import { SubscribeForm } from "../../_components/subscribe";

export async function NewsletterBand() {
	const t = await getTranslations("blogPage");

	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] bg-surface-pink lg:min-h-[480px] lg:flex-row lg:rounded-t-[64px]">
			<div className="flex flex-col justify-center px-6 py-14 lg:w-1/2 lg:px-20 lg:py-24">
				<span className="w-fit rounded-pill bg-white px-3 py-1.5 text-xs text-primary-500">
					{t("newsletterBadge")}
				</span>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-[44px]">
					{t("newsletterTitle")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("newsletterEm")}
					</em>
				</h2>
				<p className="mt-3 text-[15px] text-muted-foreground lg:text-lg">
					{t("newsletterDescription")}
				</p>
				<div className="mt-8 max-w-md">
					<SubscribeForm tone="light" showCopy={false} />
				</div>
			</div>
			<div className="relative aspect-square w-full lg:aspect-auto lg:w-1/2">
				<Image
					src={impactSourceImage}
					alt={t("newsletterAlt")}
					fill
					sizes="(min-width: 1024px) 50vw, 100vw"
					className="object-cover"
				/>
			</div>
		</section>
	);
}
