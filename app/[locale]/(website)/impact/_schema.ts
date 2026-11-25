import type { StaticImageData } from "next/image";
import { z } from "zod";
import beginning from "./beginning.jpg";
import {
	type ImpactYear2Report,
	figureValue,
	hasPendingFigures,
	year2Report,
} from "./year-2/_report";
import { FigureKey } from "./year-2/_schema";
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

export const ReportFigureKey = FigureKey.extract([
	"girlsMentored",
	"campuses",
	"academyGraduates",
	"countries",
]);
export type ReportFigureKey = z.infer<typeof ReportFigureKey>;

export type ImpactReport = {
	key: ReportKey;
	cover: StaticImageData;
	onlineHref: string;
	pdfHref: string | null;
	pending: boolean;
	figures: ReadonlyArray<{ value: string | null; key: ReportFigureKey }>;
};

function year2Figures(report: ImpactYear2Report): ImpactReport["figures"] {
	return [
		{ value: figureValue(report, "girlsMentored"), key: "girlsMentored" },
		{ value: figureValue(report, "campuses"), key: "campuses" },
		{ value: figureValue(report, "academyGraduates"), key: "academyGraduates" },
		{ value: figureValue(report, "countries"), key: "countries" },
	];
}

export const impactReports: ReadonlyArray<ImpactReport> = [
	{
		key: ReportKey.enum.year2,
		cover: beginning,
		onlineHref: "/impact/year-2",
		pdfHref: year2Report.pdf?.url ?? null,
		pending: hasPendingFigures(year2Report),
		figures: year2Figures(year2Report),
	},
	{
		key: ReportKey.enum.year1,
		cover: yearReport,
		onlineHref: "/impact/year-1",
		pdfHref: REPORT_PDF_URL,
		pending: false,
		figures: [
			{ value: "3,000+", key: "girlsMentored" },
			{ value: "25+", key: "campuses" },
			{ value: "1,000+", key: "academyGraduates" },
			{ value: "5", key: "countries" },
		],
	},
];
