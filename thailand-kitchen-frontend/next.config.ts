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
    unoptimized: false,
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
