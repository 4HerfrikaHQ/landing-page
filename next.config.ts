import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withMDX = createMDX();

const IMPACT_REPORT_SLUGS = {
	"year-1": "from-one-to-many",
	"year-2": "two-steps-forward",
};

const THIRTY_DAYS = 60 * 60 * 24 * 30;

const nextConfig: NextConfig = {
	typedRoutes: true,
	productionBrowserSourceMaps: false,
	async redirects() {
		// Keep old bookmarks, mentor links, and onboarding invitations working.
		// Explicit English URLs go straight to the unprefixed canonical URL.
		const prefixes = ["", "/en", "/fr", "/sw"];
		const canonicalPrefix = (prefix: string) =>
			prefix === "/en" ? "" : prefix;
		return [
			...prefixes.map((prefix) => ({
				source: `${prefix}/careers-corner/:path*`,
				destination: `${canonicalPrefix(prefix)}/careercorner/:path*`,
				permanent: true,
			})),
			...prefixes.flatMap((prefix) =>
				Object.entries(IMPACT_REPORT_SLUGS).map(([year, slug]) => ({
					source: `${prefix}/impact/${year}`,
					destination: `${canonicalPrefix(prefix)}/impact/${slug}`,
					permanent: true,
				})),
			),
			...prefixes.map((prefix) => ({
				source: `${prefix}/projects`,
				destination: `${canonicalPrefix(prefix)}/blog/category/projects`,
				permanent: true,
			})),
		];
	},
	async headers() {
		return [
			{
				source: "/assets/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: `public, max-age=${THIRTY_DAYS}, stale-while-revalidate=${THIRTY_DAYS}`,
					},
				],
			},
		];
	},
	experimental: {
		authInterrupts: true,
		viewTransition: true,
		serverActions: {
			bodySizeLimit: "4.25mb",
		},
	},
	images: {
		minimumCacheTTL: THIRTY_DAYS,
		qualities: [100, 75],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.pexels.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				port: "",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "images.prismic.io",
				port: "",
				pathname: "/4herfrika-admin/**",
			},
			{
				protocol: "https",
				hostname: "*.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/**",
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "54321",
				pathname: "/storage/v1/object/public/**",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				port: "54321",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
};

export default withNextIntl(withMDX(nextConfig));
