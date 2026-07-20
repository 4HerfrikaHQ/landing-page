export const NAV_LINKS = [
	{ name: "About Us", href: "/about" },
	{
		name: "Projects",
		href: "/projects",
	},
	{ name: "Academy", href: "/academy" },
	{ name: "Career Corner", href: "/careers-corner" },
	{ name: "Blog", href: "/blog" },
	{ name: "Contact Us", href: "/contact-us" },
];

export const JOIN_US_URL =
	"https://docs.google.com/forms/d/e/1FAIpQLSdAc4tbTbcdh1CIjO0C8eoSL7bNWzBlT1aykd8Vcm67PDnprw/viewform";

export const ACTION_BUTTONS = [
	{ name: "Donate", href: "/donate", isPrimary: false, isExternal: false },
	{ name: "Join Us", href: JOIN_US_URL, isPrimary: true, isExternal: true },
];

export type Navlink = (typeof NAV_LINKS)[number] & {
	dropdownItems?: { name: string; href: string }[];
};
