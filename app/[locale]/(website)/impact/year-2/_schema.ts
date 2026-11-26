import { z } from "zod";

export const FigureKey = z.enum([
	"girlsReached",
	"campuses",
	"mentees",
	"socialReach",
	"sessions",
	"makoko",
]);
export type FigureKey = z.infer<typeof FigureKey>;

export const BuiltKey = z.enum([
	"registered",
	"academies",
	"partnerships",
	"mentorship",
]);
export const OutreachKey = z.enum(["makoko", "giveToGain", "rhythm"]);
export const CampusKey = z.enum(["unilag", "kwasu", "lautech"]);
export const LessonKey = z.enum(["hard", "worked", "next"]);
export const GiveKey = z.enum(["donations", "pads", "inKind"]);

export const SectionId = z.enum([
	"note",
	"built",
	"outreach",
	"campuses",
	"numbers",
	"give",
]);
export type SectionId = z.infer<typeof SectionId>;

export const SECTION_IDS = SectionId.options;
export const BUILT_KEYS = BuiltKey.options;
export const OUTREACH_KEYS = OutreachKey.options;
export const CAMPUS_KEYS = CampusKey.options;
export const LESSON_KEYS = LessonKey.options;
export const GIVE_KEYS = GiveKey.options;
