/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    webpackBuildWorker: true,
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: "memory",
      });
    }
    return config;
  },
};

export default nextConfig;
