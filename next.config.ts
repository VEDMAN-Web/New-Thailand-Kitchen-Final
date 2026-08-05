import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = (
  process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
).replace(/\/+$/, "");

// Extra dev hosts (e.g. a rotating ngrok URL), comma-separated in .env.local
const extraDevOrigins = (process.env.ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
  .filter(Boolean);

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
  // Large CMS media uploads are proxied via /api → Express. Next defaults to 10MB
  // and truncates the body (causing multer "socket hang up" / aborted uploads).
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  // Allow LAN + tunnel access to Next.js HMR /dev resources in development
  allowedDevOrigins: [
    "192.168.1.18",
    "192.168.1.26",
    "192.168.1.*",
    "10.100.193.207",
    "10.100.*.*",
    "10.*.*.*",
    "localhost",
    "127.0.0.1",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
    ...extraDevOrigins,
  ],
  // Same-origin /api → Express (works for localhost AND LAN IP like 192.168.x.x)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
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
