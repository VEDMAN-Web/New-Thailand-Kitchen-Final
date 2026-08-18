import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  varsoviaMediaPathCandidates,
  varsoviaRemotePreviewUrl,
} from "@/lib/varsoviaMediaAliases";

const PUBLIC_ROOTS = [
  path.resolve(process.cwd(), "..", "..", "varsovia.design", "frontend", "public"),
  path.resolve(process.cwd(), "..", "varsovia.design", "frontend", "public"),
  path.resolve(process.cwd(), "public"),
];

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

function varsoviaOrigins() {
  const configured = (
    process.env.NEXT_PUBLIC_VARSOVIA_FRONTEND_URL?.trim() || ""
  ).replace(/\/+$/, "");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const origin of [
    configured,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://varsovia.design",
    "https://www.varsovia.design",
  ]) {
    if (origin && !seen.has(origin)) {
      seen.add(origin);
      out.push(origin);
    }
  }
  return out;
}

async function readLocal(rel: string): Promise<Buffer | null> {
  for (const root of PUBLIC_ROOTS) {
    const file = path.resolve(root, rel);
    if (!file.startsWith(root)) continue;
    try {
      return await fs.readFile(file);
    } catch {
      /* try next root */
    }
  }
  return null;
}

async function fetchRemote(url: string): Promise<{ buf: Buffer; type: string } | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      buf,
      type: res.headers.get("content-type") || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

function asResponseBody(data: Buffer): ArrayBuffer {
  const bytes = new Uint8Array(data.byteLength);
  bytes.set(data);
  return bytes.buffer;
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

  const requested = `/${rel.replace(/^\/+/, "")}`;
  const candidates = varsoviaMediaPathCandidates(requested);

  for (const candidate of candidates) {
    const localRel = candidate.replace(/^\/+/, "");
    const data = await readLocal(localRel);
    if (data) {
      const ext = path.extname(localRel).toLowerCase();
      return new NextResponse(asResponseBody(data), {
        headers: {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  for (const candidate of candidates) {
    const localRel = candidate.replace(/^\/+/, "");
    for (const origin of varsoviaOrigins()) {
      const remote = await fetchRemote(`${origin}/${localRel}`);
      if (remote) {
        return new NextResponse(asResponseBody(remote.buf), {
          headers: {
            "Content-Type": remote.type,
            "Cache-Control": "public, max-age=60",
          },
        });
      }
    }
  }

  const unsplash = varsoviaRemotePreviewUrl(requested);
  if (unsplash) {
    const remote = await fetchRemote(unsplash);
    if (remote) {
      return new NextResponse(asResponseBody(remote.buf), {
        headers: {
          "Content-Type": remote.type,
          "Cache-Control": "public, max-age=300",
        },
      });
    }
  }

  return new NextResponse("Not found", { status: 404 });
}
