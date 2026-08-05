/**
 * Admin uploads often return same-origin paths like `/uploads/images/...`
 * (rewritten by Next to the Thailand Kitchen API). Varsovia's public site
 * cannot load those relative paths, so convert to an absolute URL before save.
 */

function mediaPublicBase(): string {
  return (
    process.env.NEXT_PUBLIC_UPLOAD_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
}

/** Extract `/uploads/...` from a relative or absolute URL. */
export function extractUploadsPath(url: string): string | null {
  const value = String(url || "").trim();
  if (!value) return null;
  const match = value.match(/\/uploads\/[^\s?#]*/i);
  return match ? match[0] : null;
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
    return true;
  }
  if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
  if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)) return true;
  return false;
}

export function toPublicMediaUrl(url: string): string {
  const value = String(url || "").trim();
  if (!value) return value;
  if (/^(data:|blob:)/i.test(value)) return value;

  const uploadsPath = extractUploadsPath(value);
  const configured = mediaPublicBase();

  // Always rewrite /uploads (and admin-origin absolutes) onto the Thailand API host.
  if (uploadsPath) {
    if (configured) return `${configured}${uploadsPath}`;
    // Prefer relative /uploads over admin :3001 — frontend can prefix MEDIA_BASE_URL.
    return uploadsPath;
  }

  if (/^(https?:)/i.test(value)) return value;
  if (!value.startsWith("/")) return value;

  if (configured) return `${configured}${value}`;

  const api = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (/^https?:\/\//i.test(api)) {
    try {
      return `${new URL(api).origin}${value}`;
    } catch {
      /* ignore */
    }
  }

  // Do NOT use window.location.origin — that becomes http://…:3001/uploads and
  // the live Varsovia site cannot load admin-origin media.
  return value;
}

export function isLocalOnlyMediaUrl(url: string): boolean {
  const value = String(url || "").trim();
  if (!value) return false;

  const uploadsPath = extractUploadsPath(value);
  const configured = mediaPublicBase();

  if (uploadsPath && !configured) return true;

  try {
    if (/^https?:\/\//i.test(value)) {
      const parsed = new URL(value);
      if (isPrivateHostname(parsed.hostname)) return true;
      if (parsed.port === "3001" && uploadsPath) return true;
    }
  } catch {
    /* ignore */
  }

  if (value.startsWith("/uploads/")) return true;
  const lower = value.toLowerCase();
  return (
    lower.includes("://localhost") ||
    lower.includes("://127.0.0.1") ||
    lower.includes("://0.0.0.0")
  );
}
