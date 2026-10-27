import type { Metadata } from "next";
import { absoluteUrl, ogImageUrl } from "./siteUrl";
import { getUrlLocale, localePath } from "./urlLocale";

/** Canonical public language for un-prefixed thailandkitchens.com URLs. */
export const SITE_SEO_LOCALE = "EN" as const;
export const SITE_HTML_LANG = "en";
export const SITE_OG_LOCALE = "en_US";

// TODO(seo P0-3, waiting on client): confirm hi@ vs hello@ as the one public address.
export const CANONICAL_CONTACT_EMAIL = "hello@thailandkitchens.com";
export const CANONICAL_PHONE = "+66 99 359 6916";
export const VERIFIED_AREA_SERVED = "Pattaya & Koh Samui, Thailand";
export const SAMUI_KITCHENS_ORIGIN = "https://www.samuikitchens.com";

export function isSamuiLocation(slug: string, title = ""): boolean {
  return /samui|koh[\s-]?samui|ko[\s-]?samui/i.test(`${slug} ${title}`);
}

export function publicContactEmail(value?: string): string {
  const email = String(value || "").trim();
  if (
    !email ||
    /thaikitchen\.in|thailandkichens@gmail|hi@thailandkitchens/i.test(email)
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
 * Self-referencing canonical plus reciprocal en / pl / th / x-default hreflang
 * (DEV-02). On /pl/... and /th/... requests the canonical is the prefixed URL.
 */
export async function seoAlternates(path: string) {
  const urlLocale = await getUrlLocale();
  const en = absoluteUrl(path);
  const pl = absoluteUrl(localePath(path, "PL"));
  const th = absoluteUrl(localePath(path, "TH"));
  return {
    canonical: urlLocale === "PL" ? pl : urlLocale === "TH" ? th : en,
    languages: {
      en,
      pl,
      th,
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
