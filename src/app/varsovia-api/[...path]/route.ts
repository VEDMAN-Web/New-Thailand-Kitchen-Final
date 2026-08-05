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

async function isAuthenticated(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return false;

  try {
    const response = await fetch(`${thailandBase()}/auth/me`, {
      headers: { authorization },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!(await isAuthenticated(request))) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const method = request.method.toUpperCase();
  const isRead = method === "GET" || method === "HEAD";

  // Server-side only — same pattern as Thailand Kitchen (no UI key prompt).
  const adminKey = process.env.VARSOVIA_ADMIN_KEY?.trim() || "";
  if (!adminKey && !isRead) {
    return Response.json(
      {
        message:
          "VARSOVIA_ADMIN_KEY is not configured on the admin server. Add it to admin/.env.local (must match Varsovia backend ADMIN_KEY).",
      },
      { status: 503 }
    );
  }

  const { path = [] } = await context.params;
  if (!path.length || !ALLOWED_RESOURCES.has(path[0])) {
    return Response.json(
      { message: "Unsupported Varsovia resource" },
      { status: 404 }
    );
  }

  const safePath = path.map(encodeURIComponent).join("/");
  const target = new URL(`${apiBase()}/${safePath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  const headers = new Headers({ Accept: "application/json" });
  if (adminKey) headers.set("x-admin-key", adminKey);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const body = isRead ? undefined : await request.arrayBuffer();

  // Render free instances cold start slowly; allow a long first request
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
    const target = apiBase();
    const isLocal = /localhost|127\.0\.0\.1/i.test(target);
    return Response.json(
      {
        message: isLocal
          ? `Cannot reach Varsovia API at ${target}. Start the Varsovia backend (port 5001) and try again.`
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
