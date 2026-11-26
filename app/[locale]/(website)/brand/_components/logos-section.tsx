import { FadeIn } from "@/components/motion";
import { cn } from "@/utils/cn";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type LogoVariant, logoVariants } from "../_data/brand-assets";
import { logoSurface, logoVariantId } from "../_schema";
import {
	CARD_CLASS,
	CONTAINER_CLASS,
	PILL_LINK_CLASS,
	SECTION_CLASS,
	SectionHeading,
} from "./section-heading";

const FORMATS = ["svg", "png"] as const;

function LogoCard({ variant }: { variant: LogoVariant }) {
	const t = useTranslations("brand.logos");
	const isMark =
		variant.id === logoVariantId.enum.mark ||
		variant.id === logoVariantId.enum.markWhite;
	const tileClass =
		variant.surface === logoSurface.enum.dark
			? "bg-secondary-500"
			: "border border-black/10 bg-white";
	const imageClass = isMark ? "h-full" : "max-h-full";

	return (
		<li className={cn(CARD_CLASS, "flex flex-col p-3")}>
			<div
				className={cn(
					"flex h-48 items-center justify-center rounded-[14px] p-8 md:h-56",
					tileClass,
				)}
			>
				<Image
					src={`/brand/${variant.file}.svg`}
					alt={t(`items.${variant.id}.alt`)}
					width={variant.width}
					height={variant.height}
					unoptimized
					className={cn("w-auto max-w-full", imageClass)}
				/>
			</div>
			<div className="flex flex-1 flex-col gap-4 p-3 pt-5">
				<div>
					<h3 className="text-xl font-bold text-secondary-500">
						{t(`items.${variant.id}.name`)}
					</h3>
					<p className="mt-1.5 text-[15px] leading-6 text-muted-foreground">
						{t(`items.${variant.id}.use`)}
					</p>
				</div>
				<div className="mt-auto flex flex-wrap gap-3">
					{FORMATS.map((format) => (
						<a
							key={format}
							href={`/brand/${variant.file}.${format}`}
							download
							aria-label={t("downloadAs", {
								name: t(`items.${variant.id}.label`),
								format: format.toUpperCase(),
							})}
							className={PILL_LINK_CLASS}
						>
							<Download aria-hidden="true" className="size-4" />
							{format.toUpperCase()}
						</a>
					))}
				</div>
			</div>
		</li>
	);
}

export function LogosSection() {
	const t = useTranslations("brand.logos");

	return (
		<section aria-labelledby="brand-logos" className={SECTION_CLASS}>
			<div className={CONTAINER_CLASS}>
				<FadeIn>
					<SectionHeading
						id="brand-logos"
						first={t("titleFirst")}
						second={t("titleSecond")}
						intro={t("intro")}
					/>
				</FadeIn>
				<FadeIn>
					<ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{logoVariants.map((variant) => (
							<LogoCard key={variant.id} variant={variant} />
						))}
					</ul>
				</FadeIn>
			</div>
		</section>
	);
}
