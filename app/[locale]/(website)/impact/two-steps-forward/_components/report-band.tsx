import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ImpactYear2Report } from "../_report";

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
			<FadeIn className="mx-auto flex max-w-6xl flex-col items-center rounded-[20px] bg-surface-pink px-6 py-12 text-center lg:rounded-[40px] lg:py-16">
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
