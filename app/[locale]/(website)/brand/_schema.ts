import { z } from "zod";

export const logoVariantId = z.enum([
	"colour",
	"navy",
	"onDark",
	"white",
	"mark",
	"markWhite",
]);
export type LogoVariantId = z.infer<typeof logoVariantId>;

export const logoSurface = z.enum(["light", "dark"]);
export type LogoSurface = z.infer<typeof logoSurface>;

export const swatchId = z.enum([
	"logoNavy",
	"logoPink",
	"primary",
	"brightPink",
	"secondary",
	"surfacePink",
	"surfaceIndigo",
	"surfaceTeal",
]);
export type SwatchId = z.infer<typeof swatchId>;

export const swatchInk = z.enum(["light", "dark"]);
export type SwatchInk = z.infer<typeof swatchInk>;

export const swatchGroupId = z.enum(["logo", "website"]);
export type SwatchGroupId = z.infer<typeof swatchGroupId>;

export const usageId = z.enum([
	"clearSpace",
	"minSize",
	"onDark",
	"distort",
	"effects",
	"busy",
]);
export type UsageId = z.infer<typeof usageId>;

export const usageKind = z.enum(["do", "dont"]);
export type UsageKind = z.infer<typeof usageKind>;

export const fontId = z.enum(["outfit", "playfair"]);
export type FontId = z.infer<typeof fontId>;

export const LOGO_WIDTH_PX = 6000;
export const LOGO_HEIGHT_PX = 1696;
export const MIN_LOGO_WIDTH_PX = 120;
