import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import beginning from "../../beginning.jpg";
import { type ImpactYear2Report, hasPendingFigures } from "../_report";

export async function Year2Hero({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<section
			data-hero="full-bleed"
			className="relative flex min-h-160 items-center justify-center overflow-hidden px-6 pb-16 pt-32 text-white lg:min-h-190"
		>
			<Image
				src={beginning}
				alt={t("heroAlt")}
				fill
				priority
				sizes="100vw"
				className="object-cover object-[50%_22%]"
			/>
			<div className="absolute inset-0 bg-black/60" />
			<div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
				<div className="flex flex-wrap items-center justify-center gap-2">
					{hasPendingFigures(report) ? (
						<span className="rounded-full bg-primary-500 px-3 py-1.5 text-xs font-semibold">
							{t("comingSoon")}
						</span>
					) : null}
					<span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
						{t("heroEyebrow")}
					</span>
				</div>
				<h1 className="text-[44px] font-medium leading-[1.1] tracking-tight lg:text-7xl">
					<span className="block">{t("heroFirst")}</span>
					<em className="block font-playfair font-black text-primary-bright">
						{t("heroSecond")}
					</em>
				</h1>
				<p className="max-w-2xl text-base leading-relaxed text-white/85 lg:text-xl">
					{t("heroDescription")}
				</p>
				<div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					<Button
						href="#numbers"
						size="lg"
						className="min-h-12 gap-2 px-6 font-medium"
					>
						{t("readReport")}{" "}
						<ArrowDown aria-hidden="true" className="size-5" />
					</Button>
					{report.pdf ? (
						<Button
							href={report.pdf.url}
							isExternal
							variant="outline-white"
							size="lg"
							className="min-h-12 px-6 font-medium"
						>
							{t("downloadPdf", { size: report.pdf.sizeMb })}
						</Button>
					) : (
						<Button
							href="#newsletter"
							variant="outline-white"
							size="lg"
							className="min-h-12 px-6 font-medium"
						>
							{t("getFirst")}
						</Button>
					)}
				</div>
			</div>
		</section>
	);
}
