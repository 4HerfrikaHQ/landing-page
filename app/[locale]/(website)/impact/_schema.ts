import type { StaticImageData } from "next/image";
import yearReport from "./year-report.jpg";

export const REPORT_PDF_URL =
	"https://jqmgbdefbzvxxvstfhhb.supabase.co/storage/v1/object/public/site-assets/4herfrika-Annual-report.pdf";

export const impactStats = [
	{ value: "3,000+", labelKey: "statGirls" },
	{ value: "25+", labelKey: "statCampuses" },
	{ value: "5", labelKey: "statCountries" },
	{ value: "1,000+", labelKey: "statGraduates" },
] as const;

type ReportKey = "year1";

type FigureKey =
	| "figureGirls"
	| "figureCampuses"
	| "figureGraduates"
	| "figureCountries";

export type ImpactReport = {
	key: ReportKey;
	cover: StaticImageData;
	onlineHref: string;
	pdfHref: string;
	figures: ReadonlyArray<{ value: string; labelKey: FigureKey }>;
};

export const impactReports: ReadonlyArray<ImpactReport> = [
	{
		key: "year1",
		cover: yearReport,
		onlineHref: "/impact/year-1",
		pdfHref: REPORT_PDF_URL,
		figures: [
			{ value: "3,000+", labelKey: "figureGirls" },
			{ value: "25+", labelKey: "figureCampuses" },
			{ value: "1,000+", labelKey: "figureGraduates" },
			{ value: "5", labelKey: "figureCountries" },
		],
	},
];
