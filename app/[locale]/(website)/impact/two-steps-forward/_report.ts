import type { StaticImageData } from "next/image";
import type { FigureKey } from "./_schema";

export type Figure = { key: FigureKey; value: string };

export type ImpactYear2Report = {
	pdf: { url: string; sizeMb: string; cover: StaticImageData } | null;
	figures: ReadonlyArray<Figure>;
};

export const year2Report: ImpactYear2Report = {
	pdf: null,
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
