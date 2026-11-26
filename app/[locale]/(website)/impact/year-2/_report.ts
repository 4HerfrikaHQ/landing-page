import type { FigureKey } from "./_schema";

export type Figure = { key: FigureKey; value: string };

export type ImpactYear2Report = {
	pdf: { url: string; sizeMb: string } | null;
	fullCountPublished: boolean;
	figures: ReadonlyArray<Figure>;
};

export const year2Report: ImpactYear2Report = {
	pdf: null,
	fullCountPublished: true,
	figures: [
		{ key: "girlsReached", value: "4,000+" },
		{ key: "campuses", value: "25+" },
		{ key: "mentees", value: "40" },
		{ key: "socialReach", value: "45,000" },
		{ key: "sessions", value: "35" },
		{ key: "makoko", value: "300+" },
	],
};
