import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Mengabaikan error ESLint selama build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Mengabaikan error TypeScript selama build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;