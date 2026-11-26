import { z } from "zod";
import { JOIN_US_URL } from "../navigation";

export const ValueTone = z.enum(["pink", "teal", "indigo", "muted"]);
export type ValueTone = z.infer<typeof ValueTone>;

export const JoinLink = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("internal"),
		href: z.enum(["/careercorner", "/academy"]),
	}),
	z.object({ kind: z.literal("external"), href: z.string() }),
]);
export type JoinLink = z.infer<typeof JoinLink>;

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
		tone: ValueTone.enum.pink,
	},
	{
		number: "02",
		titleKey: "communityDevelopment",
		descriptionKey: "communityDevelopmentDescription",
		tone: ValueTone.enum.teal,
	},
	{
		number: "03",
		titleKey: "leadership",
		descriptionKey: "leadershipDescription",
		tone: ValueTone.enum.indigo,
	},
	{
		number: "04",
		titleKey: "mentorship",
		descriptionKey: "mentorshipDescription",
		tone: ValueTone.enum.muted,
	},
] as const;

export const joinOptions = [
	{
		titleKey: "joinMentorTitle",
		descriptionKey: "joinMentorDescription",
		linkKey: "joinMentorLink",
		link: { kind: "internal", href: "/careercorner" },
	},
	{
		titleKey: "joinAmbassadorTitle",
		descriptionKey: "joinAmbassadorDescription",
		linkKey: "joinAmbassadorLink",
		link: { kind: "external", href: JOIN_US_URL },
	},
	{
		titleKey: "joinAcademyTitle",
		descriptionKey: "joinAcademyDescription",
		linkKey: "joinAcademyLink",
		link: { kind: "internal", href: "/academy" },
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
