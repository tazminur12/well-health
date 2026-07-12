import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Product image uploads: up to 6 files × 5MB (+ multipart overhead)
    serverActions: {
      bodySizeLimit: "32mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
