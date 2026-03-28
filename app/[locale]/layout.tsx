import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

const outfitSans = Outfit({
	weight: ["300", "400", "500", "600", "700"],
	subsets: ["latin"],
});

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
		"women in tech Africa",
		"female leaders Africa",
		"women empowerment",
		"tech academy Africa",
		"mentorship for women",
		"leadership development",
		"girls in STEM",
		"digital skills Africa",
		"women entrepreneurship Africa",
		"campus tech bootcamp",
		"4Herfrika",
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
		languages: {
			en: "/en",
			fr: "/fr",
			sw: "/sw",
		},
	},
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
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}
	setRequestLocale(locale as Locale);

	return (
		<html lang={locale} data-scroll-behavior="smooth">
			<body className={`${outfitSans.className} antialiased`}>
				<NextIntlClientProvider>
					{children}
				</NextIntlClientProvider>
				<Toaster position="top-right" richColors closeButton />
			</body>
		</html>
	);
}
