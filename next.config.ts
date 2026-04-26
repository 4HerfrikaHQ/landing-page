import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
	typedRoutes: true,
	productionBrowserSourceMaps: false,
	experimental: {
    authInterrupts: true,
		serverActions: {
			bodySizeLimit: "4mb",
		},
	},
	images: {
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
		],
	},
};

export default withNextIntl(nextConfig);
