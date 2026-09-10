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
export function proxy(request: NextRequest) {
  const headerHost = request.headers.get("host") || "";
  const host = headerHost.split(":")[0]?.toLowerCase() || "";

  if (!host || isLocalOrPreviewHost(host)) {
    return NextResponse.next();
  }

  if (host === CANONICAL_HOST) {
    return NextResponse.next();
  }

  if (host === "thailandkitchens.com") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets (anything with a file extension) so Turbopack does not
  // run the host-redirect proxy on images/fonts/css during local navigation.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\..*).*)",
  ],
};
