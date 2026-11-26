import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import type { ImpactReport } from "../_schema";

async function PendingBadge({ pending }: { pending: boolean }) {
	if (!pending) return null;
	const t = await getTranslations("impactIndex");

	return (
		<span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
			{t("year2.comingSoon")}
		</span>
	);
}

async function PdfAction({ href }: { href: string | null }) {
	if (href === null) return null;
	const t = await getTranslations("impactIndex");

	return (
		<Button
			href={href}
			isExternal
			variant="outline"
			size="lg"
			className="min-h-12 gap-2 px-6 font-medium"
		>
			<Download aria-hidden="true" className="size-5" /> {t("downloadPdf")}
		</Button>
	);
}

export async function ReportCard({ report }: { report: ImpactReport }) {
	const t = await getTranslations("impactIndex");
	const key = report.key;
	const readLabel = report.pending ? t("year2.preview") : t("readOnline");
	const note = report.pending ? t("year2.figuresPending") : t("largeFileNote");

	return (
		<FadeIn>
			<article className="rounded-[20px] bg-white p-4 shadow-[0_12px_24px_rgba(0,0,0,0.10)] lg:grid lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:rounded-[40px] lg:p-8">
				<Image
					src={report.cover}
					alt={t(`${key}.coverAlt`)}
					sizes="(max-width: 1024px) 100vw, 560px"
					className="aspect-4/3 w-full rounded-2xl object-cover lg:rounded-[20px]"
				/>
				<div className="pt-5 lg:pt-2">
					<div className="flex items-center gap-2">
						<p className="text-sm text-muted-foreground">{t(`${key}.label`)}</p>
						<PendingBadge pending={report.pending} />
					</div>
					<h3 className="mt-3 text-[28px] font-bold leading-tight lg:text-4xl">
						{t(`${key}.title`)}
					</h3>
					<p className="mt-2 text-[15px] text-muted-foreground lg:text-lg">
						{t(`${key}.summary`)}
					</p>
					<dl className="mt-5 grid grid-cols-2 gap-3">
						{report.figures.map((figure) => (
							<div key={figure.labelKey} className="rounded-xl bg-muted p-3">
								<dt className="text-xs text-muted-foreground">
									{t(figure.labelKey)}
								</dt>
								<dd className="text-2xl font-semibold tabular-nums text-secondary-500">
									{figure.value}
								</dd>
							</div>
						))}
					</dl>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Button
							href={report.onlineHref}
							size="lg"
							className="min-h-12 gap-2 px-6 font-medium"
						>
							{readLabel} <ArrowRight aria-hidden="true" className="size-5" />
						</Button>
						<PdfAction href={report.pdfHref} />
					</div>
					<p className="mt-3 text-xs text-muted-foreground">{note}</p>
				</div>
			</article>
		</FadeIn>
	);
}
