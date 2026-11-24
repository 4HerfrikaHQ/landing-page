import type { Route } from "next";
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
		image: "/assets/home/learn.jpg",
		surface: "bg-white",
	},
	{
		key: "mentor",
		href: "/careercorner" as Route,
		external: false,
		image: "/assets/home/mentor.jpg",
		surface: "bg-white",
	},
	{
		key: "ambassador",
		href: JOIN_US_URL,
		external: true,
		image: "/assets/home/ambassador.jpg",
		surface: "bg-white",
	},
	{
		key: "donate",
		href: "/donate" as Route,
		external: false,
		image: "/assets/home/donate.jpg",
		surface: "bg-surface-pink",
	},
] as const;

export const COURSE_POINT_KEYS = ["point1", "point2", "point3"] as const;

export const STORY_COUNT = 5;
