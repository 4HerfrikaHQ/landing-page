import type { StaticImageData } from "next/image";
import { z } from "zod";
import { year2Report } from "./two-steps-forward/_report";
import type { FigureKey } from "./two-steps-forward/_schema";
import year2Cover from "./two-steps-forward/hero.jpg";
import yearReport from "./year-report.jpg";

export const REPORT_PDF_URL =
	"https://jqmgbdefbzvxxvstfhhb.supabase.co/storage/v1/object/public/site-assets/4herfrika-Annual-report.pdf";

export const ReportKey = z.enum(["year1", "year2"]);
export type ReportKey = z.infer<typeof ReportKey>;

export const Year1FigureKey = z.enum([
	"girlsMentored",
	"campuses",
	"academyGraduates",
	"countries",
]);
export type Year1FigureKey = z.infer<typeof Year1FigureKey>;

type FigureLabelKey =
	| `year1.figures.${Year1FigureKey}`
	| `year2.figures.${FigureKey}`;

export type ImpactReport = {
	key: ReportKey;
	cover: StaticImageData;
	onlineHref: string;
	pdf: { href: string; sizeMb: number } | null;
	figures: ReadonlyArray<{ value: string; labelKey: FigureLabelKey }>;
};

export const impactReports: ReadonlyArray<ImpactReport> = [
	{
		key: ReportKey.enum.year2,
		cover: year2Cover,
		onlineHref: "/impact/two-steps-forward",
		pdf: year2Report.pdf
			? { href: year2Report.pdf.url, sizeMb: year2Report.pdf.sizeMb }
			: null,
		figures: year2Report.figures.slice(0, 4).map((figure) => ({
			value: figure.value,
			labelKey: `year2.figures.${figure.key}` as const,
		})),
	},
	{
		key: ReportKey.enum.year1,
		cover: yearReport,
		onlineHref: "/impact/from-one-to-many",
		pdf: { href: REPORT_PDF_URL, sizeMb: 25.6 },
		figures: [
			{ value: "3,000+", labelKey: "year1.figures.girlsMentored" },
			{ value: "25+", labelKey: "year1.figures.campuses" },
			{ value: "1,000+", labelKey: "year1.figures.academyGraduates" },
			{ value: "5", labelKey: "year1.figures.countries" },
		],
	},
];
