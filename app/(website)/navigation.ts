export const NAV_LINKS = [
	{ name: "About Us", href: "/about" },
	{
		name: "Projects",
		href: "/projects",
	},
	{ name: "Career Corner", href: "/careers-corner" },
	{ name: "Blog", href: "/blog" },
	{ name: "Contact Us", href: "/contact-us" },
];

export const ACTION_BUTTONS = [
	{ name: "Donate", href: "/donate", isPrimary: false },
	{ name: "Join Us", href: "/join-us", isPrimary: true },
];

export type Navlink = (typeof NAV_LINKS)[number] & {
	dropdownItems?: { name: string; href: string }[];
};
