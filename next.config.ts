import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = (
  process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  // Allow LAN access to Next.js HMR in development
  allowedDevOrigins: ["192.168.1.26", "localhost", "127.0.0.1"],
  serverExternalPackages: ["mongodb"],
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
      { source: "/about", destination: "/#our-service", permanent: true },
      { source: "/catalog", destination: "/catalogue", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/cms-api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
