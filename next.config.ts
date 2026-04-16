import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Suppress middleware deprecation warning for now
    // Will migrate to proxy in future update
  },
};

export default nextConfig;
