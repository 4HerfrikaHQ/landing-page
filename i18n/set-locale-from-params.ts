import { routing } from "@/i18n/routing";
import { type Locale, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export async function setLocaleFromParams(
	params: Promise<{ locale: string }> | { locale: string },
): Promise<Locale> {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();
	setRequestLocale(locale);
	return locale;
}
