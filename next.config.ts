import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = (
  process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
).replace(/\/+$/, "");
const assetTarget = (
  process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() || ""
).replace(/\/+$/, "");

/**
 * Dev performance (Windows / slow E:):
 * - Keep distDir as `.next` inside the project.
 * - Never park `.next` or its subfolders on another drive — Turbopack
 *   then fails to resolve `react` / `next` from E: node_modules.
 * - `predev` only strips unsafe leftover junctions.
 */
const isDevLogging =
  process.env.npm_lifecycle_event === "dev" ||
  process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  distDir: ".next",
  outputFileTracingRoot: rootDir,
  turbopack: {
    root: rootDir,
  },
  allowedDevOrigins: ["192.168.1.26", "localhost", "127.0.0.1"],
  serverExternalPackages: ["mongodb"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    turbopackFileSystemCacheForDev: true,
  },
  logging: isDevLogging
    ? {
        fetches: {
          fullUrl: true,
        },
      }
    : undefined,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/guides", permanent: true },
      { source: "/blog/:slug", destination: "/guides/:slug", permanent: true },
      { source: "/journal", destination: "/guides", permanent: true },
      { source: "/journal/:slug", destination: "/guides/:slug", permanent: true },
      { source: "/kitchen", destination: "/kitchens", permanent: true },
      { source: "/kitchen/:path*", destination: "/kitchens/:path*", permanent: true },
      { source: "/styles/:slug", destination: "/kitchens/styles/:slug", permanent: true },
      { source: "/projects", destination: "/gallery", permanent: true },
      { source: "/portfolio", destination: "/gallery", permanent: true },
      { source: "/about", destination: "/#our-story", permanent: false },
      { source: "/catalog", destination: "/catalogue", permanent: true },
      { source: "/blogs", destination: "/guides", permanent: true },
      { source: "/blogs/:slug", destination: "/guides/:slug", permanent: true },
      {
        source: "/kitchens/by-property/kitchens",
        destination: "/kitchens/by-property",
        statusCode: 301,
      },
      {
        source: "/services/wardrobes",
        destination: "/built-in-furniture/wardrobes",
        statusCode: 301,
      },
      {
        source: "/services/wardrobe",
        destination: "/built-in-furniture/wardrobes",
        statusCode: 301,
      },
      {
        source: "/services/walk-in-wardrobes",
        destination: "/built-in-furniture/wardrobes",
        statusCode: 301,
      },
      {
        source: "/services/walk-in-wardrobe",
        destination: "/built-in-furniture/wardrobes",
        statusCode: 301,
      },
    ];
  },
  async rewrites() {
    const rewrites = [
      {
        source: "/cms-api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];

    if (assetTarget) {
      for (const prefix of [
        "products",
        "product",
        "blog",
        "features",
        "catlog",
        "slider",
        "testimonial",
        "contactUs",
        "video",
      ]) {
        rewrites.push({
          source: `/${prefix}/:path*`,
          destination: `${assetTarget}/${prefix}/:path*`,
        });
      }
    }

    return rewrites;
  },
};

export default nextConfig;
