import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', 
  images: {
    unoptimized: true,
  },
  basePath: '/ai_spend_audit', 
  trailingSlash: true, // Recommended for static exports
  poweredByHeader: false,
};

export default nextConfig;
