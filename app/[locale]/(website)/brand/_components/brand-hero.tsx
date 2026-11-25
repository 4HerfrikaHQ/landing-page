import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { LOGO_DOWNLOAD_ZIP } from "../_data/brand-assets";
import { CONTAINER_CLASS, PinkBadge } from "./section-heading";

export function BrandHero() {
	const t = useTranslations("brand");

	return (
		<section className="bg-linear-to-b from-surface-pink to-white px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-14 lg:px-8">
			<div className={CONTAINER_CLASS}>
				<PinkBadge>{t("badge")}</PinkBadge>
				<h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] text-secondary-500 md:text-6xl lg:text-7xl">
					{t("titleFirst")}{" "}
					<em className="font-playfair font-medium text-primary-500">
						{t("titleSecond")}
					</em>
				</h1>
				<p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-xl md:leading-8">
					{t("intro")}
				</p>
				<a
					href={LOGO_DOWNLOAD_ZIP}
					download
					className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-500 px-7 text-base font-medium text-white press hover:brightness-90 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
				>
					<Download aria-hidden="true" className="size-5" />
					{t("downloadAll")}
				</a>
			</div>
		</section>
	);
}
