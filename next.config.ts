import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Workers deployment
  output: "export",
  distDir: "out",

  compress: false,         // Cloudflare handles compression
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: true,     // Required for static export
  },

  // Trailing slash for consistent static file serving
  trailingSlash: false,
};

export default nextConfig;
