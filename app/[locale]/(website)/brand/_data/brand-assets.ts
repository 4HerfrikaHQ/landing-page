export const LOGO_DOWNLOAD_ZIP = "/brand/4herfrika-brand-assets.zip";

export type LogoVariant = {
	id: "colour" | "navy" | "onDark" | "white" | "mark" | "markWhite";
	file: string;
	width: number;
	height: number;
	surface: "light" | "dark";
};

const LOGO_SIZE = { width: 6000, height: 1696 } as const;
const MARK_SIZE = { width: 3040, height: 4388 } as const;

export const logoVariants: LogoVariant[] = [
	{ id: "colour", file: "4herfrika-logo", surface: "light", ...LOGO_SIZE },
	{ id: "navy", file: "4herfrika-logo-navy", surface: "light", ...LOGO_SIZE },
	{
		id: "onDark",
		file: "4herfrika-logo-on-dark",
		surface: "dark",
		...LOGO_SIZE,
	},
	{ id: "white", file: "4herfrika-logo-white", surface: "dark", ...LOGO_SIZE },
	{ id: "mark", file: "4herfrika-mark", surface: "light", ...MARK_SIZE },
	{
		id: "markWhite",
		file: "4herfrika-mark-white",
		surface: "dark",
		...MARK_SIZE,
	},
];

export type SwatchId =
	| "logoNavy"
	| "logoPink"
	| "primary"
	| "brightPink"
	| "secondary"
	| "surfacePink"
	| "surfaceIndigo"
	| "surfaceTeal";

export type Swatch = {
	id: SwatchId;
	hex: string;
	rgb: string;
	ink: "light" | "dark";
};

export const logoColours: Swatch[] = [
	{ id: "logoNavy", hex: "#03065C", rgb: "3, 6, 92", ink: "light" },
	{ id: "logoPink", hex: "#E20064", rgb: "226, 0, 100", ink: "light" },
];

export const websiteColours: Swatch[] = [
	{ id: "primary", hex: "#C8007A", rgb: "200, 0, 122", ink: "light" },
	{ id: "brightPink", hex: "#FF5CC0", rgb: "255, 92, 192", ink: "dark" },
	{ id: "secondary", hex: "#03065C", rgb: "3, 6, 92", ink: "light" },
	{ id: "surfacePink", hex: "#FFF4FC", rgb: "255, 244, 252", ink: "dark" },
	{ id: "surfaceIndigo", hex: "#EDEEFF", rgb: "237, 238, 255", ink: "dark" },
	{ id: "surfaceTeal", hex: "#D4EAEA", rgb: "212, 234, 234", ink: "dark" },
];

export const usageItems = [
	{ id: "clearSpace", kind: "do" },
	{ id: "minSize", kind: "do" },
	{ id: "onDark", kind: "do" },
	{ id: "distort", kind: "dont" },
	{ id: "effects", kind: "dont" },
	{ id: "busy", kind: "dont" },
] as const;
