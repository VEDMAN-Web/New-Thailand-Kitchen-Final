import type { Locale, TranslationKey } from "../../i18n/translations";
import type { BlogPost } from "./blogData";

type Translate = (
  key: TranslationKey,
  vars?: Record<string, string | number>
) => string;

const CATEGORY_KEYS: Record<string, TranslationKey> = {
  "layout & space": "gallery.filter.layout",
  "layout and space": "gallery.filter.layout",
  storage: "gallery.filter.storage",
  "style & color": "gallery.filter.style",
  "style and color": "gallery.filter.style",
  materials: "gallery.filter.materials",
  "kitchen design trends": "blog.category.trends",
  "design trends": "blog.category.trends",
  "kitchen care": "blog.category.care",
  home: "blog.category.home",
  craftsmanship: "blog.category.craftsmanship",
  "material guides": "blog.category.materialGuides",
  lifestyle: "blog.category.lifestyle",
  journal: "blog.category.journal",
};

const DATE_LOCALES: Record<Locale, string> = {
  EN: "en-US",
  TH: "th-TH",
  PL: "pl-PL",
};

/** Translate a CMS category when we recognise it, else show it as authored. */
export function blogCategoryLabel(category: string, t: Translate) {
  const key = CATEGORY_KEYS[String(category || "").trim().toLowerCase()];
  return key ? t(key) : category;
}

export function formatBlogDate(
  post: { date: string; dateISO?: string; updatedISO?: string },
  locale: Locale
) {
  if (!post.dateISO) return post.date;

  const parsedPublished = new Date(post.dateISO);
  if (Number.isNaN(parsedPublished.getTime())) return post.date;

  const published = parsedPublished
    .toLocaleDateString(DATE_LOCALES[locale], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  if (!post.updatedISO) return published;

  const parsedUpdated = new Date(post.updatedISO);
  if (Number.isNaN(parsedUpdated.getTime())) return published;

  const updated = parsedUpdated
    .toLocaleDateString(DATE_LOCALES[locale], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  // Keep label short and consistent with existing uppercase date styling.
  return `${published} · UPDATED ${updated}`;
}

export function formatReadTime(readTime: string, t: Translate) {
  const minutes = String(readTime || "").match(/\d+/)?.[0];
  return minutes ? t("blog.minRead", { count: minutes }) : readTime;
}

/**
 * Apply the admin-authored Thai/Polish copy for a post.
 * Any field the admin left blank keeps its English value.
 */
export function localizePost(post: BlogPost, locale: Locale): BlogPost {
  if (locale === "EN") return post;

  const translated = post.translations?.[locale === "TH" ? "th" : "pl"];
  if (!translated) return post;

  return {
    ...post,
    title: translated.title || post.title,
    excerpt: translated.excerpt || post.excerpt,
    category: translated.category || post.category,
    subsectionTitle: translated.subsectionTitle || post.subsectionTitle,
    highlightText: translated.highlightText || post.highlightText,
    quote: translated.quote || post.quote,
    quoteAuthor: translated.quoteAuthor || post.quoteAuthor,
    content: translated.content?.length ? translated.content : post.content,
    bodySections:
      translated.bodySections?.length
        ? translated.bodySections
        : post.bodySections,
  };
}
