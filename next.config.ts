import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = (
  process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000"
).replace(/\/+$/, "");

// Frontend URL for proxying public static assets (brand logos, product images, etc.)
const frontendTarget = (
  process.env.NEXT_PUBLIC_THAILAND_FRONTEND_URL?.trim() ||
  process.env.NEXT_PUBLIC_FRONTEND_URL?.trim() ||
  "http://localhost:3000"
).replace(/\/+$/, "");

const varsoviaTarget = (
  process.env.NEXT_PUBLIC_VARSOVIA_FRONTEND_URL?.trim() ||
  "http://localhost:3000"
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
    const apiRewrites = [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
    const thailandPrefixes = [
      "/brandLogo",
      "/products",
      "/blog",
      "/features",
      "/catlog",
      "/slider",
      "/testimonial",
      "/product",
      "/footer",
      "/icon",
      "/video",
      "/images",
      "/contactUs",
      "/gallery",
    ].filter((prefix) => {
      // Varsovia has no /products/Kitchen*.png — don't proxy those to :3000.
      if (frontendTarget === varsoviaTarget && (prefix === "/products" || prefix === "/product")) {
        return false;
      }
      return true;
    });
    const siteAssetRewrites = thailandPrefixes.map((prefix) => ({
      source: `${prefix}/:path+`,
      destination: `${frontendTarget}${prefix}/:path*`,
    }));

    // Serve Varsovia media via the local route handler (public/, remote fallbacks)
    // instead of proxying to :3000 — avoids ECONNREFUSED when the client app is offline.
    const varsoviaAssetRewrites = [
      {
        source: "/home/:path*",
        destination: "/varsovia-static/home/:path*",
      },
      {
        source: "/Interior-kitchen/:path*",
        destination: "/varsovia-static/Interior-kitchen/:path*",
      },
      {
        source: "/quality-sale/:path*",
        destination: "/varsovia-static/quality-sale/:path*",
      },
    ];

    return {
      beforeFiles: [...apiRewrites, ...varsoviaAssetRewrites, ...siteAssetRewrites],
    };
  },
};

export default nextConfig;
