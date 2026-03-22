import type { MetadataRoute } from "next";

const BASE_URL = "https://4herfrika.org";

const staticRoutes = [
	"",
	"/about",
	"/blog",
	"/careers-corner",
	"/contact-us",
	"/donate",
	"/faq",
	"/impact",
	"/projects",
];

const locales = ["en", "fr", "sw"];

export default function sitemap(): MetadataRoute.Sitemap {
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

	return entries;
}
