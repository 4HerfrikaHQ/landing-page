import { db } from "@/src/db";
import { schema } from "@/src/db";
import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

const BASE_URL = "https://4herfrika.org";

const staticRoutes = [
	"",
	"/about",
	"/blog",
	"/careercorner",
	"/contact-us",
	"/donate",
	"/faq",
	"/impact",
	"/privacy",
	"/projects",
	"/terms",
];

const locales = ["en", "fr", "sw"];

// Mentor profiles come from the database, so keep the sitemap request-time
// generated instead of requiring database access during the build.
export const dynamic = "force-dynamic";

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

	const mentors = await db.query.mentors.findMany({
		where: eq(schema.mentors.active, true),
		columns: { slug: true, created_at: true },
	});

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
