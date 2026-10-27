import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "www.thailandkitchens.com";

function isLocalOrPreviewHost(host: string) {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".vercel.app")
  );
}

/**
 * Collapse every public host onto https://www.thailandkitchens.com
 * in a single 301 hop, preserving path and query.
 */
const LOCALE_HEADER = "x-tk-url-locale";
const URL_LOCALES: Record<string, "PL" | "TH"> = { pl: "PL", th: "TH" };

/**
 * DEV-02: serve /pl/<path> and /th/<path> by rewriting to /<path> and passing
 * the locale in a request header (read by src/lib/urlLocale.ts).
 */
function localeRewrite(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(pl|th)(\/.*)?$/);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(LOCALE_HEADER);
  if (!match) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  requestHeaders.set(LOCALE_HEADER, URL_LOCALES[match[1]]);
  const url = request.nextUrl.clone();
  url.pathname = match[2] || "/";
  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
  // Not indexable until PL/TH translations exist (TODO DEV-02).
  response.headers.set("X-Robots-Tag", "noindex, follow");
  return response;
}

export function proxy(request: NextRequest) {
  const headerHost = request.headers.get("host") || "";
  const host = headerHost.split(":")[0]?.toLowerCase() || "";

  if (!host || isLocalOrPreviewHost(host)) {
    return localeRewrite(request);
  }

  if (host === CANONICAL_HOST) {
    return localeRewrite(request);
  }

  if (host === "thailandkitchens.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return localeRewrite(request);
}

export const config = {
  // Skip static assets (anything with a file extension) so Turbopack does not
  // run the host-redirect proxy on images/fonts/css during local navigation.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\..*).*)",
  ],
};
