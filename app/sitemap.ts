import { db } from "@/src/db";
import { schema } from "@/src/db";
import { and, eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

const BASE_URL = "https://4herfrika.org";

const staticRoutes = [
	"",
	"/about",
	"/academy",
	"/blog",
	"/careercorner",
	"/careercorner/apply",
	"/contact-us",
	"/donate",
	"/faq",
	"/impact",
	"/privacy",
	"/projects",
	"/terms",
];

const locales = ["en", "fr", "sw"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const entries: MetadataRoute.Sitemap = [];

	for (const route of staticRoutes) {
		for (const locale of locales) {
			const prefix = locale === "en" ? "" : `/${locale}`;
			entries.push({
				url: `${BASE_URL}${prefix}${route}`,
				lastModified: new Date(),
				changeFrequency: route === "" ? "weekly" : "monthly",
				priority: route === "" ? 1 : 0.8,
			});
		}
	}

	let mentors: Array<{ slug: string; created_at: Date }> = [];
	try {
		mentors = await db.query.mentors.findMany({
			where: and(
				eq(schema.mentors.active, true),
				eq(schema.mentors.archived, false),
			),
			columns: { slug: true, created_at: true },
		});
	} catch (error) {
		console.error(
			"sitemap: failed to load mentors, emitting static routes only",
			error,
		);
	}

	for (const mentor of mentors) {
		for (const locale of locales) {
			const prefix = locale === "en" ? "" : `/${locale}`;
			entries.push({
				url: `${BASE_URL}${prefix}/careercorner/${mentor.slug}`,
				lastModified: mentor.created_at,
				changeFrequency: "monthly",
				priority: 0.7,
			});
		}
	}

	return entries;
}
