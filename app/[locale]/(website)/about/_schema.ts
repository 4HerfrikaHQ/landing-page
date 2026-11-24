import type { Route } from "next";
import { JOIN_US_URL } from "../navigation";

export const stats = [
	{ value: "3,000+", labelKey: "statGirls" },
	{ value: "25+", labelKey: "statCampuses" },
	{ value: "1,000+", labelKey: "statGraduates" },
	{ value: "5", labelKey: "statCountries" },
] as const;

export const timeline = [
	{
		periodKey: "timelineStartPeriod",
		titleKey: "timelineStartTitle",
		descriptionKey: "timelineStartDescription",
		goal: false,
	},
	{
		periodKey: "timelineYearOne",
		titleKey: "timelineReachTitle",
		descriptionKey: "timelineReachDescription",
		goal: false,
	},
	{
		periodKey: "timelineYearOne",
		titleKey: "timelineAcademiesTitle",
		descriptionKey: "timelineAcademiesDescription",
		goal: false,
	},
	{
		periodKey: "timelineGoalPeriod",
		titleKey: "timelineGoalTitle",
		descriptionKey: "timelineGoalDescription",
		goal: true,
	},
] as const;

export const values = [
	{
		number: "01",
		titleKey: "empowerment",
		descriptionKey: "empowermentDescription",
		surface: "bg-surface-pink",
		accent: "text-primary-500",
	},
	{
		number: "02",
		titleKey: "communityDevelopment",
		descriptionKey: "communityDevelopmentDescription",
		surface: "bg-surface-teal",
		accent: "text-secondary-500",
	},
	{
		number: "03",
		titleKey: "leadership",
		descriptionKey: "leadershipDescription",
		surface: "bg-surface-indigo",
		accent: "text-secondary-500",
	},
	{
		number: "04",
		titleKey: "mentorship",
		descriptionKey: "mentorshipDescription",
		surface: "bg-muted",
		accent: "text-primary-500",
	},
] as const;

export const joinOptions = [
	{
		titleKey: "joinMentorTitle",
		descriptionKey: "joinMentorDescription",
		linkKey: "joinMentorLink",
		href: "/careercorner" as Route,
		isExternal: false,
	},
	{
		titleKey: "joinAmbassadorTitle",
		descriptionKey: "joinAmbassadorDescription",
		linkKey: "joinAmbassadorLink",
		href: JOIN_US_URL,
		isExternal: true,
	},
	{
		titleKey: "joinAcademyTitle",
		descriptionKey: "joinAcademyDescription",
		linkKey: "joinAcademyLink",
		href: "/academy" as Route,
		isExternal: false,
	},
] as const;

export const sponsors = [
	{
		name: "Postman",
		logo: "/assets/sponsors/postman.png",
		url: "https://postman.com",
	},
	{
		name: "Google Developer Student Clubs",
		logo: "/assets/sponsors/google-developer-student-clubs.png",
		url: "https://gdsc.community.dev",
	},
	{
		name: "Enactus",
		logo: "/assets/sponsors/enactus.png",
		url: "https://enactus.org",
	},
	{
		name: "FATE Foundation",
		logo: "/assets/sponsors/fate-foundation.jpg",
		url: "https://fatefoundation.org",
	},
	{ name: "Beepo", logo: "/assets/sponsors/beepo.png", url: null },
	{ name: "Syncthesis", logo: "/assets/sponsors/syncthesis.jpg", url: null },
	{ name: "TechAff", logo: "/assets/sponsors/techaff.jpg", url: null },
	{
		name: "Trybeby FUSE",
		logo: "/assets/sponsors/trybeby-fuse.jpg",
		url: null,
	},
	{
		name: "Lagos SDGs Youth Alliance",
		logo: "/assets/sponsors/lagos-sdgs-youth-alliance.png",
		url: null,
	},
	{
		name: "The Growth Hub",
		logo: "/assets/sponsors/the-growth-hub.jpg",
		url: null,
	},
] as const;
