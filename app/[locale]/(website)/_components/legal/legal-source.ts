import { readFile } from "node:fs/promises";
import path from "node:path";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";

export type LegalKind = "privacy" | "terms";

export type LegalHeading = { id: string; text: string };

export type LegalSource = {
	title: string;
	updated: string | null;
	headings: LegalHeading[];
};

export function legalLocale(locale: string) {
	return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export function headingId(index: number) {
	return `section-${index + 1}`;
}

export function parseLegalSource(source: string): LegalSource {
	const lines = source.split("\n");
	const title = lines
		.find((line) => line.startsWith("# "))
		?.slice(2)
		.trim();
	const updated = lines
		.find((line) => /^_.+_$/.test(line.trim()))
		?.trim()
		.slice(1, -1);
	const headings = lines
		.filter((line) => line.startsWith("## "))
		.map((line, index) => ({
			id: headingId(index),
			text: line.slice(3).trim(),
		}));

	return { title: title ?? "", updated: updated ?? null, headings };
}

export async function readLegalSource(kind: LegalKind, locale: string) {
	const file = path.join(process.cwd(), "content", kind, `${locale}.mdx`);
	return parseLegalSource(await readFile(file, "utf8"));
}
