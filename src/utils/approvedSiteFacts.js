/**
 * Owner-approved public facts for Thailand Kitchens.
 * Frontend already sanitizes leftovers; CMS source must match these values.
 */

const { L } = require("./localized");

const CANONICAL_CONTACT_EMAIL = "hello@thailandkitchens.com";
const LEGACY_EMAIL_RE =
  /hello@\s*thaikitchen\.in|thailandkichens@gmail\.com/gi;

const APPROVED_CATALOGUE_EDITIONS = [
  {
    key: "minimal",
    title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
    category: L("Minimal", "มินิมอล", "Minimal"),
    image: "/catlog/catlog.png",
    fileName: "catalogue-minimal.pdf",
    downloadName: "Thailand-Kitchens-Catalogue-Minimal.pdf",
    sortOrder: 1,
  },
  {
    key: "classic",
    title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
    category: L("Classic", "คลาสสิก", "Klasyczny"),
    image: "/catlog/catlog (1).png",
    fileName: "catalogue-classic.pdf",
    downloadName: "Thailand-Kitchens-Catalogue-Classic.pdf",
    sortOrder: 2,
  },
  {
    key: "modern",
    title: L("2026 EDITION", "ฉบับ 2026", "EDYCJA 2026"),
    category: L("Modern", "โมเดิร์น", "Nowoczesny"),
    image: "/catlog/catlog (2).png",
    fileName: "catalogue-modern.pdf",
    downloadName: "Thailand-Kitchens-Catalogue-Modern.pdf",
    sortOrder: 3,
  },
];

const APPROVED_STATISTICS = {
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

const APPROVED_HERO_DESCRIPTION = L(
  "From custom cabinetry to complete kitchen transformations, we bring Thai craftsmanship to every home we design.",
  "ตั้งแต่ตู้ครัวสั่งทำไปจนถึงการเปลี่ยนโฉมครัวทั้งหลัง เรานำงานฝีมือไทยมาสู่ทุกบ้านที่เราออกแบบ",
  "Od zabudowy na wymiar po kompleksowe metamorfozy kuchni — wnosimy tajskie rzemiosło do każdego domu, który projektujemy."
);

const APPROVED_STORY_DESCRIPTION = L(
  "We have completed 25+ kitchens in our first year in Thailand. Each project teaches us something new about space, about people, and about what it means to feel at home.",
  "เราทำครัวครบกว่า 25 หลังในปีแรกในประเทศไทย แต่ละโปรเจกต์สอนเราเกี่ยวกับพื้นที่ ผู้คน และความหมายของการรู้สึกเหมือนบ้าน",
  "W pierwszym roku w Tajlandii ukończyliśmy ponad 25 kuchni. Każdy projekt uczy nas czegoś nowego o przestrzeni, ludziach i tym, co znaczy czuć się jak w domu."
);

const OVERCLAIM_RE =
  /decades|hundreds of kitchens|setki kuchni|หลายร้อย|ทศวรรษ|od dekad|over the years, we have designed hundreds/i;

function isOverclaimedCopy(value) {
  if (value == null) return false;
  if (typeof value === "string") return OVERCLAIM_RE.test(value);
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.values(value).some((entry) => isOverclaimedCopy(entry));
  }
  return false;
}

function replaceLegacyEmailsInString(text) {
  return String(text || "").replace(LEGACY_EMAIL_RE, CANONICAL_CONTACT_EMAIL);
}

function replaceLegacyEmailsDeep(value) {
  if (value == null) return value;
  if (typeof value === "string") return replaceLegacyEmailsInString(value);
  if (Array.isArray(value)) return value.map(replaceLegacyEmailsDeep);
  if (typeof value === "object") {
    const next = {};
    for (const [key, entry] of Object.entries(value)) {
      next[key] = replaceLegacyEmailsDeep(entry);
    }
    return next;
  }
  return value;
}

function editionKeyOf(item = {}) {
  const text = [
    item.editionKey,
    typeof item.category === "object"
      ? item.category.en || item.category.th || item.category.pl
      : item.category,
    typeof item.title === "object"
      ? item.title.en || item.title.th || item.title.pl
      : item.title,
    item.fileName,
    item.downloadName,
    item.pdfUrl,
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  if (text.includes("classic")) return "classic";
  if (text.includes("minimal")) return "minimal";
  if (text.includes("modern")) return "modern";
  return "";
}

function catalogueSeedItem(def, existing = {}) {
  return {
    title: existing.title || def.title,
    category: existing.category || def.category,
    image: String(existing.image || def.image || "").trim(),
    pdfUrl: String(existing.pdfUrl || "").trim(),
    fileName: String(existing.fileName || def.fileName || "").trim(),
    downloadName: String(
      existing.downloadName || def.downloadName || def.fileName || ""
    ).trim(),
    editionKey: def.key,
    locked: true,
    sortOrder: def.sortOrder,
  };
}

function lockApprovedCatalogues(items = [], defaults = []) {
  const source = Array.isArray(items) ? items : [];
  const seed =
    Array.isArray(defaults) && defaults.length
      ? defaults
      : APPROVED_CATALOGUE_EDITIONS.map((d) => catalogueSeedItem(d));
  const byKey = new Map();

  for (const item of source) {
    const key = editionKeyOf(item);
    if (!key || byKey.has(key)) continue;
    const def = APPROVED_CATALOGUE_EDITIONS.find((d) => d.key === key);
    if (!def) continue;
    byKey.set(key, catalogueSeedItem(def, item));
  }

  return APPROVED_CATALOGUE_EDITIONS.map((def) => {
    if (byKey.has(def.key)) return byKey.get(def.key);
    const fallback = seed.find((s) => editionKeyOf(s) === def.key) || {};
    return catalogueSeedItem(def, fallback);
  });
}

function isInflatedStatSet(items = []) {
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

function repairApprovedHomeFacts(sections = {}, defaults = {}) {
  const next = { ...(sections || {}) };
  let changed = false;

  if (isInflatedStatSet(next.statistics?.items)) {
    next.statistics = structuredClone(
      defaults.statistics || APPROVED_STATISTICS
    );
    changed = true;
  }

  if (isOverclaimedCopy(next.hero?.description)) {
    next.hero = {
      ...(next.hero || {}),
      description: structuredClone(
        defaults.hero?.description || APPROVED_HERO_DESCRIPTION
      ),
    };
    changed = true;
  }

  if (isOverclaimedCopy(next.story?.description)) {
    next.story = {
      ...(next.story || {}),
      description: structuredClone(
        defaults.story?.description || APPROVED_STORY_DESCRIPTION
      ),
    };
    changed = true;
  }

  const footerEmail = String(next.footer?.email || "").trim();
  if (!footerEmail || LEGACY_EMAIL_RE.test(footerEmail)) {
    next.footer = {
      ...(next.footer || {}),
      email: CANONICAL_CONTACT_EMAIL,
    };
    changed = true;
  }

  const lockedItems = lockApprovedCatalogues(
    next.catalogue?.items,
    defaults.catalogue?.items
  );
  const prevJson = JSON.stringify(next.catalogue?.items || []);
  const nextJson = JSON.stringify(lockedItems);
  if (prevJson !== nextJson) {
    next.catalogue = { ...(next.catalogue || {}), items: lockedItems };
    changed = true;
  }

  return { sections: replaceLegacyEmailsDeep(next), changed };
}

const GENERIC_FEATURE_TITLES = [
  "matte obsidian finish",
  "artisanal gold hardware",
  "imperial marble worktops",
];

function featureTitleEn(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value.en || value.th || value.pl || "")
      .trim()
      .toLowerCase();
  }
  return String(value || "").trim().toLowerCase();
}

function isGenericFeaturePack(highlights = []) {
  if (!Array.isArray(highlights) || !highlights.length) return false;
  const titles = highlights.map((h) => featureTitleEn(h?.title));
  return GENERIC_FEATURE_TITLES.every((expected) => titles.includes(expected));
}

function isMislabelledKitchenStock(url) {
  return /\/(products|product)\/Kitchen\d+\.png$/i.test(String(url || ""));
}

function isGenericBlogStock(url) {
  return /\/blog\/blogImage/i.test(String(url || ""));
}

module.exports = {
  CANONICAL_CONTACT_EMAIL,
  LEGACY_EMAIL_RE,
  APPROVED_CATALOGUE_EDITIONS,
  APPROVED_STATISTICS,
  APPROVED_HERO_DESCRIPTION,
  APPROVED_STORY_DESCRIPTION,
  isOverclaimedCopy,
  replaceLegacyEmailsInString,
  replaceLegacyEmailsDeep,
  editionKeyOf,
  lockApprovedCatalogues,
  isInflatedStatSet,
  repairApprovedHomeFacts,
  isGenericFeaturePack,
  isMislabelledKitchenStock,
  isGenericBlogStock,
};
