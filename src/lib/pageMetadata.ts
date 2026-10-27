import type { Metadata } from "next";
import { absoluteUrl, ogImageUrl } from "./siteUrl";
import { getUrlLocale, localePath } from "./urlLocale";

/** Canonical public language for un-prefixed thailandkitchens.com URLs. */
export const SITE_SEO_LOCALE = "EN" as const;
export const SITE_HTML_LANG = "en";
export const SITE_OG_LOCALE = "en_US";

/** SEO P0-1: homepage EN title/description (code fallback for empty CMS fields). */
export const HOMEPAGE_SEO_TITLE =
  "Custom Kitchens & Cabinets in Thailand | Thailand Kitchens";
export const HOMEPAGE_SEO_DESCRIPTION =
  "Made-to-measure kitchens, cabinetry and built-in furniture for villas, condos and homes in Pattaya, Koh Samui and across Thailand. Book a design consult.";

/** Treat the legacy CMS placeholder "Thailand Kitchens Website" as empty. */
export function withoutSeoPlaceholder(value: string, fallback: string): string {
  const v = String(value || "").trim();
  return !v || /^thailand kitchens website$/i.test(v) ? fallback : v;
}

// SEO P0-3: the single confirmed public contact address.
export const CANONICAL_CONTACT_EMAIL = "hi@thailandkitchens.com";
export const VERIFIED_AREA_SERVED = "Pattaya & Koh Samui, Thailand";
export const SAMUI_KITCHENS_ORIGIN = "https://www.samuikitchens.com";

export function isSamuiLocation(slug: string, title = ""): boolean {
  return /samui|koh[\s-]?samui|ko[\s-]?samui/i.test(`${slug} ${title}`);
}

export function publicContactEmail(value?: string): string {
  const email = String(value || "").trim();
  if (
    !email ||
    /thaikitchen\.in|thailandkichens@gmail|hello@thailandkitchens/i.test(email)
  ) {
    return CANONICAL_CONTACT_EMAIL;
  }
  return email;
}

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

/**
 * Self-referencing canonical with en + x-default hreflang. /pl and /th routes
 * exist (DEV-02) but are noindex and NOT advertised in hreflang or the sitemap
 * until PL/TH metadata and localized internal links exist.
 * TODO(DEV-02): add pl/th alternates once translations ship.
 */
export async function seoAlternates(path: string) {
  const urlLocale = await getUrlLocale();
  const en = absoluteUrl(path);
  return {
    canonical: urlLocale ? absoluteUrl(localePath(path, urlLocale)) : en,
    languages: {
      en,
      "x-default": en,
    },
  };
}

export async function pageSeo({
  title,
  description,
  path,
  image,
}: PageSeoInput): Promise<Metadata> {
  const canonical = absoluteUrl(path);
  const ogImage = ogImageUrl(image);

  return {
    title,
    description,
    alternates: await seoAlternates(path),
    openGraph: {
      type: "website",
      siteName: "Thailand Kitchens",
      title,
      description,
      url: canonical,
      locale: SITE_OG_LOCALE,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Use a real project photo for LocalBusiness, not the favicon/icon. */
export function localBusinessImage(heroOrOg?: string | null): string {
  return ogImageUrl(heroOrOg);
}

export function verifiedAreaServed(value: string): string {
  const text = String(value || "").trim();
  if (!text) return VERIFIED_AREA_SERVED;
  if (/gujarat|surat|india/i.test(text)) return VERIFIED_AREA_SERVED;
  return text;
}

export function isOverclaimedBusinessCopy(text: string): boolean {
  return /decades|hundreds of kitchens|setki kuchni|หลายร้อย|ทศวรรษ|od dekad|over the years, we have designed hundreds/i.test(
    String(text || "")
  );
}

export function approvedCmsText(
  cmsValue: unknown,
  fallback: string,
  locale: "EN" | "TH" | "PL",
  pick: (value: unknown, fallback: string, locale: "EN" | "TH" | "PL") => string
): string {
  const text = pick(cmsValue, fallback, locale);
  return isOverclaimedBusinessCopy(text) ? fallback : text;
}
