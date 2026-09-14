import { routing } from "@/i18n/routing";
import { setLocaleFromParams } from "@/i18n/set-locale-from-params";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
	metadataBase: new URL("https://4herfrika.org"),
	title: {
		default:
			"4Herfrika — Empowering World-Class Female Leaders in Tech & Business Across Africa",
		template: "%s | 4Herfrika",
	},
	description:
		"Join 3,000+ women across 25+ African university campuses gaining tech skills, mentorship, and leadership training. 4Herfrika is on a mission to impact 2 million women by 2030.",
	keywords: [
		"4Herfrika",
		"mentorship for young African women",
		"mentorship for African women",
		"mentorship for women in Africa",
		"find a mentor Africa",
		"women in tech Africa",
		"female leaders Africa",
		"women empowerment Africa",
		"tech academy Africa",
		"mentorship for women",
		"career mentorship for women",
		"leadership development for women",
		"girls in STEM Africa",
		"digital skills Africa",
		"women entrepreneurship Africa",
		"campus tech bootcamp",
	],
	authors: [{ name: "4Herfrika", url: "https://4herfrika.org" }],
	creator: "4Herfrika",
	publisher: "4Herfrika",
	openGraph: {
		type: "website",
		locale: "en",
		siteName: "4Herfrika",
		title:
			"4Herfrika — Empowering World-Class Female Leaders in Tech & Business Across Africa",
		description:
			"Join 3,000+ women across 25+ African university campuses gaining tech skills, mentorship, and leadership training.",
	},
	twitter: {
		card: "summary_large_image",
		title: "4Herfrika — World-Class Female Leaders in Africa",
		description:
			"Tech skills, mentorship, and leadership for 3,000+ women across 25+ campuses. Join the movement.",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: "/",
		languages: {
			en: "/en",
			fr: "/fr",
			sw: "/sw",
		},
	},
};

const organizationSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	"@id": "https://4herfrika.org/#organization",
	name: "4Herfrika",
	alternateName: "4HerFrika",
	url: "https://4herfrika.org",
	logo: "https://4herfrika.org/assets/navbar-logo.png",
	description:
		"4Herfrika provides mentorship, tech skills, and leadership training for young African women across 25+ university campuses.",
	sameAs: [
		"https://twitter.com/4herfrika",
		"https://www.instagram.com/4herfrika",
		"https://www.linkedin.com/company/4herfrika",
	],
};

const websiteSchema = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: "4Herfrika",
	url: "https://4herfrika.org",
	publisher: { "@id": "https://4herfrika.org/#organization" },
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	await setLocaleFromParams(params);

	return (
		<NextIntlClientProvider>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify([organizationSchema, websiteSchema]).replace(
						/</g,
						"\\u003c",
					),
				}}
			/>
			{children}
		</NextIntlClientProvider>
	);
}
