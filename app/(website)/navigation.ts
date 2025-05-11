export const NAV_LINKS = [
	{ name: "Home", href: "/" },
	{ name: "About Us", href: "/about" },
	{
		name: "Projects",
		href: "/projects",
		dropdownItems: [
			{ name: "Become an Ambassador", href: "/become-ambassador" },
			{ name: "Volunteer as a Mentor", href: "/volunteer-mentor" },
		],
	},
	{ name: "Career Corner", href: "/careers-corner" },
	{ name: "Blog", href: "/blog" },
	{ name: "Contact Us", href: "/contact-us" },
];

export const ACTION_BUTTONS = [
	{ name: "Donate", href: "/donate", isPrimary: false },
	{ name: "Join Us", href: "/join-us", isPrimary: true },
];
