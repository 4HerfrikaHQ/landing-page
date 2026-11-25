import { getTranslations } from "next-intl/server";
import Image from "next/image";

const LAYOUT = {
	withFeatured: {
		section: "h-[600px] lg:h-[680px]",
		text: "bottom-36 lg:bottom-auto lg:top-52",
	},
	plain: {
		section: "h-[480px] lg:h-[540px]",
		text: "bottom-16 lg:bottom-auto lg:top-48",
	},
} as const;

type Props = {
	withFeatured: boolean;
	first: string;
	second: string;
	description: string;
};

export async function BlogHero({
	withFeatured,
	first,
	second,
	description,
}: Props) {
	const t = await getTranslations("blogPage");
	const layout = LAYOUT[withFeatured ? "withFeatured" : "plain"];

	return (
		<section
			data-hero="full-bleed"
			className={`relative overflow-hidden text-white ${layout.section}`}
		>
			<Image
				src="/assets/academy/hero-source.jpg"
				alt={t("heroAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div
				className={`absolute inset-x-4 mx-auto flex max-w-4xl flex-col items-center gap-4 text-center ${layout.text}`}
			>
				<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("heroBadge")}
				</span>
				<h1 className="text-[40px] font-medium leading-[1.08] tracking-tight text-balance lg:text-[72px]">
					{first}
					<br />
					<em className="font-playfair font-black text-primary-bright break-words">
						{second}
					</em>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
					{description}
				</p>
			</div>
		</section>
	);
}
