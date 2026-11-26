import type { StaticImageData } from "next/image";
import { z } from "zod";
import beginning from "./beginning.jpg";
import { year2Report } from "./year-2/_report";
import type { FigureKey } from "./year-2/_schema";
import yearReport from "./year-report.jpg";

export const REPORT_PDF_URL =
	"https://jqmgbdefbzvxxvstfhhb.supabase.co/storage/v1/object/public/site-assets/4herfrika-Annual-report.pdf";

export const impactStats = [
	{ value: "3,000+", labelKey: "statGirls" },
	{ value: "25+", labelKey: "statCampuses" },
	{ value: "5", labelKey: "statCountries" },
	{ value: "1,000+", labelKey: "statGraduates" },
] as const;

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
	pdfHref: string | null;
	figures: ReadonlyArray<{ value: string; labelKey: FigureLabelKey }>;
};

export const impactReports: ReadonlyArray<ImpactReport> = [
	{
		key: ReportKey.enum.year2,
		cover: beginning,
		onlineHref: "/impact/year-2",
		pdfHref: year2Report.pdf?.url ?? null,
		figures: year2Report.figures.slice(0, 4).map((figure) => ({
			value: figure.value,
			labelKey: `year2.figures.${figure.key}` as const,
		})),
	},
	{
		key: ReportKey.enum.year1,
		cover: yearReport,
		onlineHref: "/impact/year-1",
		pdfHref: REPORT_PDF_URL,
		figures: [
			{ value: "3,000+", labelKey: "year1.figures.girlsMentored" },
			{ value: "25+", labelKey: "year1.figures.campuses" },
			{ value: "1,000+", labelKey: "year1.figures.academyGraduates" },
			{ value: "5", labelKey: "year1.figures.countries" },
		],
	},
];
