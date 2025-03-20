import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}, 
    mdxRs: true,
  },
  serverExternalPackages: ['mongoose'], 
};

export default nextConfig;