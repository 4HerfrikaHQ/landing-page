import { JOIN_US_URL } from "@/app/[locale]/(website)/navigation";
import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export async function VolunteerBand() {
	const t = await getTranslations("careers");

	return (
		<section className="flex flex-col overflow-hidden rounded-t-[40px] lg:h-150 lg:flex-row lg:rounded-t-[64px]">
			<div className="bg-secondary-500 px-6 py-14 text-white lg:w-1/2 lg:px-20 lg:py-24">
				<span className="rounded-pill bg-surface-pink px-3 py-1.5 text-xs text-primary-500">
					{t("volunteerBadge")}
				</span>
				<h2 className="mt-4 text-[32px] font-bold leading-tight lg:text-5xl">
					{t("volunteerFirst")}{" "}
					<em className="font-playfair font-black text-primary-bright">
						{t("volunteerSecond")}
					</em>
				</h2>
				<p className="mt-4 text-[15px] leading-relaxed text-[#c2c4e0] lg:text-lg">
					{t("volunteerBody")}
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Link
						href={"/careercorner/apply" as Route}
						className="inline-flex h-12 items-center justify-center rounded-pill bg-primary-bright px-6 font-semibold text-secondary-500 transition-[filter] hover:no-underline hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					>
						{t("volunteerCta")}
					</Link>
					<a
						href={JOIN_US_URL}
						target="_blank"
						rel="noreferrer"
						className="inline-flex h-12 items-center justify-center rounded-pill border-2 border-white/70 px-6 font-medium transition-colors hover:bg-white/10 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
					>
						{t("ambassadorCta")}
					</a>
				</div>
			</div>
			<div className="relative aspect-square w-full lg:aspect-auto lg:h-full lg:w-1/2">
				<Image
					src="/assets/careercorner/volunteer.jpg"
					alt={t("volunteerImageAlt")}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					className="object-cover"
				/>
			</div>
		</section>
	);
}
