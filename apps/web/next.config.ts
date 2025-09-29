import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Load env from repo root if present (monorepo dev convenience)
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      "@/": "./",
    },
    root: path.resolve(__dirname, "../.."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
      },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "x-frame-options", value: "SAMEORIGIN" },
        { key: "x-content-type-options", value: "nosniff" },
        { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
