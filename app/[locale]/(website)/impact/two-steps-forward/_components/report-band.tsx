import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { SiteImage as Image } from "@/components/ui/site-image";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ImpactYear2Report } from "../_report";

async function CoverPreview({ report }: { report: ImpactYear2Report }) {
	if (!report.pdf) return null;
	const t = await getTranslations("impactYear2");

	return (
		<a
			href={report.pdf.url}
			target="_blank"
			rel="noreferrer"
			aria-label={t("report.openCover")}
			className="group mb-8 block [perspective:1200px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
		>
			<span className="relative block w-44 transition-transform duration-500 ease-out [transform:rotateY(-24deg)_rotateX(4deg)] [transform-style:preserve-3d] group-hover:[transform:rotateY(-6deg)_rotateX(0deg)] motion-reduce:transition-none lg:w-56">
				<span
					aria-hidden="true"
					className="absolute inset-y-1 -right-2 w-3 rounded-r-sm bg-[repeating-linear-gradient(90deg,#fff_0_2px,#eee_2px_3px)] shadow-sm"
				/>
				<Image
					src={report.pdf.cover}
					alt=""
					sizes="224px"
					className="relative aspect-[3/4] w-full rounded-sm object-cover shadow-[12px_18px_36px_rgba(3,6,92,0.28)]"
				/>
			</span>
		</a>
	);
}

async function DownloadAction({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");
	if (!report.pdf) {
		return (
			<p className="mt-6 text-[15px] font-medium text-secondary-500">
				{t("report.soon")}
			</p>
		);
	}

	return (
		<Button
			href={report.pdf.url}
			isExternal
			size="lg"
			className="mt-6 min-h-12 gap-2 px-6 font-medium"
		>
			<Download aria-hidden="true" className="size-5" />
			{t("downloadPdf", { size: report.pdf.sizeMb })}
		</Button>
	);
}

export async function ReportBand({ report }: { report: ImpactYear2Report }) {
	const t = await getTranslations("impactYear2");

	return (
		<section className="px-4 py-16 lg:px-20 lg:py-24">
			<FadeIn
				direction="scale"
				className="mx-auto flex max-w-6xl flex-col items-center rounded-[20px] bg-surface-pink px-6 py-12 text-center lg:rounded-[40px] lg:py-16"
			>
				<CoverPreview report={report} />
				<h2 className="text-[32px] font-bold leading-tight text-secondary-500 lg:text-5xl">
					{t("report.first")}{" "}
					<em className="font-playfair font-black text-primary-500">
						{t("report.second")}
					</em>
				</h2>
				<p className="mt-4 max-w-2xl text-[15px] text-muted-foreground lg:text-lg">
					{t("report.body")}
				</p>
				<DownloadAction report={report} />
			</FadeIn>
		</section>
	);
}
