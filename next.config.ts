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
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  async redirects() {
    // SEO 301s defined once; expanded below for the bare host and /pl, /th.
    const seo301: [string, string][] = [
      ["/about", "/#our-story"],
      ["/services/built-in-wardrobes", "/built-in-furniture/wardrobes"],
      ["/kitchens/by-property/apartment", "/kitchens/by-property/condo"],
      ["/kitchens/layouts/peninsula", "/kitchens/layouts/t-shape"],
      ["/kitchen/layouts/peninsula", "/kitchens/layouts/t-shape"],
    ];
    const seoRedirects = seo301.flatMap(([source, destination]) => [
      // Bare host: one hop straight to www (redirects run before the proxy).
      {
        source,
        has: [{ type: "host" as const, value: "thailandkitchens.com" }],
        destination: `https://www.thailandkitchens.com${destination}`,
        statusCode: 301 as const,
      },
      // Locale-prefixed versions would otherwise 404 after the proxy rewrite.
      {
        source: `/:locale(pl|th)${source}`,
        destination: `/:locale${destination}`,
        statusCode: 301 as const,
      },
      { source, destination, statusCode: 301 as const },
    ]);
    return [
      ...seoRedirects,
      { source: "/blog", destination: "/guides", permanent: true },
      // DEV-17: only redirect extension-less slugs so /blog/*.jpg assets still serve
      { source: "/blog/:slug([^./]+)", destination: "/guides/:slug", permanent: true },
      { source: "/blogs", destination: "/guides", permanent: true },
      { source: "/blogs/:slug*", destination: "/guides/:slug*", permanent: true },
      { source: "/journal", destination: "/guides", permanent: true },
      { source: "/journal/:slug", destination: "/guides/:slug", permanent: true },
      { source: "/kitchen", destination: "/kitchens", permanent: true },
      { source: "/kitchen/:path*", destination: "/kitchens/:path*", permanent: true },
      { source: "/styles/:slug", destination: "/kitchens/styles/:slug", permanent: true },
      { source: "/projects", destination: "/gallery", permanent: true },
      { source: "/portfolio", destination: "/gallery", permanent: true },
      { source: "/catalog", destination: "/catalogue", permanent: true },
      // DEV-10: redirect thin location×service pages to their parent city pages
      { source: "/locations/bangkok/kitchen-renovation", destination: "/locations/bangkok", permanent: true },
      { source: "/locations/bangkok/kitchen-design", destination: "/locations/bangkok", permanent: true },
      { source: "/locations/phuket/kitchen-renovation", destination: "/locations/phuket", permanent: true },
      { source: "/locations/koh-samui/kitchen-design", destination: "/locations/koh-samui", permanent: true },
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
