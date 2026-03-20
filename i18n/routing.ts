import { defineRouting } from "next-intl/routing";

export const LOCALES = [
	{ locale: "en", name: "English", flag: "\u{1F1F3}\u{1F1EC}" },
	{ locale: "fr", name: "Fran\u00e7ais", flag: "\u{1F1E8}\u{1F1F2}" },
	{ locale: "sw", name: "Kiswahili", flag: "\u{1F1F0}\u{1F1EA}" },
] as const;

export const routing = defineRouting({
	locales: LOCALES.map((l) => l.locale),
	defaultLocale: "en",
	localePrefix: { mode: "as-needed" },
	localeDetection: true,
});
