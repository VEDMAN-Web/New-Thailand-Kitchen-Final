/** Canonical public site origin — keep in sync across sitemap, robots, JSON-LD, canonicals. */
export const SITE_ORIGIN = "https://thailandkitchens.com";

export function absoluteUrl(path: string): string {
  const clean = String(path || "").startsWith("/")
    ? String(path)
    : `/${String(path || "")}`;
  if (clean === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${clean.replace(/\/+$/, "")}`;
}
