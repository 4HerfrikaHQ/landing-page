/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ["@premieroctet/next-admin"],
  },
  webpack: (config, { nextRuntime }) => {
    // Alias prisma client imports to edge when nextRuntime is "edge"
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        // "@prisma/client/runtime/library": "@prisma/client/runtime/edge",
        // "@prisma/client": "@prisma/client/edge",
      };
    }

    return config;
  },
};

export default nextConfig;
