import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

/** Keep canonical, translated, and social URLs on the new route. */
export function careerCornerMetadata(
	locale: string,
	title: string,
	description: string,
	suffix = "",
): Metadata {
	const path = `/careercorner${suffix}`;
	const localizedPath = (language: string) =>
		`${language === routing.defaultLocale ? "" : `/${language}`}${path}`;
	return {
		title,
		description,
		alternates: {
			canonical: localizedPath(locale),
			languages: {
				...Object.fromEntries(
					routing.locales.map((language) => [
						language,
						localizedPath(language),
					]),
				),
				"x-default": localizedPath(routing.defaultLocale),
			},
		},
		openGraph: {
			type: "website",
			siteName: "4Herfrika",
			locale,
			url: localizedPath(locale),
			title,
			description,
		},
		twitter: { card: "summary_large_image", title, description },
	};
}
