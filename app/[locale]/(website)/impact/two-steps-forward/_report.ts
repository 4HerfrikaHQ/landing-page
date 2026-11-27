import type { StaticImageData } from "next/image";
import type { FigureKey } from "./_schema";
import cover from "./cover.jpg";

export type Figure = { key: FigureKey; value: string };

export type ImpactYear2Report = {
	pdf: { url: string; sizeMb: number; cover: StaticImageData } | null;
	figures: ReadonlyArray<Figure>;
};

export const year2Report: ImpactYear2Report = {
	pdf: {
		url: "/assets/impact/4herfrika-year-2-annual-report.pdf",
		sizeMb: 11.3,
		cover,
	},
	figures: [
		{ key: "members", value: "3,500+" },
		{ key: "campuses", value: "25+" },
		{ key: "countries", value: "5" },
		{ key: "mentored", value: "40" },
		{ key: "menstrualHealth", value: "700" },
		{ key: "bootcampGraduates", value: "500" },
		{ key: "academies", value: "3" },
		{ key: "partners", value: "12" },
	],
};

const HEADLINE_FIGURE_KEYS: ReadonlyArray<FigureKey> = [
	"members",
	"campuses",
	"countries",
	"menstrualHealth",
];

export const headlineFigures = year2Report.figures.filter((figure) =>
	HEADLINE_FIGURE_KEYS.includes(figure.key),
);
