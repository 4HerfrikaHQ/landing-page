import { z } from "zod";

export const FigureKey = z.enum([
	"members",
	"campuses",
	"countries",
	"mentored",
	"menstrualHealth",
	"bootcampGraduates",
	"academies",
	"partners",
]);
export type FigureKey = z.infer<typeof FigureKey>;

export const HighlightKey = z.enum([
	"registered",
	"careerCorner",
	"menstrualHealth",
	"academies",
]);
export const HIGHLIGHT_KEYS = HighlightKey.options;
