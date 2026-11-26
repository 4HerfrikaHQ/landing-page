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
		{ key: "girlsReached", value: "200+" },
		{ key: "mentees", value: "40" },
		{ key: "sessions", value: "35" },
		{ key: "mentors", value: "17" },
		{ key: "unilagMembers", value: "347" },
		{ key: "partners", value: "9" },
	],
};
