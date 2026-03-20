/** @type {import('next').NextConfig} */
const nextConfig = {
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: process.env.NODE_ENV === "production",
	},
	productionBrowserSourceMaps: false,
	images: {
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
		],
	},
};

export default nextConfig;
