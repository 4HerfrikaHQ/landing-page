import beepoImage from "@/public/assets/sponsors/beepo.png";
import enactusImage from "@/public/assets/sponsors/enactus.png";
import fateFoundationImage from "@/public/assets/sponsors/fate-foundation.jpg";
import googleDeveloperStudentClubsImage from "@/public/assets/sponsors/google-developer-student-clubs.png";
import lagosSdgsYouthAllianceImage from "@/public/assets/sponsors/lagos-sdgs-youth-alliance.png";
import postmanImage from "@/public/assets/sponsors/postman.png";
import syncthesisImage from "@/public/assets/sponsors/syncthesis.jpg";
import techaffImage from "@/public/assets/sponsors/techaff.jpg";
import theGrowthHubImage from "@/public/assets/sponsors/the-growth-hub.jpg";
import trybebyFuseImage from "@/public/assets/sponsors/trybeby-fuse.jpg";
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
		logo: postmanImage,
		url: "https://postman.com",
	},
	{
		name: "Google Developer Student Clubs",
		logo: googleDeveloperStudentClubsImage,
		url: "https://gdsc.community.dev",
	},
	{
		name: "Enactus",
		logo: enactusImage,
		url: "https://enactus.org",
	},
	{
		name: "FATE Foundation",
		logo: fateFoundationImage,
		url: "https://fatefoundation.org",
	},
	{ name: "Beepo", logo: beepoImage, url: null },
	{ name: "Syncthesis", logo: syncthesisImage, url: null },
	{ name: "TechAff", logo: techaffImage, url: null },
	{
		name: "Trybeby FUSE",
		logo: trybebyFuseImage,
		url: null,
	},
	{
		name: "Lagos SDGs Youth Alliance",
		logo: lagosSdgsYouthAllianceImage,
		url: null,
	},
	{
		name: "The Growth Hub",
		logo: theGrowthHubImage,
		url: null,
	},
] as const;
