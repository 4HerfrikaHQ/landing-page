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
	title:
		"4Herfrika - Raising World-Class Female Leaders at the intersection of business and technology in Africa",
	description:
		"4Herfrika is raising world-class women at the intersection of business and technology",
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
