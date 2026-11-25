import { z } from "zod";

export const FigureKey = z.enum([
	"girlsMentored",
	"campuses",
	"countries",
	"graduatesMentoring",
	"academyGraduates",
]);
export type FigureKey = z.infer<typeof FigureKey>;

export const StatKey = FigureKey.extract([
	"girlsMentored",
	"campuses",
	"countries",
	"graduatesMentoring",
]);
export type StatKey = z.infer<typeof StatKey>;

export const WinKey = z.enum(["mentors", "campuses", "countries"]);
export type WinKey = z.infer<typeof WinKey>;

export const SectionId = z.enum([
	"numbers",
	"stories",
	"academy",
	"howWeCount",
]);
export type SectionId = z.infer<typeof SectionId>;

export const STAT_KEYS = StatKey.options;
export const SECTION_IDS = SectionId.options;
