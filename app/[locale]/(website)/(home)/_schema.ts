import ambassadorImage from "@/public/assets/home/ambassador.jpg";
import donateImage from "@/public/assets/home/donate.jpg";
import learnImage from "@/public/assets/home/learn.jpg";
import mentorImage from "@/public/assets/home/mentor.jpg";
import type { Route } from "next";
import { z } from "zod";
import { JOIN_US_URL } from "../navigation";

export const STATS = [
	{ value: "3,000+", labelKey: "girlsMentored" },
	{ value: "1,000+", labelKey: "graduates" },
	{ value: "25+", labelKey: "campuses" },
	{ value: "5", labelKey: "countries" },
] as const;

export const PATHS = [
	{
		key: "learn",
		href: "/academy" as Route,
		external: false,
		image: learnImage,
		surface: "bg-white",
	},
	{
		key: "mentor",
		href: "/careercorner" as Route,
		external: false,
		image: mentorImage,
		surface: "bg-white",
	},
	{
		key: "ambassador",
		href: JOIN_US_URL,
		external: true,
		image: ambassadorImage,
		surface: "bg-white",
	},
	{
		key: "donate",
		href: "/donate" as Route,
		external: false,
		image: donateImage,
		surface: "bg-surface-pink",
	},
] as const;

export const COURSE_POINT_KEYS = ["point1", "point2", "point3"] as const;

export const STORY_COUNT = 5;

export const StoryVariant = z.enum(["featured", "regular", "desktopOnly"]);
export type StoryVariant = z.infer<typeof StoryVariant>;

export const PillVariant = z.enum([
	"solid",
	"outline-light",
	"outline-primary",
	"bright",
	"white",
	"outline-white",
]);
export type PillVariant = z.infer<typeof PillVariant>;

export const HeadingTone = z.enum(["light", "dark"]);
export type HeadingTone = z.infer<typeof HeadingTone>;

export const TESTIMONIAL_LIMIT = 6;
export const MIN_TESTIMONIAL_RATING = 4;
export const MIN_TESTIMONIALS = 2;
export const CYCLE_INTERVAL_MS = 2800;

export const AVATAR_TONES = [
	"bg-surface-indigo text-secondary-500",
	"bg-surface-pink text-primary-500",
	"bg-surface-teal text-foreground",
] as const;
export const FEATURED_COUNT = 1;
export const REGULAR_END_INDEX = 3;
