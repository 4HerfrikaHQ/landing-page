import type { StaticImageData } from "next/image";
import beginning from "./beginning.jpg";
import {
	type ImpactYear2Report,
	figureValue,
	hasPendingFigures,
	year2Report,
} from "./year-2/_report";
import yearReport from "./year-report.jpg";

export const REPORT_PDF_URL =
	"https://jqmgbdefbzvxxvstfhhb.supabase.co/storage/v1/object/public/site-assets/4herfrika-Annual-report.pdf";

export const impactStats = [
	{ value: "3,000+", labelKey: "statGirls" },
	{ value: "25+", labelKey: "statCampuses" },
	{ value: "5", labelKey: "statCountries" },
	{ value: "1,000+", labelKey: "statGraduates" },
] as const;

type ReportKey = "year1" | "year2";

type FigureKey =
	| "figureGirls"
	| "figureCampuses"
	| "figureGraduates"
	| "figureCountries";

export type ImpactReport = {
	key: ReportKey;
	cover: StaticImageData;
	onlineHref: string;
	pdfHref: string | null;
	pending: boolean;
	figures: ReadonlyArray<{ value: string | null; labelKey: FigureKey }>;
};

function year2Figures(report: ImpactYear2Report): ImpactReport["figures"] {
	return [
		{ value: figureValue(report, "girlsMentored"), labelKey: "figureGirls" },
		{ value: figureValue(report, "campuses"), labelKey: "figureCampuses" },
		{
			value: figureValue(report, "academyGraduates"),
			labelKey: "figureGraduates",
		},
		{ value: figureValue(report, "countries"), labelKey: "figureCountries" },
	];
}

export const impactReports: ReadonlyArray<ImpactReport> = [
	{
		key: "year2",
		cover: beginning,
		onlineHref: "/impact/year-2",
		pdfHref: year2Report.pdf?.url ?? null,
		pending: hasPendingFigures(year2Report),
		figures: year2Figures(year2Report),
	},
	{
		key: "year1",
		cover: yearReport,
		onlineHref: "/impact/year-1",
		pdfHref: REPORT_PDF_URL,
		pending: false,
		figures: [
			{ value: "3,000+", labelKey: "figureGirls" },
			{ value: "25+", labelKey: "figureCampuses" },
			{ value: "1,000+", labelKey: "figureGraduates" },
			{ value: "5", labelKey: "figureCountries" },
		],
	},
];
