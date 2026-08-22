/**
 * Read the user's locale preference on the server (from cookies or headers).
 * Used by server components to render localized content.
 */
import { cookies, headers } from "next/headers";
import type { Locale } from "../i18n/translations";

const LOCALE_COOKIE = "tk-locale";

function isValidLocale(value: unknown): value is Locale {
  return value === "EN" || value === "TH" || value === "PL";
}

/**
 * Read locale from cookies (set by client) or Accept-Language header.
 * Defaults to EN.
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    // Try cookie first (user's explicit choice)
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE);
    if (localeCookie && isValidLocale(localeCookie.value)) {
      return localeCookie.value;
    }

    // Fallback to Accept-Language header
    const headersList = await headers();
    const acceptLang = headersList.get("accept-language");
    if (acceptLang) {
      if (acceptLang.toLowerCase().includes("th")) return "TH";
      if (acceptLang.toLowerCase().includes("pl")) return "PL";
    }
  } catch (error) {
    // If cookies/headers fail (e.g., in static generation), fall through
    console.warn("Could not read locale from server:", error);
  }

  return "EN";
}
