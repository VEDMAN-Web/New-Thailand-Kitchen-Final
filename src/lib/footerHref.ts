/** Normalize CMS footer/nav hrefs so admin values navigate exactly as saved. */

export function hrefFromCms(raw: unknown): string {
  if (typeof raw === "string") return raw.trim();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const map = raw as Partial<Record<"en" | "th" | "pl", unknown>>;
    for (const key of ["en", "th", "pl"] as const) {
      if (typeof map[key] === "string" && map[key]!.trim()) {
        return map[key]!.trim();
      }
    }
  }
  return "";
}

export function isExternalHref(href: string): boolean {
  return /^(https?:\/\/|mailto:|tel:|sms:|whatsapp:)/i.test(href) || href.startsWith("//");
}

/** Page path, in-page hash, or full URL — never `[object Object]`. */
export function normalizeFooterHref(raw: unknown): string {
  const href = hrefFromCms(raw);
  if (!href || href === "[object Object]") return "";
  if (isExternalHref(href) || href.startsWith("/") || href.startsWith("#")) {
    return href;
  }
  return `/${href.replace(/^\/+/, "")}`;
}
