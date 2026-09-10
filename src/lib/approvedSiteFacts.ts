/** Owner-approved public facts. Keep in sync with backend src/utils/approvedSiteFacts.js */

export const CANONICAL_CONTACT_EMAIL = "hello@thailandkitchens.com";

const LEGACY_EMAIL_RE =
  /hello@\s*thaikitchen\.in|thailandkichens@gmail\.com/gi;

export const APPROVED_STATISTICS = {
  items: [
    {
      label: {
        en: "Years Of Experience",
        th: "ปีแห่งประสบการณ์",
        pl: "Lat doświadczenia",
      },
      value: "1",
      suffix: "+",
    },
    {
      label: {
        en: "City in Thailand",
        th: "เมืองในประเทศไทย",
        pl: "Miasto w Tajlandii",
      },
      value: "1",
      suffix: "",
    },
    {
      label: {
        en: "Kitchens Completed",
        th: "ครัวที่เสร็จสมบูรณ์",
        pl: "Ukończonych kuchni",
      },
      value: "25",
      suffix: "+",
    },
  ],
};

export const APPROVED_HERO_DESCRIPTION = {
  en: "From custom cabinetry to complete kitchen transformations, we bring Thai craftsmanship to every home we design.",
  th: "ตั้งแต่ตู้ครัวสั่งทำไปจนถึงการเปลี่ยนโฉมครัวทั้งหลัง เรานำงานฝีมือไทยมาสู่ทุกบ้านที่เราออกแบบ",
  pl: "Od zabudowy na wymiar po kompleksowe metamorfozy kuchni — wnosimy tajskie rzemiosło do każdego domu, który projektujemy.",
};

export const APPROVED_STORY_DESCRIPTION = {
  en: "We have completed 25+ kitchens in our first year in Thailand. Each project teaches us something new about space, about people, and about what it means to feel at home.",
  th: "เราทำครัวครบกว่า 25 หลังในปีแรกในประเทศไทย แต่ละโปรเจกต์สอนเราเกี่ยวกับพื้นที่ ผู้คน และความหมายของการรู้สึกเหมือนบ้าน",
  pl: "W pierwszym roku w Tajlandii ukończyliśmy ponad 25 kuchni. Każdy projekt uczy nas czegoś nowego o przestrzeni, ludziach i tym, co znaczy czuć się jak w domu.",
};

const OVERCLAIM_RE =
  /decades|hundreds of kitchens|setki kuchni|หลายร้อย|ทศวรรษ|od dekad|over the years, we have designed hundreds/i;

const GENERIC_FEATURE_TITLES = [
  "matte obsidian finish",
  "artisanal gold hardware",
  "imperial marble worktops",
];

export function isOverclaimedCopy(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return OVERCLAIM_RE.test(value);
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value as Record<string, unknown>).some((entry) =>
      isOverclaimedCopy(entry)
    );
  }
  return false;
}

export function sanitizeFooterEmail(value: string) {
  const next = String(value || "").trim();
  if (!next || LEGACY_EMAIL_RE.test(next)) return CANONICAL_CONTACT_EMAIL;
  return next;
}

export function replaceLegacyEmailsInString(text: string) {
  return String(text || "").replace(LEGACY_EMAIL_RE, CANONICAL_CONTACT_EMAIL);
}

export function replaceLegacyEmailsDeep<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") return replaceLegacyEmailsInString(value) as T;
  if (Array.isArray(value)) {
    return value.map((entry) => replaceLegacyEmailsDeep(entry)) as T;
  }
  if (typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      next[key] = replaceLegacyEmailsDeep(entry);
    }
    return next as T;
  }
  return value;
}

export function isInflatedStatSet(items: any[] = []) {
  if (!Array.isArray(items) || items.length < 3) return true;
  const values = items.map((it) =>
    parseInt(String(it?.value || "").replace(/[^\d]/g, ""), 10)
  );
  const [years, cities, kitchens] = values;
  if (!Number.isFinite(years) || years > 1) return true;
  if (!Number.isFinite(cities) || cities > 1) return true;
  if (!Number.isFinite(kitchens) || kitchens > 25) return true;
  return false;
}

export function isMislabelledKitchenStock(url: string) {
  return /\/(products|product)\/Kitchen\d+\.png$/i.test(String(url || ""));
}

export function isGenericBlogStock(url: string) {
  return /\/blog\/blogImage/i.test(String(url || ""));
}

export function isUnusableGuideOrMediaImage(url: string) {
  return isMislabelledKitchenStock(url) || isGenericBlogStock(url);
}

function featureTitleEn(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return String(obj.en || obj.th || obj.pl || "")
      .trim()
      .toLowerCase();
  }
  return String(value || "").trim().toLowerCase();
}

export function isGenericFeaturePack(highlights: any[] = []) {
  if (!Array.isArray(highlights) || !highlights.length) return false;
  const titles = highlights.map((h) => featureTitleEn(h?.title));
  return GENERIC_FEATURE_TITLES.every((expected) => titles.includes(expected));
}

export function lockCatalogueItems(items: any[] = []) {
  const keys = ["minimal", "classic", "modern"] as const;
  const byKey = new Map<string, any>();
  for (const item of items) {
    const blob = [
      item?.editionKey,
      item?.category?.en || item?.category,
      item?.title?.en || item?.title,
      item?.fileName,
      item?.downloadName,
    ]
      .map((v) => String(v || "").toLowerCase())
      .join(" ");
    const key = blob.includes("classic")
      ? "classic"
      : blob.includes("minimal")
        ? "minimal"
        : blob.includes("modern")
          ? "modern"
          : "";
    if (key && !byKey.has(key)) byKey.set(key, { ...item, editionKey: key, locked: true });
  }
  return keys.map((key, i) => {
    const existing = byKey.get(key) || items[i] || {};
    return {
      title: existing.title || "2026 EDITION",
      category:
        existing.category ||
        (key === "minimal" ? "Minimal" : key === "classic" ? "Classic" : "Modern"),
      image: existing.image || "",
      pdfUrl: existing.pdfUrl || "",
      fileName: existing.fileName || `catalogue-${key}.pdf`,
      downloadName:
        existing.downloadName ||
        `Thailand-Kitchens-Catalogue-${key[0].toUpperCase()}${key.slice(1)}.pdf`,
      editionKey: key,
      locked: true,
    };
  });
}

/** Normalize home CMS so admin always shows approved source data. */
export function applyApprovedHomeFacts(sections: Record<string, any> = {}) {
  const next = { ...(sections || {}) };

  if (isInflatedStatSet(next.statistics?.items)) {
    next.statistics = structuredClone(APPROVED_STATISTICS);
  }

  if (isOverclaimedCopy(next.hero?.description)) {
    next.hero = {
      ...(next.hero || {}),
      description: structuredClone(APPROVED_HERO_DESCRIPTION),
    };
  }

  if (isOverclaimedCopy(next.story?.description)) {
    next.story = {
      ...(next.story || {}),
      description: structuredClone(APPROVED_STORY_DESCRIPTION),
    };
  }

  next.footer = {
    ...(next.footer || {}),
    email: sanitizeFooterEmail(String(next.footer?.email || "")),
  };

  next.catalogue = {
    ...(next.catalogue || {}),
    items: lockCatalogueItems(next.catalogue?.items || []),
  };

  return replaceLegacyEmailsDeep(next);
}

export function stripKitchenStockFromCategoryDraft(draft: {
  slug?: string;
  image?: string;
  sections?: Array<{ image?: string; [key: string]: unknown }>;
}) {
  const slug = String(draft.slug || "").toLowerCase();
  if (slug !== "entertainment-units") return draft;
  const next = { ...draft };
  if (isMislabelledKitchenStock(String(next.image || ""))) next.image = "";
  if (Array.isArray(next.sections)) {
    next.sections = next.sections.map((section) =>
      isMislabelledKitchenStock(String(section?.image || ""))
        ? { ...section, image: "" }
        : section
    );
  }
  return next;
}

export function stripUnrelatedBlogStockFromDraft(draft: {
  image?: string;
  gallery1?: string;
  gallery2?: string;
  bodySections?: Array<{ image?: string; [key: string]: unknown }>;
}) {
  const next = { ...draft };
  if (isUnusableGuideOrMediaImage(String(next.image || ""))) next.image = "";
  if (isUnusableGuideOrMediaImage(String(next.gallery1 || ""))) next.gallery1 = "";
  if (isUnusableGuideOrMediaImage(String(next.gallery2 || ""))) next.gallery2 = "";
  if (Array.isArray(next.bodySections)) {
    next.bodySections = next.bodySections.map((section) =>
      isUnusableGuideOrMediaImage(String(section?.image || ""))
        ? { ...section, image: "" }
        : section
    );
  }
  return next;
}
