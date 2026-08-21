import { NextRequest } from "next/server";

const ALLOWED_RESOURCES = new Set([
  "site",
  "home",
  "products",
  "projects",
  "blogs",
  "faqs",
  "testimonials",
  "catalogues",
  "showcases",
  "team",
  "team-members",
  "partners",
  "showrooms",
  "core-strengths",
  "contacts",
  "health",
  "media",
]);

function apiBase() {
  return (
    process.env.VARSOVIA_API_URL?.trim() ||
    "https://varsovia-design.onrender.com/api"
  ).replace(/\/+$/, "");
}

function thailandBase() {
  const raw = process.env.BACKEND_URL?.trim() || "http://127.0.0.1:5000";
  return `${raw.replace(/\/+$/, "").replace(/\/api$/i, "")}/api`;
}

function mediaPublicBase() {
  return (
    process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
}

function requestAuthorization(request: NextRequest) {
  return (
    request.headers.get("authorization") ||
    request.headers.get("x-admin-authorization") ||
    ""
  ).trim();
}

function toAbsoluteUploadUrl(url: string): string {
  const value = String(url || "").trim();
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  const base = mediaPublicBase();
  if (base) return `${base}${path}`;
  // Fall back to Thailand API origin so Varsovia can load the asset
  try {
    return `${new URL(thailandBase()).origin}${path}`;
  } catch {
    return path;
  }
}

async function isAuthenticated(request: NextRequest) {
  const authorization = requestAuthorization(request);
  if (!authorization) return false;

  try {
    const response = await fetch(`${thailandBase()}/auth/me`, {
      headers: { Authorization: authorization },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Varsovia API has no /media store. Upload via Thailand Kitchen API (JWT),
 * then return absolute URLs suitable for the Varsovia public site.
 */
async function proxyMediaToThailand(request: NextRequest) {
  const authorization = requestAuthorization(request);
  const contentType = request.headers.get("content-type") || "";
  const body = await request.arrayBuffer();

  try {
    const kind = encodeURIComponent(
      request.nextUrl.searchParams.get("kind") || "image"
    );
    const upstream = await fetch(`${thailandBase()}/upload?kind=${kind}`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });

    const json = (await upstream.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
      file?: { url?: string; [key: string]: unknown };
    } | null;

    if (!upstream.ok || !json?.file?.url) {
      const message =
        upstream.status === 401
          ? "Sign in again, then retry the image upload."
          : json?.message ||
            "Media upload failed. Ensure Thailand Kitchen backend is running.";
      return Response.json(
        {
          success: false,
          data: null,
          error: {
            code: upstream.status === 401 ? "UNAUTHORIZED" : "UPLOAD_FAILED",
            message,
          },
        },
        { status: upstream.status || 502 }
      );
    }

    const file = {
      ...json.file,
      url: toAbsoluteUploadUrl(String(json.file.url)),
    };

    // Varsovia admin client expects envelope { success, data: { file } }
    return Response.json(
      { success: true, data: { file } },
      { status: upstream.status === 201 ? 201 : 200 }
    );
  } catch {
    return Response.json(
      {
        success: false,
        data: null,
        error: {
          code: "UPLOAD_FAILED",
          message:
            "Cannot reach Thailand Kitchen upload API. Start the backend on port 5000.",
        },
      },
      { status: 502 }
    );
  }
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!(await isAuthenticated(request))) {
    return Response.json(
      {
        message: "Sign in again to continue.",
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in again to continue.",
        },
      },
      { status: 401 }
    );
  }

  const { path = [] } = await context.params;
  if (!path.length || !ALLOWED_RESOURCES.has(path[0])) {
    return Response.json(
      { message: "Unsupported Varsovia resource" },
      { status: 404 }
    );
  }

  // Media: Thailand upload (Varsovia has no /api/media)
  if (path[0] === "media") {
    if (request.method.toUpperCase() !== "POST") {
      return Response.json({ message: "Method not allowed" }, { status: 405 });
    }
    return proxyMediaToThailand(request);
  }

  const adminKey = process.env.VARSOVIA_ADMIN_KEY?.trim() || "";
  if (!adminKey) {
    return Response.json(
      {
        message:
          "VARSOVIA_ADMIN_KEY is not configured. Add it to admin/.env.local — must match Varsovia backend ADMIN_KEY.",
      },
      { status: 503 }
    );
  }

  const method = request.method.toUpperCase();
  const isRead = method === "GET" || method === "HEAD";

  const safePath = path.map(encodeURIComponent).join("/");
  const target = new URL(`${apiBase()}/${safePath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });
  // Full multilingual CMS payloads
  if (isRead && !target.searchParams.has("cms")) {
    target.searchParams.set("cms", "1");
  }

  const headers = new Headers({ Accept: "application/json" });
  headers.set("x-admin-key", adminKey);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const body = isRead ? undefined : await request.arrayBuffer();
  const timeout = AbortSignal.timeout(90_000);

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: timeout,
    });
    const responseBody = await upstream.arrayBuffer();
    return new Response(responseBody, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    const targetHost = apiBase();
    const isLocal = /localhost|127\.0\.0\.1/i.test(targetHost);
    return Response.json(
      {
        message: isLocal
          ? `Cannot reach Varsovia API at ${targetHost}. Start the Varsovia backend and try again.`
          : "Cannot reach Varsovia API. The Render instance may still be waking up — try again.",
      },
      { status: 502 }
    );
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
