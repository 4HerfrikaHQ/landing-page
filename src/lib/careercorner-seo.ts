import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://4herfrika.org";

export function localizedCareerCornerPath(
	locale: string,
	suffix = "",
): string {
	const path = `/careercorner${suffix}`;
	return `${locale === routing.defaultLocale ? "" : `/${locale}`}${path}`;
}

export function absoluteSiteUrl(path: string): string {
	return new URL(path, SITE_URL).toString();
}

/** Keep canonical, translated, and social URLs on the new route. */
export function careerCornerMetadata(
	locale: string,
	title: string,
	description: string,
	suffix = "",
): Metadata {
	const localizedPath = (language: string) =>
		localizedCareerCornerPath(language, suffix);
	const socialImageUrl = absoluteSiteUrl(
		`${localizedPath(locale)}/opengraph-image`,
	);
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
			images: [
				{
					url: socialImageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [socialImageUrl],
		},
	};
}
