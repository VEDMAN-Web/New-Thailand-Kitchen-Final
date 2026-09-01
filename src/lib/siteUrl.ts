import { resolveCmsMediaUrl } from "./cmsMedia";

/** Canonical public site origin — keep in sync across sitemap, robots, JSON-LD, canonicals. */
export const SITE_ORIGIN = "https://www.thailandkitchens.com";

/** Site-wide fallback share image, used whenever a page has no CMS image of its own. */
export const DEFAULT_OG_IMAGE = "/products/Kitchen1.png";

export function absoluteUrl(path: string): string {
  const clean = String(path || "").startsWith("/")
    ? String(path)
    : `/${String(path || "")}`;
  if (clean === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${clean.replace(/\/+$/, "")}`;
}

/**
 * Resolve a (possibly relative/CMS-relative) image path into an absolute URL
 * suitable for Open Graph / Twitter Card tags — social crawlers (WhatsApp,
 * Facebook, X, etc.) require a fully-qualified URL, relative paths are ignored.
 */
export function ogImageUrl(path?: string | null, fallback = DEFAULT_OG_IMAGE): string {
  const resolved = resolveCmsMediaUrl(path, fallback) || fallback;
  return /^https?:\/\//i.test(resolved) ? resolved : absoluteUrl(resolved);
}
