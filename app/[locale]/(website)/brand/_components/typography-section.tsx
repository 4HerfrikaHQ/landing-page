import { FadeIn } from "@/components/motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	CARD_CLASS,
	CONTAINER_CLASS,
	PILL_LINK_CLASS,
	SECTION_CLASS,
	SectionHeading,
} from "./section-heading";

const FONT_LINKS = {
	outfit: "https://fonts.google.com/specimen/Outfit",
	playfair: "https://fonts.google.com/specimen/Playfair+Display",
} as const;

function FontCard({ id }: { id: keyof typeof FONT_LINKS }) {
	const t = useTranslations("brand.typography");
	const isPlayfair = id === "playfair";

	return (
		<li className={`${CARD_CLASS} flex flex-col p-6 md:p-8`}>
			<p className="text-sm font-medium text-primary-500">{t(`${id}.role`)}</p>
			<h3 className="mt-1 text-2xl font-bold text-secondary-500">
				{t(`${id}.name`)}
			</h3>
			<p
				aria-hidden="true"
				className={
					isPlayfair
						? "mt-6 font-playfair text-7xl font-medium italic leading-none text-primary-500"
						: "mt-6 text-7xl font-bold leading-none text-secondary-500"
				}
			>
				Aa
			</p>
			<p
				className={
					isPlayfair
						? "mt-6 font-playfair text-3xl font-medium italic leading-tight text-primary-500"
						: "mt-6 text-3xl font-bold leading-tight text-secondary-500"
				}
			>
				{t(`${id}.sample`)}
			</p>
			<p
				aria-hidden="true"
				className={
					isPlayfair
						? "mt-4 font-playfair text-lg italic text-muted-foreground"
						: "mt-4 text-lg text-muted-foreground"
				}
			>
				ABCDEFGHIJKLM abcdefghijklm 0123456789
			</p>
			<p className="mt-4 text-[15px] leading-6 text-muted-foreground">
				{t(`${id}.note`)}
			</p>
			<a
				href={FONT_LINKS[id]}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={t("viewOnGoogle", { name: t(`${id}.name`) })}
				className={`${PILL_LINK_CLASS} mt-6 w-fit`}
			>
				{t("googleFonts")}
				<ArrowUpRight aria-hidden="true" className="size-4" />
			</a>
		</li>
	);
}

export function TypographySection() {
	const t = useTranslations("brand.typography");

	return (
		<section aria-labelledby="brand-type" className={SECTION_CLASS}>
			<div className={CONTAINER_CLASS}>
				<FadeIn>
					<SectionHeading
						id="brand-type"
						first={t("titleFirst")}
						second={t("titleSecond")}
						intro={t("intro")}
					/>
				</FadeIn>
				<FadeIn>
					<ul className="mt-10 grid gap-6 md:grid-cols-2">
						<FontCard id="outfit" />
						<FontCard id="playfair" />
					</ul>
				</FadeIn>
			</div>
		</section>
	);
}
