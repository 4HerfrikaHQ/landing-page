import { FadeIn } from "@/components/motion";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ReactNode } from "react";

const FALLBACK_IMAGE = "/assets/academy/hero-source.jpg";

export async function FaqHero({
	imageUrl,
	imageAlt,
	children,
}: {
	imageUrl: string | null;
	imageAlt: string;
	children: ReactNode;
}) {
	const t = await getTranslations("faq");
	return (
		<section
			data-hero="full-bleed"
			className="relative overflow-hidden text-white"
		>
			<Image
				src={imageUrl ?? FALLBACK_IMAGE}
				alt={imageAlt}
				fill
				priority
				sizes="100vw"
				className="object-cover"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<FadeIn className="relative mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 pb-16 pt-40 text-center lg:pb-32 lg:pt-56">
				<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("title")}
				</span>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-[72px]">
					{t("heroFirst")}{" "}
					<em className="font-playfair font-black text-primary-bright">
						{t("heroSecond")}
					</em>
				</h1>
				<p className="max-w-xl text-[17px] text-white/85 lg:text-xl">
					{t("description")}
				</p>
				{children}
			</FadeIn>
		</section>
	);
}
