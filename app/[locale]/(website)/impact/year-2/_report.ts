import type { FigureKey } from "./_schema";

export type Figure = { key: FigureKey; value: string };

export type ImpactYear2Report = {
	pdf: { url: string; sizeMb: string } | null;
	fullCountPublished: boolean;
	figures: ReadonlyArray<Figure>;
};

export const year2Report: ImpactYear2Report = {
	pdf: null,
	fullCountPublished: false,
	figures: [
		{ key: "partners", value: "9" },
		{ key: "unilagMembers", value: "347" },
		{ key: "girlsReached", value: "200+" },
		{ key: "campusesReporting", value: "3" },
	],
};
