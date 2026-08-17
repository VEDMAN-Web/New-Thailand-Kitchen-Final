import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PUBLIC_ROOT = path.resolve(
  process.cwd(),
  "..",
  "..",
  "varsovia.design",
  "frontend",
  "public"
);

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

function varsoviaOrigin() {
  return (
    process.env.NEXT_PUBLIC_VARSOVIA_FRONTEND_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const rel = parts.map((segment) => decodeURIComponent(segment)).join("/");
  if (!rel || rel.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = path.resolve(PUBLIC_ROOT, rel);
  if (!file.startsWith(PUBLIC_ROOT)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const data = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    try {
      const res = await fetch(`${varsoviaOrigin()}/${rel}`, { cache: "no-store" });
      if (!res.ok) return new NextResponse("Not found", { status: 404 });
      const buf = Buffer.from(await res.arrayBuffer());
      return new NextResponse(buf, {
        headers: {
          "Content-Type":
            res.headers.get("content-type") || "application/octet-stream",
          "Cache-Control": "public, max-age=60",
        },
      });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }
}
