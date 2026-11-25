import { FadeIn } from "@/components/motion";
import { cn } from "@/utils/cn";
import { useTranslations } from "next-intl";
import {
	type Swatch,
	logoColours,
	websiteColours,
} from "../_data/brand-assets";
import { type SwatchGroupId, swatchInk } from "../_schema";
import { CopyHexButton } from "./copy-hex-button";
import {
	CARD_CLASS,
	CONTAINER_CLASS,
	SECTION_CLASS,
	SectionHeading,
} from "./section-heading";

function SwatchCard({ swatch }: { swatch: Swatch }) {
	const t = useTranslations("brand.colours");
	const inkClass =
		swatch.ink === swatchInk.enum.light ? "text-white" : "text-secondary-500";

	return (
		<li className={cn(CARD_CLASS, "overflow-hidden")}>
			<div
				style={{ backgroundColor: swatch.hex }}
				className={cn(
					"h-24 border-b border-black/5 p-4 text-sm font-medium",
					inkClass,
				)}
				aria-hidden="true"
			>
				Aa
			</div>
			<div className="p-3 pb-4">
				<h4 className="px-3 pt-1 text-base font-bold text-secondary-500">
					{t(`names.${swatch.id}`)}
				</h4>
				<div className="mt-1 flex flex-wrap items-center justify-between gap-x-3">
					<CopyHexButton hex={swatch.hex} />
				</div>
				<p className="px-3 pb-1 text-sm text-muted-foreground">
					<span className="font-medium">{t("rgb")}</span> {swatch.rgb}
				</p>
			</div>
		</li>
	);
}

function SwatchGroup({
	id,
	swatches,
	columns,
}: { id: SwatchGroupId; swatches: Swatch[]; columns: string }) {
	const t = useTranslations("brand.colours");

	return (
		<div className="mt-10">
			<h3 className="text-xl font-bold text-secondary-500 md:text-2xl">
				{t(`groups.${id}.title`)}
			</h3>
			<p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-muted-foreground">
				{t(`groups.${id}.intro`)}
			</p>
			<ul className={cn("mt-5 grid gap-5", columns)}>
				{swatches.map((swatch) => (
					<SwatchCard key={swatch.id} swatch={swatch} />
				))}
			</ul>
		</div>
	);
}

export function ColoursSection() {
	const t = useTranslations("brand.colours");

	return (
		<section
			aria-labelledby="brand-colours"
			className={cn(SECTION_CLASS, "bg-surface-pink")}
		>
			<div className={CONTAINER_CLASS}>
				<FadeIn>
					<SectionHeading
						id="brand-colours"
						first={t("titleFirst")}
						second={t("titleSecond")}
						intro={t("intro")}
					/>
					<SwatchGroup
						id="logo"
						swatches={logoColours}
						columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
					/>
					<SwatchGroup
						id="website"
						swatches={websiteColours}
						columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
					/>
				</FadeIn>
			</div>
		</section>
	);
}
