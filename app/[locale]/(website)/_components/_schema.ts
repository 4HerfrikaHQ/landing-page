import type messages from "@/messages/en.json";

type NavKey = keyof typeof messages.nav;
type CommonKey = keyof typeof messages.common;

export const NAV_LINKS = [
	{ nameKey: "aboutUs" as NavKey, href: "/about" },
	{ nameKey: "projects" as NavKey, href: "/projects" },
	{ nameKey: "careerCorner" as NavKey, href: "/careers-corner" },
	{ nameKey: "blog" as NavKey, href: "/blog" },
	{ nameKey: "contactUs" as NavKey, href: "/contact-us" },
] as const;

export const ACTION_BUTTONS = [
	{ nameKey: "donate" as CommonKey, href: "/donate", isPrimary: false },
	{ nameKey: "joinUs" as CommonKey, href: "/join-us", isPrimary: true },
] as const;

export type Navlink = (typeof NAV_LINKS)[number] & {
	dropdownItems?: { nameKey: NavKey; href: string }[];
};
