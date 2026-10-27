/**
 * SEO P1-1 / DEV-02: locale-prefixed URLs (/pl/..., /th/...).
 * src/proxy.ts rewrites /pl/<path> and /th/<path> to /<path> and passes the
 * locale in the LOCALE_HEADER request header.
 */
import { headers } from "next/headers";
import type { Locale } from "../i18n/translations";

export const LOCALE_HEADER = "x-tk-url-locale";
export const URL_LOCALE_PREFIXES = { PL: "/pl", TH: "/th" } as const;

/** Locale from the URL prefix, or null for un-prefixed (English) URLs. */
export async function getUrlLocale(): Promise<Exclude<Locale, "EN"> | null> {
  try {
    const value = (await headers()).get(LOCALE_HEADER);
    return value === "PL" || value === "TH" ? value : null;
  } catch {
    return null;
  }
}

export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === "EN") return clean;
  const prefix = URL_LOCALE_PREFIXES[locale];
  return clean === "/" ? prefix : `${prefix}${clean}`;
}
