import type { Locale } from "next-intl";
import { AFRICAN_COUNTRY_CODES, NON_AFRICAN_COUNTRY_CODES } from "./_countries";

const REGIONAL_INDICATOR_OFFSET = 0x1f1a5;

export function flagEmoji(code: string): string {
	return String.fromCodePoint(
		...[...code].map((char) => char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
	);
}

export function countryOptions(locale: Locale) {
	const names = new Intl.DisplayNames([locale], { type: "region" });
	const toOptions = (codes: readonly string[]) =>
		codes
			.map((code) => ({
				code,
				label: `${flagEmoji(code)} ${names.of(code) ?? code}`,
				name: names.of(code) ?? code,
			}))
			.sort((a, b) => a.name.localeCompare(b.name, locale))
			.map(({ code, label }) => ({ code, label }));
	return {
		africa: toOptions(AFRICAN_COUNTRY_CODES),
		other: toOptions(NON_AFRICAN_COUNTRY_CODES),
	};
}
