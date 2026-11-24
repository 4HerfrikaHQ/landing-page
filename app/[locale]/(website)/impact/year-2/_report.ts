import type { StaticImageData } from "next/image";
import milestone1 from "../year-1/milestone-1.jpg";
import milestone2 from "../year-1/milestone-2.jpg";
import milestone3 from "../year-1/milestone-3.jpg";

export type FigureKey =
	| "girlsMentored"
	| "campuses"
	| "countries"
	| "graduatesMentoring"
	| "academyGraduates";

export type Figure = { key: FigureKey; value: string | null };

export type Win = {
	key: "mentors" | "campuses" | "countries";
	figureKey: FigureKey;
	photo: StaticImageData;
};

export type Quote = {
	id: string;
	text: string;
	name: string;
	role: string;
	country: string;
};

export type Partner = { name: string; logo: string; url: string };

export type ImpactYear2Report = {
	pdf: { url: string; sizeMb: string } | null;
	academyLaunchDate: string;
	figures: ReadonlyArray<Figure>;
	wins: ReadonlyArray<Win>;
	quotes: ReadonlyArray<Quote>;
	partners: ReadonlyArray<Partner>;
};

export const year2Report: ImpactYear2Report = {
	pdf: null,
	academyLaunchDate: "2026-11-27",
	figures: [
		{ key: "girlsMentored", value: null },
		{ key: "campuses", value: null },
		{ key: "countries", value: null },
		{ key: "graduatesMentoring", value: null },
		{ key: "academyGraduates", value: null },
	],
	wins: [
		{ key: "mentors", figureKey: "graduatesMentoring", photo: milestone2 },
		{ key: "campuses", figureKey: "campuses", photo: milestone1 },
		{ key: "countries", figureKey: "countries", photo: milestone3 },
	],
	quotes: [],
	partners: [],
};

export function figureValue(
	report: ImpactYear2Report,
	key: FigureKey,
): string | null {
	return report.figures.find((figure) => figure.key === key)?.value ?? null;
}

export function hasPendingFigures(report: ImpactYear2Report): boolean {
	return report.figures.some((figure) => figure.value === null);
}
