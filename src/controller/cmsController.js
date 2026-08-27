const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const {
  SITE_IDS,
  HomePage,
  Category,
  Product,
  Blog,
  LegalPage,
  GalleryItem,
  CatalogueItem,
  FaqItem,
} = require("../model/cmsModels");

const SITES = [
  { id: "thailand-kitchen", name: "Thailand Kitchen", enabled: true },
  { id: "varsovia-kitchen", name: "Varsovia Kitchen", enabled: true },
];

const {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_FEATURE_HIGHLIGHTS,
  DEFAULT_FAQS,
  DEFAULT_CATEGORIES,
} = require("../seed/thailandSiteDefaults");

function assertSite(siteId) {
  return SITE_IDS.includes(siteId);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reserved so /products/[slug] category tabs are never stolen by a product slug. */
const RESERVED_PRODUCT_SLUGS = new Set([
  "all",
  "best-seller",
  "bestseller",
  "modern",
  "islands",
  "u-shape",
  "l-shape",
  "straight",
  "t-shape",
]);

async function assertProductSlugAvailable(siteId, slug, excludeId = null) {
  const normalized = String(slug || "").trim().toLowerCase();
  if (!normalized) {
    return { ok: false, message: "Title and slug are required" };
  }
  if (RESERVED_PRODUCT_SLUGS.has(normalized)) {
    return {
      ok: false,
      message: `Slug "${normalized}" is reserved for a product category tab. Choose another slug.`,
    };
  }
  const categoryHit = await Category.findOne({ siteId, slug: normalized }).select("_id");
  if (categoryHit) {
    return {
      ok: false,
      message: `Slug "${normalized}" is already used by a category. Choose another slug.`,
    };
  }
  const query = { siteId, slug: normalized };
  if (excludeId) query._id = { $ne: excludeId };
  const productHit = await Product.findOne(query).select("_id");
  if (productHit) {
    return {
      ok: false,
      message: `Slug "${normalized}" is already used by another product.`,
    };
  }
  return { ok: true };
}

/** Website product seed — keeps admin + public site in sync */
const DEFAULT_PRODUCTS = [
  {
    title: "Obsidian Bay",
    slug: "obsidian-bay",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Obsidian Bay pairs matte dark cabinetry with warm timber undertones â€” a quiet, gallery-like presence designed for open-plan living and island entertaining.",
    image: "/products/Kitchen1.png",
    gallery: ["/product/product.png", "/products/Kitchen1.png", "/products/Kitchen2.png"],
    category: "Islands",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Pearl Harbor",
    slug: "pearl-harbor",
    subtitle: "Straight layout",
    productType: "Straight",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen3.png", "/products/Kitchen4.png"],
    category: "Straight",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Teak Atelier",
    slug: "teak-atelier",
    subtitle: "L Shape layout",
    productType: "L Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen3.png", "/products/Kitchen1.png", "/products/Kitchen6.png"],
    category: "L Shape",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Midnight Gallery",
    slug: "midnight-gallery",
    subtitle: "U Shape layout",
    productType: "U Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen4.png",
    gallery: ["/products/Kitchen4.png", "/products/Kitchen5.png", "/products/Kitchen2.png"],
    category: "U Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Soft Horizon",
    slug: "soft-horizon",
    subtitle: "Island layout",
    productType: "Modern",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen5.png",
    gallery: ["/products/Kitchen5.png", "/products/Kitchen6.png", "/products/Kitchen1.png"],
    category: "Modern",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Coastal Line",
    slug: "coastal-line",
    subtitle: "T Shape layout",
    productType: "T Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen6.png",
    gallery: ["/products/Kitchen6.png", "/products/Kitchen2.png", "/products/Kitchen3.png"],
    category: "T Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Amber Court",
    slug: "amber-court",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen1.png",
    gallery: ["/products/Kitchen1.png", "/products/Kitchen2.png", "/products/Kitchen3.png"],
    category: "Islands",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Nova Kitchen",
    slug: "nova-kitchen",
    subtitle: "Straight layout",
    productType: "Modern",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen3.png", "/products/Kitchen4.png"],
    category: "Modern",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Heritage Wing",
    slug: "heritage-wing",
    subtitle: "U Shape layout",
    productType: "U Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen3.png", "/products/Kitchen4.png", "/products/Kitchen5.png"],
    category: "U Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Calm Studio",
    slug: "calm-studio",
    subtitle: "L Shape layout",
    productType: "L Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen4.png",
    gallery: ["/products/Kitchen4.png", "/products/Kitchen5.png", "/products/Kitchen6.png"],
    category: "L Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Shadow Ridge",
    slug: "shadow-ridge",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen5.png",
    gallery: ["/products/Kitchen5.png", "/products/Kitchen6.png", "/products/Kitchen1.png"],
    category: "Islands",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Linen Bay",
    slug: "linen-bay",
    subtitle: "Straight layout",
    productType: "Straight",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface â€” a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen6.png",
    gallery: ["/products/Kitchen6.png", "/products/Kitchen1.png", "/products/Kitchen2.png"],
    category: "Straight",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
];

async function ensureDefaultProducts(siteId) {
  const count = await Product.countDocuments({ siteId });
  if (count === 0) {
    const { syncProductsMissingOnly } = require("../scripts/syncProductsSafe");
    await syncProductsMissingOnly(siteId, DEFAULT_PRODUCTS, DEFAULT_FEATURE_HIGHLIGHTS);
  }

  const existing = await Product.find({ siteId }).select("slug image featureHighlights gallery").lean();
  if (!existing.length) return;

  // Backfill empty Features & Details for products created before highlights existed
  const needsHighlights = existing.filter((p) => {
    const highlights = Array.isArray(p.featureHighlights) ? p.featureHighlights : [];
    return !highlights.some((h) => String(h?.title || "").trim() || String(h?.description || "").trim());
  });
  if (needsHighlights.length) {
    await Product.updateMany(
      { _id: { $in: needsHighlights.map((p) => p._id) } },
      { $set: { featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS } }
    );
  }

  // Ensure each product has at least two gallery images for the Features side panel
  const needsGallery = existing.filter((p) => !Array.isArray(p.gallery) || p.gallery.length < 2);
  for (const product of needsGallery) {
    const seed = DEFAULT_PRODUCTS.find(
      (p) => String(p.slug).toLowerCase() === String(product.slug || "").toLowerCase()
    );
    const gallery =
      seed?.gallery?.length >= 2
        ? seed.gallery
        : [product.image || "/products/Kitchen1.png", "/products/Kitchen2.png"].filter(Boolean);
    await Product.updateOne({ _id: product._id }, { $set: { gallery } });
  }
}

/** Website gallery seed â€” keeps admin + public gallery in sync */
const DEFAULT_GALLERY = [
  {
    title: "Obsidian Island",
    image: "/products/Kitchen1.png",
    filter: "Layout & Space",
    tall: true,
    wide: false,
    sortOrder: 1,
  },
  {
    title: "Pearl Straight",
    image: "/products/Kitchen2.png",
    filter: "Style & Color",
    tall: false,
    wide: false,
    sortOrder: 2,
  },
  {
    title: "Tailored Corner",
    image: "/features/image.png",
    filter: "Storage",
    tall: false,
    wide: false,
    sortOrder: 3,
  },
  {
    title: "Midnight Gallery",
    image: "/products/Kitchen4.png",
    filter: "Materials",
    tall: true,
    wide: false,
    sortOrder: 4,
  },
  {
    title: "Soft Horizon",
    image: "/catlog/catlog.png",
    filter: "Style & Color",
    tall: false,
    wide: false,
    sortOrder: 5,
  },
  {
    title: "Warm Atelier",
    image: "/products/Kitchen3.png",
    filter: "Materials",
    tall: false,
    wide: false,
    sortOrder: 6,
  },
  {
    title: "Quiet Living",
    image: "/features/image3.png",
    filter: "Layout & Space",
    tall: true,
    wide: false,
    sortOrder: 7,
  },
];

async function ensureDefaultGallery(siteId) {
  const count = await GalleryItem.countDocuments({ siteId });
  if (count > 0) return;

  await GalleryItem.insertMany(
    DEFAULT_GALLERY.map((g) => ({
      siteId,
      title: g.title,
      image: g.image,
      filter: g.filter,
      tall: Boolean(g.tall),
      wide: Boolean(g.wide),
      sortOrder: Number(g.sortOrder) || 0,
    }))
  );
}

async function ensureDefaultFaqs(siteId) {
  const count = await FaqItem.countDocuments({ siteId });
  if (count > 0) return;
  const { syncFaqsMissingOnly } = require("../scripts/syncFaqsSafe");
  await syncFaqsMissingOnly(siteId, DEFAULT_FAQS);
}

const taxonomyRepaired = new Set();
const localesRepaired = new Set();

async function ensureDefaultCategories(siteId) {
  const { repairThailandTaxonomy } = require("../scripts/repairThailandTaxonomyLib");
  const count = await Category.countDocuments({ siteId });
  if (count === 0) {
    await repairThailandTaxonomy(siteId);
    taxonomyRepaired.add(siteId);
  } else if (!taxonomyRepaired.has(siteId)) {
    taxonomyRepaired.add(siteId);
  }
}

/**
 * Fill incomplete home sections from site defaults so admin shows full live content.
 * Never wipes custom hero/story text — only expands thin arrays / missing keys.
 */
function enrichHomeSections(sections) {
  const defaults = structuredClone(DEFAULT_HOME_SECTIONS);
  const next = { ...sections };

  if (!next.testimonials || !Array.isArray(next.testimonials.items)) {
    next.testimonials = { items: defaults.testimonials.items };
  }
  if (!next.faq || !Array.isArray(next.faq.items)) {
    next.faq = { items: defaults.faq.items };
  }
  if (!next.catalogue || !Array.isArray(next.catalogue.items)) {
    next.catalogue = { items: defaults.catalogue.items };
  }
  if (!next.advantages || !Array.isArray(next.advantages.items)) {
    next.advantages = { items: defaults.advantages.items };
  }
  if (!next.transition || !Array.isArray(next.transition.pillars)) {
    next.transition = { pillars: defaults.transition.pillars };
  }
  if (!next.statistics || !Array.isArray(next.statistics.items)) {
    next.statistics = { items: defaults.statistics.items };
  }
  if (
    !next.partners ||
    !Array.isArray(next.partners.logos) ||
    next.partners.logos.filter((l) => l && String(l.image || l.logo || "").trim())
      .length === 0
  ) {
    next.partners = { logos: defaults.partners.logos };
  }
  if (!next.productsPage) {
    next.productsPage = defaults.productsPage;
  }
  if (!next.galleryPage) {
    next.galleryPage = defaults.galleryPage;
  }
  if (!next.blogPage) {
    next.blogPage = defaults.blogPage;
  }
  if (!next.faqPage) {
    next.faqPage = defaults.faqPage;
  }
  if (!next.homeContact) {
    next.homeContact = defaults.homeContact;
  }
  if (!next.contactPage) {
    next.contactPage = defaults.contactPage;
  }
  if (!next.hubPages) {
    next.hubPages = defaults.hubPages;
  } else {
    next.hubPages = { ...defaults.hubPages, ...next.hubPages };
    for (const key of Object.keys(defaults.hubPages)) {
      if (!next.hubPages[key]) {
        next.hubPages[key] = defaults.hubPages[key];
      } else if (key === "kitchens" && defaults.hubPages.kitchens?.subsections) {
        next.hubPages.kitchens = {
          ...defaults.hubPages.kitchens,
          ...next.hubPages.kitchens,
          subsections: {
            ...defaults.hubPages.kitchens.subsections,
            ...(next.hubPages.kitchens.subsections || {}),
          },
        };
      }
    }
    next.hubPages = repairHubPages(next.hubPages, defaults.hubPages);
  }
  if (!next.nav) {
    next.nav = defaults.nav;
  }
  if (!next.seo) {
    next.seo = defaults.seo;
  }

  const fillEmptyVideo = (section, defaultUrl) => {
    if (!section || typeof section !== "object") return section;
    if (String(section.videoUrl || "").trim()) return section;
    if (!defaultUrl) return section;
    return { ...section, videoUrl: defaultUrl };
  };
  next.hero = fillEmptyVideo(next.hero || defaults.hero, defaults.hero.videoUrl);
  next.productsPage = fillEmptyVideo(
    next.productsPage,
    defaults.productsPage.videoUrl
  );
  next.blogPage = fillEmptyVideo(next.blogPage, defaults.blogPage.videoUrl);
  next.faqPage = fillEmptyVideo(next.faqPage, defaults.faqPage.videoUrl);
  next.contactPage = fillEmptyVideo(
    next.contactPage,
    defaults.contactPage.videoUrl
  );

  // Align placeholder seed hero with live marketing copy when still on old defaults
  const oldHeroTitles = new Set([
    "Craft kitchens with soul",
    defaults.hero.title,
  ]);
  if (
    next.hero &&
    oldHeroTitles.has(String(next.hero.title || "").trim()) &&
    String(next.hero.title || "").trim() === "Craft kitchens with soul"
  ) {
    next.hero = { ...defaults.hero, ...next.hero, ...defaults.hero };
  }

  return sanitizeMediaUrlsDeep(normalizeHomeSections(next));
}

async function ensureAllSiteDefaults(siteId) {
  await Promise.all([
    ensureDefaultProducts(siteId),
    ensureDefaultBlogs(siteId),
    ensureDefaultGallery(siteId),
    ensureDefaultFaqs(siteId),
    ensureDefaultCategories(siteId),
  ]);

  if (!localesRepaired.has(siteId)) {
    const { repairAllThailandLocales } = require("../scripts/repairThailandLocales");
    await repairAllThailandLocales(siteId, {
      productDefaults: DEFAULT_PRODUCTS,
      galleryDefaults: DEFAULT_GALLERY,
    }).catch(() => null);
    localesRepaired.add(siteId);
  }
}

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

const {
  normalizeLocalizedHomeSections,
} = require("../utils/normalizeLocalizedHome");
const {
  findProbePath,
  isSupportedImageUrl,
  repairHubPages,
  sanitizeMediaUrl,
  sanitizeMediaUrlsDeep,
} = require("../utils/cmsContentGuard");
const {
  asLocalized: asLocalizedRaw,
  mergeLocalized,
  L,
} = require("../utils/localized");

/** Persist locale maps without copying English into empty Thai/Polish. */
function asLocalized(value, fallbackEn = "") {
  return asLocalizedRaw(value, fallbackEn);
}

function asFeatureHighlights(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      title: asLocalized(item?.title),
      description: asLocalized(item?.description),
    }))
    .filter(
      (item) =>
        item.title.en ||
        item.title.th ||
        item.title.pl ||
        item.description.en ||
        item.description.th ||
        item.description.pl
    );
}

function localizedTitleEn(value) {
  const map = asLocalized(value);
  return map.en || map.th || map.pl || "";
}

function normalizeContentSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map((block) => ({
    heading: asLocalized(block?.heading),
    body: asLocalized(block?.body ?? block?.text),
    image: sanitizeMediaUrl(block?.image),
    layout: String(block?.layout || "image-left").trim(),
  }));
}

function validateHeroImage(value) {
  const image = sanitizeMediaUrl(value);
  if (!isSupportedImageUrl(image)) {
    const err = new Error(
      "Hero image is required and must be a supported image URL or uploaded image path"
    );
    err.statusCode = 400;
    throw err;
  }
  return image;
}

function rejectProbePayload(payload, label = "content") {
  const hit = findProbePath(payload);
  if (hit) {
    const err = new Error(
      `Test markers are not allowed in ${label} (found at ${hit}). Remove HTML-PROBE / smoke-test strings before saving.`
    );
    err.statusCode = 400;
    throw err;
  }
}

/**
 * Products store category as a free-text label (string or {en,th,pl}).
 * Keep those labels in sync when a category is renamed or deleted.
 */
async function syncProductCategoryLabel(siteId, fromEn, toValue) {
  const from = String(fromEn || "").trim();
  if (!from) return;

  const to =
    typeof toValue === "string"
      ? toValue
      : toValue && typeof toValue === "object"
        ? toValue
        : "";

  // Legacy plain-string category
  await Product.updateMany(
    { siteId, category: from },
    { $set: { category: typeof to === "string" ? to : asLocalized(to) } }
  );

  // Localized category map — only rewrite English label to avoid wiping TH/PL
  if (typeof to === "string") {
    await Product.updateMany(
      { siteId, "category.en": from },
      { $set: { "category.en": to } }
    );
  } else if (to && typeof to === "object") {
    await Product.updateMany(
      { siteId, "category.en": from },
      { $set: { category: asLocalized(to) } }
    );
  }
}

function fillLocalizedMapsDeep(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(fillLocalizedMapsDeep);
  if (typeof value !== "object") return value;
  if ("en" in value || "th" in value || "pl" in value) {
    return asLocalized(value);
  }
  const next = {};
  for (const [key, entry] of Object.entries(value)) {
    next[key] = fillLocalizedMapsDeep(entry);
  }
  return next;
}

/**
 * Migrate legacy field names + localize text to {en,th,pl} (Varsovia-style).
 */
function normalizeHomeSections(raw = {}) {
  return fillLocalizedMapsDeep(normalizeLocalizedHomeSections(raw));
}

const listSites = asyncHandler(async (_req, res) => {
  return res.json({ success: true, sites: SITES });
});

const getHome = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  // Seed related collections so admin lists are never empty vs the live site
  await ensureAllSiteDefaults(siteId).catch(() => {});

  let home = await HomePage.findOne({ siteId });
  if (!home) {
    home = await HomePage.create({
      siteId,
      sections: structuredClone(DEFAULT_HOME_SECTIONS),
    });
  }

  const sections = enrichHomeSections(home.sections || {});
  const storedLogos = home.sections?.partners?.logos;
  const storedUsable = Array.isArray(storedLogos)
    ? storedLogos.filter((l) => l && String(l.image || l.logo || "").trim()).length
    : 0;
  if (storedUsable === 0 && sections.partners?.logos?.length) {
    home.sections = { ...(home.sections || {}), partners: sections.partners };
    home.markModified("sections");
    await home.save();
  }

  return res.json({ success: true, home: { sections } });
});

const updateHome = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  try {
    rejectProbePayload(req.body.sections || {}, "home sections");
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json({ success: false, message: err.message });
  }

  const sections = normalizeHomeSections(req.body.sections || {});
  const home = await HomePage.findOneAndUpdate(
    { siteId },
    { $set: { sections } },
    { upsert: true, new: true }
  );

  return res.json({ success: true, home: { sections: home.sections || {} } });
});

const resetHome = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const home = await HomePage.findOneAndUpdate(
    { siteId },
    { $set: { sections: structuredClone(DEFAULT_HOME_SECTIONS) } },
    { upsert: true, new: true }
  );

  return res.json({ success: true, home: { sections: home.sections || {} } });
});

const listCategories = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  
  await ensureDefaultCategories(siteId);
  
  // Support filtering by categoryType and indexable status
  const filter = { siteId };
  if (req.query.type) {
    filter.categoryType = req.query.type;
  }
  if (req.query.indexable === 'true') {
    filter.indexable = true;
  } else if (req.query.indexable === 'false') {
    filter.indexable = false;
  }
  
  let items = await Category.find(filter)
    .populate('parentId', 'title slug categoryType')
    .sort({ createdAt: -1 });
  
  // Fix: Ensure indexable field exists on all items (migrate old records)
  items = items.map(item => {
    const obj = item.toObject();
    if (obj.indexable === undefined) {
      obj.indexable = false;
    }
    return obj;
  });
    
  return res.json({ success: true, items });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { siteId, slug } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  
  const filter = { siteId, slug };

  // Optional type filter for more specific lookups
  if (req.query.type) {
    filter.categoryType = req.query.type;
  }

  // Location × service: resolve service under a specific location parent
  if (req.query.parentLocation) {
    const parentLoc = await Category.findOne({
      siteId,
      slug: String(req.query.parentLocation).trim(),
      categoryType: "location",
    });
    if (!parentLoc) {
      return res
        .status(404)
        .json({ success: false, message: "Parent location not found" });
    }
    filter.parentId = parentLoc._id;
  } else if (req.query.type === "service") {
    // Standalone service pages (/services/{slug}) have no parent
    filter.parentId = null;
  }

  const item = await Category.findOne(filter)
    .populate('parentId', 'title slug categoryType');
    
  if (!item) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  if (item.indexable === true && !isSupportedImageUrl(item.image)) {
    return res.status(404).json({
      success: false,
      message: "Published page is unavailable because its hero image is invalid",
    });
  }
  
  // Keep `item` (existing clients) and `category` (SEO pages / cmsPublic)
  return res.json({ success: true, item, category: item });
});

const createCategory = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  
  const title = asLocalized(req.body.title);
  const titleEn = localizedTitleEn(title);
  if (!titleEn) {
    return res.status(400).json({ success: false, message: "Title required" });
  }

  try {
    rejectProbePayload(req.body, "category");
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json({ success: false, message: err.message });
  }

  const parentId = req.body.parentId ? String(req.body.parentId).trim() : null;
  if (parentId && !mongoose.isValidObjectId(parentId)) {
    return res.status(400).json({ success: false, message: "Invalid parent category" });
  }
  const image = validateHeroImage(req.body.image);
  
  // Auto-generate slug from title if not provided
  const slug = req.body.slug ? slugify(req.body.slug) : slugify(titleEn);
  
  // Validate slug uniqueness per categoryType + parent (location × service)
  if (slug) {
    const categoryType = String(req.body.categoryType || "");
    const existing = await Category.findOne({
      siteId,
      slug,
      categoryType,
      parentId,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists for this category type and parent",
      });
    }
  }
  
  // Validate parent category exists if parentId provided
  if (parentId) {
    const parent = await Category.findOne({ _id: parentId, siteId });
    if (!parent) {
      return res.status(400).json({ success: false, message: "Parent category not found" });
    }
  }
  
  const item = await Category.create({
    siteId,
    title,
    description: asLocalized(req.body.description),
    image,
    icon: String(req.body.icon || ""),
    slug,
    categoryType: String(req.body.categoryType || ""),
    parentId,
    metaTitle: String(req.body.metaTitle || "").substring(0, 60),
    metaDescription: String(req.body.metaDescription || "").substring(0, 160),
    canonicalUrl: String(req.body.canonicalUrl || ""),
    indexable: Boolean(req.body.indexable),
    sections: normalizeContentSections(req.body.sections),
    eyebrow: asLocalized(req.body.eyebrow),
    ctaLabel: asLocalized(req.body.ctaLabel),
    ctaHref: String(req.body.ctaHref || "/contact").trim() || "/contact",
    footerCtaHeading: asLocalized(req.body.footerCtaHeading),
    footerCtaBody: asLocalized(req.body.footerCtaBody),
  });
  
  return res.status(201).json({ success: true, item });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;

  const existing = await Category.findOne({ _id: id, siteId });
  if (!existing) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  const oldTitleEn = localizedTitleEn(existing.title);
  
  const title = asLocalized(req.body.title);
  const titleEn = localizedTitleEn(title);
  if (!titleEn) {
    return res.status(400).json({ success: false, message: "Title required" });
  }

  try {
    rejectProbePayload(req.body, "category");
  } catch (err) {
    return res
      .status(err.statusCode || 400)
      .json({ success: false, message: err.message });
  }

  const requestedParentId =
    req.body.parentId !== undefined
      ? req.body.parentId
        ? String(req.body.parentId).trim()
        : null
      : undefined;
  if (requestedParentId && !mongoose.isValidObjectId(requestedParentId)) {
    return res.status(400).json({ success: false, message: "Invalid parent category" });
  }
  const image =
    req.body.image !== undefined
      ? validateHeroImage(req.body.image)
      : sanitizeMediaUrl(existing.image);
  if (req.body.indexable === true && !isSupportedImageUrl(image)) {
    return res.status(400).json({
      success: false,
      message: "A published page must have a supported hero image",
    });
  }
  
  const updateData = {
    title,
    description: asLocalized(req.body.description),
    image,
    icon: String(req.body.icon || ""),
  };
  
  // Handle slug update with uniqueness check (per categoryType)
  if (req.body.slug !== undefined) {
    const slug = slugify(req.body.slug);
    if (slug) {
      const nextType =
        req.body.categoryType !== undefined
          ? String(req.body.categoryType || "")
          : String(existing.categoryType || "");
      const nextParent =
        requestedParentId !== undefined
          ? requestedParentId
          : existing.parentId || null;
      const existingSlug = await Category.findOne({
        siteId,
        slug,
        categoryType: nextType,
        parentId: nextParent,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists for this category type and parent",
        });
      }
      updateData.slug = slug;
    }
  }
  
  // Validate parent category if being updated
  if (requestedParentId !== undefined) {
    if (requestedParentId) {
      const parent = await Category.findOne({ _id: requestedParentId, siteId });
      if (!parent) {
        return res.status(400).json({ success: false, message: "Parent category not found" });
      }
      // Prevent circular references
      if (requestedParentId === id) {
        return res.status(400).json({ success: false, message: "Category cannot be its own parent" });
      }
    }
    updateData.parentId = requestedParentId;
  }
  
  // Update optional SEO fields if provided
  if (req.body.categoryType !== undefined) {
    updateData.categoryType = String(req.body.categoryType || "");
  }
  if (req.body.metaTitle !== undefined) {
    updateData.metaTitle = String(req.body.metaTitle || "").substring(0, 60);
  }
  if (req.body.metaDescription !== undefined) {
    updateData.metaDescription = String(req.body.metaDescription || "").substring(0, 160);
  }
  if (req.body.canonicalUrl !== undefined) {
    updateData.canonicalUrl = String(req.body.canonicalUrl || "");
  }
  if (req.body.indexable !== undefined) {
    updateData.indexable = Boolean(req.body.indexable);
  }
  if (req.body.sections !== undefined) {
    updateData.sections = normalizeContentSections(req.body.sections);
  }
  if (req.body.eyebrow !== undefined) {
    updateData.eyebrow = asLocalized(req.body.eyebrow);
  }
  if (req.body.ctaLabel !== undefined) {
    updateData.ctaLabel = asLocalized(req.body.ctaLabel);
  }
  if (req.body.ctaHref !== undefined) {
    updateData.ctaHref =
      String(req.body.ctaHref || "/contact").trim() || "/contact";
  }
  if (req.body.footerCtaHeading !== undefined) {
    updateData.footerCtaHeading = asLocalized(req.body.footerCtaHeading);
  }
  if (req.body.footerCtaBody !== undefined) {
    updateData.footerCtaBody = asLocalized(req.body.footerCtaBody);
  }
  
  const item = await Category.findOneAndUpdate(
    { _id: id, siteId },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('parentId', 'title slug categoryType');
  
  if (!item) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  // Keep product filters working after rename (products store category as label text)
  const newTitleEn = localizedTitleEn(item.title);
  if (oldTitleEn && newTitleEn && oldTitleEn !== newTitleEn) {
    await syncProductCategoryLabel(siteId, oldTitleEn, item.title);
  }
  
  return res.json({ success: true, item });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Category.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }

  const titleEn = localizedTitleEn(item.title);
  // Detach products from deleted category label (stay listed under All, not a ghost tab)
  if (titleEn) {
    await syncProductCategoryLabel(siteId, titleEn, "");
  }
  // Orphan child categories instead of leaving a dead parentId
  await Category.updateMany(
    { siteId, parentId: id },
    { $set: { parentId: null } }
  );

  return res.json({ success: true, message: "Deleted" });
});

const listProducts = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  // Seed website catalogue products into CMS so admin + site share one list
  await ensureAllSiteDefaults(siteId).catch(() => {});
  let items = await Product.find({ siteId }).sort({ createdAt: -1 });
  
  // Fix: Ensure indexable field exists on all items
  items = items.map(item => {
    const obj = item.toObject();
    if (obj.indexable === undefined) {
      obj.indexable = false;
    }
    return obj;
  });
  
  return res.json({ success: true, items });
});

const createProduct = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const title = asLocalized(req.body.title);
  const titleEn = localizedTitleEn(title);
  const slug = slugify(req.body.slug || titleEn);
  if (!titleEn || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  const slugCheck = await assertProductSlugAvailable(siteId, slug);
  if (!slugCheck.ok) {
    return res.status(400).json({ success: false, message: slugCheck.message });
  }

  const item = await Product.create({
    siteId,
    title,
    slug,
    subtitle: asLocalized(req.body.subtitle),
    productType: asLocalized(req.body.productType),
    sectionTag: asLocalized(req.body.sectionTag),
    description: asLocalized(req.body.description),
    image: sanitizeMediaUrl(req.body.image),
    icon: String(req.body.icon || ""),
    gallery: asStringArray(req.body.gallery),
    contactImage: String(req.body.contactImage || ""),
    contactEyebrow: asLocalized(req.body.contactEyebrow),
    contactTitle: asLocalized(req.body.contactTitle),
    contactFormTitle: asLocalized(req.body.contactFormTitle),
    pdfUrl: String(req.body.pdfUrl || ""),
    featureHighlights: asFeatureHighlights(req.body.featureHighlights),
    category: asLocalized(req.body.category),
    featured: Boolean(req.body.featured),
    finish: asLocalized(req.body.finish),
    material: asLocalized(req.body.material),
    style: asLocalized(req.body.style),
    color: asLocalized(req.body.color),
    metaTitle: String(req.body.metaTitle || "").substring(0, 60),
    metaDescription: String(req.body.metaDescription || "").substring(0, 160),
    indexable: Boolean(req.body.indexable),
  });

  return res.status(201).json({ success: true, item });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const title = asLocalized(req.body.title);
  const titleEn = localizedTitleEn(title);
  const slug = slugify(req.body.slug || titleEn);
  if (!titleEn || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  const slugCheck = await assertProductSlugAvailable(siteId, slug, id);
  if (!slugCheck.ok) {
    return res.status(400).json({ success: false, message: slugCheck.message });
  }

  const item = await Product.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title,
        slug,
        subtitle: asLocalized(req.body.subtitle),
        productType: asLocalized(req.body.productType),
        sectionTag: asLocalized(req.body.sectionTag),
        description: asLocalized(req.body.description),
        image: sanitizeMediaUrl(req.body.image),
        icon: String(req.body.icon || ""),
        gallery: asStringArray(req.body.gallery),
        contactImage: String(req.body.contactImage || ""),
        contactEyebrow: asLocalized(req.body.contactEyebrow),
        contactTitle: asLocalized(req.body.contactTitle),
        contactFormTitle: asLocalized(req.body.contactFormTitle),
        pdfUrl: String(req.body.pdfUrl || ""),
        featureHighlights: asFeatureHighlights(req.body.featureHighlights),
        category: asLocalized(req.body.category),
        featured: Boolean(req.body.featured),
        finish: asLocalized(req.body.finish),
        material: asLocalized(req.body.material),
        style: asLocalized(req.body.style),
        color: asLocalized(req.body.color),
        metaTitle: String(req.body.metaTitle || "").substring(0, 60),
        metaDescription: String(req.body.metaDescription || "").substring(0, 160),
        indexable: Boolean(req.body.indexable),
      },
    },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  return res.json({ success: true, item });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Product.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

function asBodySections(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => ({
      title: String(s?.title || "").trim(),
      content: String(s?.content || "").trim(),
      image: sanitizeMediaUrl(s?.image),
    }))
    .filter((s) => s.title || s.content || s.image);
}

const BLOG_LOCALES = ["th", "pl"];

/** Keep only known per-locale blog fields so strict schema writes succeed. */
function asBlogTranslations(value, englishBase = {}) {
  const source = value && typeof value === "object" ? value : {};
  const baseSections = asBodySections(englishBase.bodySections);
  return BLOG_LOCALES.reduce((acc, locale) => {
    const entry = source[locale] && typeof source[locale] === "object"
      ? source[locale]
      : {};
    let bodySections = asBodySections(entry.bodySections);
    // Accept content: string[] from static/seed packs
    if (!bodySections.length && Array.isArray(entry.content)) {
      bodySections = entry.content
        .map((p) => String(p || "").trim())
        .filter(Boolean)
        .map((content) => ({ title: "", content, image: "" }));
    }
    if (!bodySections.length && baseSections.length) {
      bodySections = baseSections.map((s) => ({ ...s }));
    }
    const highlightTitle = String(
      entry.highlightTitle || entry.subsectionTitle || englishBase.highlightTitle || ""
    ).trim();
    acc[locale] = {
      title: String(entry.title || englishBase.title || "").trim(),
      excerpt: String(entry.excerpt || englishBase.excerpt || "").trim(),
      category: String(entry.category || englishBase.category || "").trim(),
      bodySections,
      highlightTitle,
      highlightText: String(
        entry.highlightText || englishBase.highlightText || ""
      ).trim(),
      quote: String(entry.quote || englishBase.quote || "").trim(),
      quoteAuthor: String(entry.quoteAuthor || englishBase.quoteAuthor || "").trim(),
    };
    return acc;
  }, {});
}

/**
 * Blog slugs are unique per site. Two articles can legitimately share a title,
 * so append a counter instead of rejecting the save.
 */
async function uniqueBlogSlug(siteId, baseSlug, excludeId) {
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const query = { siteId, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const taken = await Blog.exists(query);
    if (!taken) return candidate;
  }
  return `${baseSlug}-${Date.now()}`;
}

function contentFromBodySections(sections) {
  return asBodySections(sections)
    .map((s) => [s.title, s.content].filter(Boolean).join("\n"))
    .filter(Boolean)
    .join("\n\n");
}

const DEFAULT_BLOGS = [
  {
    title:
      "The Art of Teak: Why Heritage Timber Remains the Ultimate Kitchen Luxury",
    slug: "the-art-of-teak",
    excerpt:
      "From grain to finish, teak brings warmth, strength, and lasting character to every kitchen we craftâ€”rooted in Thai heritage and modern living.",
    category: "Kitchen Design Trends",
    author: "Thailand Kitchen",
    readTime: "8 min",
    publishDate: "2024-05-12",
    image: "/blog/blogImage (1).jpg",
    gallery: ["/blog/blogImage (2).jpg", "/blog/blogImage (3).jpg"],
    bodySections: [
      {
        title: "A Legacy of Resilience",
        content:
          "Teak has long been prized across Thailand for its natural oils, rich grain, and remarkable resistance to moisture. In the kitchenâ€”where heat, steam, and daily use put materials to the testâ€”this heritage timber still stands as one of the most refined choices available.",
        image: "",
      },
      {
        title: "Craft & Character",
        content:
          "Every board we select is evaluated for grain direction, colour depth, and structural integrity. The goal is not only beauty, but performance that ages with grace over decades.",
        image: "",
      },
    ],
    highlightTitle: "A Legacy of Resilience",
    highlightText:
      "Our craftsmen combine traditional joining techniques with modern kitchen engineering, creating cabinetry that feels rooted in Thai heritage while serving contemporary life.",
    quote:
      "Teak is alive. Even after it is carved into cabinetry, it breathes with the room. Our job is to listen to the grain and let it guide the chisel.",
    quoteAuthor: "Master Craftsman, Lead Artisan",
    published: true,
  },
  {
    title:
      "Open Concept Living: Designing a Kitchen That Connects the Whole Home",
    slug: "open-concept-kitchen-design",
    excerpt:
      "An open kitchen can become the heart of family life. Hereâ€™s how thoughtful layout and proportion create flow without sacrificing function.",
    category: "Layout & Space",
    author: "Thailand Kitchen",
    readTime: "6 min",
    publishDate: "2024-04-28",
    image: "/blog/blogImage (2).jpg",
    gallery: ["/blog/blogImage (1).jpg", "/blog/blogImage (3).jpg"],
    bodySections: [
      {
        title: "Designing for Connection",
        content:
          "Open-concept kitchens succeed when they balance cooking needs with social connection. Sight lines, island placement, and ceiling rhythm all shape how a room feels.",
        image: "",
      },
    ],
    highlightTitle: "Designing for Connection",
    highlightText:
      "Material continuity between kitchen and living spaces helps the home read as one composition, while subtle changes in texture keep each zone distinct.",
    quote:
      "A kitchen should invite people inâ€”not push them to the edges of the room.",
    quoteAuthor: "Thailand Kitchens Design Studio",
    published: true,
  },
  {
    title: "The Ultimate Guide to Modern Kitchen Transformation in Thailand",
    slug: "modern-kitchen-transformation",
    excerpt:
      "From layout planning to finish selection, explore how a modern modular kitchen can transform daily living in Thai homes.",
    category: "Kitchen Care",
    author: "Anan Sukhumvit",
    readTime: "5 min",
    publishDate: "2026-07-09",
    image: "/blog/blogImage (3).jpg",
    gallery: ["/blog/blogImage (1).jpg", "/blog/blogImage (2).jpg"],
    bodySections: [
      {
        title: "Start With Lifestyle",
        content:
          "The best kitchens begin with how you cook, host, and move through the home. We map those habits before selecting layouts and materials.",
        image: "",
      },
    ],
    highlightTitle: "Finish With Intention",
    highlightText:
      "Durable surfaces, thoughtful storage, and calm lighting turn a renovation into a lasting upgrade.",
    quote:
      "A modern kitchen should feel effortless every morningâ€”and still look considered every evening.",
    quoteAuthor: "Thailand Kitchen Studio",
    published: true,
  },
  {
    title: "The Marble Masterclass: Selecting the Perfect Slab",
    slug: "the-marble-masterclass",
    excerpt:
      "Choosing marble is equal parts aesthetics and practicality. Learn how to select a slab that suits cooking style, light, and long-term care.",
    category: "Material Guides",
    author: "Thailand Kitchen",
    readTime: "7 min",
    publishDate: "2024-04-10",
    image: "/blog/blogImage (3).jpg",
    gallery: ["/blog/blogImage (1).jpg", "/blog/blogImage (2).jpg"],
    bodySections: [
      {
        title: "Reading the Stone",
        content:
          "Marble brings a quiet luxury to kitchen surfaces—soft veining, cool touch, and timeless presence. Selecting the right slab begins with understanding how you cook and clean.",
        image: "",
      },
    ],
    highlightTitle: "Reading the Stone",
    highlightText:
      "Look carefully at vein movement and colour variation under both daylight and evening lighting.",
    quote:
      "Every slab tells a story in its veins—choose the one that feels calm in your light.",
    quoteAuthor: "Material Specialist",
    published: true,
  },
  {
    title: "Living in the Heart of the Home: Kitchen as Hub",
    slug: "living-in-the-heart-of-the-home",
    excerpt:
      "Beyond cooking, the kitchen is where daily life gathers. Design choices that welcome people make the space feel alive all day.",
    category: "Lifestyle",
    author: "Thailand Kitchen",
    readTime: "5 min",
    publishDate: "2024-03-22",
    image: "/blog/blogImage (1).jpg",
    gallery: ["/blog/blogImage (2).jpg", "/blog/blogImage (3).jpg"],
    bodySections: [
      {
        title: "Life Around the Island",
        content:
          "A kitchen becomes the heart of the home when it invites lingering—morning coffee, homework at the island, and evening conversation after dinner.",
        image: "",
      },
    ],
    highlightTitle: "Life Around the Island",
    highlightText:
      "Comfortable seating, soft lighting, and durable finishes let the kitchen support many moods without feeling fragile.",
    quote:
      "The best kitchens hold more than meals—they hold the rhythm of the day.",
    quoteAuthor: "Thailand Kitchens",
    published: true,
  },
  {
    title: "Functional Flow: Ergonomics in the Modern Kitchen",
    slug: "functional-flow-ergonomics",
    excerpt:
      "Good kitchens feel effortless because reach, height, and movement are planned with intention—reducing strain while increasing efficiency.",
    category: "Design Trends",
    author: "Thailand Kitchen",
    readTime: "6 min",
    publishDate: "2024-03-05",
    image: "/blog/blogImage (2).jpg",
    gallery: ["/blog/blogImage (1).jpg", "/blog/blogImage (3).jpg"],
    bodySections: [
      {
        title: "Movement Without Friction",
        content:
          "Ergonomics transforms everyday cooking. Worktop height, drawer access, and appliance placement determine how natural each task feels.",
        image: "",
      },
    ],
    highlightTitle: "Movement Without Friction",
    highlightText:
      "We design around your height, habits, and most-used tools so the kitchen supports you rather than asking you to adapt.",
    quote:
      "When reach and height are right, cooking feels natural—not like work.",
    quoteAuthor: "Design Studio",
    published: true,
  },
];

async function ensureDefaultBlogs(siteId) {
  const count = await Blog.countDocuments({ siteId });
  if (count > 0) return;
  const { syncBlogsMissingOnly } = require("../scripts/syncBlogsSafe");
  await syncBlogsMissingOnly(siteId, DEFAULT_BLOGS);
}

const listBlogs = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  await ensureAllSiteDefaults(siteId).catch(() => {});
  let items = await Blog.find({ siteId }).sort({ createdAt: -1 });
  
  // Fix: Ensure all SEO fields exist
  items = items.map(item => {
    const obj = item.toObject();
    if (obj.indexable === undefined) {
      obj.indexable = false;
    }
    return obj;
  });
  
  return res.json({ success: true, items });
});

function blogSeoFieldsFromBody(body = {}) {
  return {
    primaryCommercialPage: String(body.primaryCommercialPage || "").trim(),
    locationTag: String(body.locationTag || "").trim(),
    serviceTag: String(body.serviceTag || "").trim(),
    materialTag: String(body.materialTag || "").trim(),
    metaDescription: String(body.metaDescription || "").trim().slice(0, 160),
    reviewer: String(body.reviewer || "").trim(),
  };
}

function assertPublishedBlogHasPrimaryCommercial(body = {}) {
  const published = body.published !== false;
  if (!published) return { ok: true };

  const primary = String(body.primaryCommercialPage || "").trim();
  const author = String(body.author || "").trim();
  const locationTag = String(body.locationTag || "").trim();
  const serviceTag = String(body.serviceTag || "").trim();
  const materialTag = String(body.materialTag || "").trim();
  const metaDescription = String(body.metaDescription || "").trim();

  if (!primary) {
    return {
      ok: false,
      message:
        "Primary Commercial Page URL is required to publish. Link a service/product page or set Published to OFF.",
    };
  }
  if (!author) {
    return { ok: false, message: "Author is required to publish" };
  }
  if (!locationTag) {
    return { ok: false, message: "Location tag is required to publish" };
  }
  if (!serviceTag && !materialTag) {
    return {
      ok: false,
      message: "Service or Material tag is required to publish",
    };
  }
  if (!metaDescription) {
    return { ok: false, message: "Meta Description is required to publish" };
  }
  if (metaDescription.length > 160) {
    return {
      ok: false,
      message: "Meta Description must be 160 characters or less",
    };
  }
  return { ok: true };
}

const createBlog = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const title = String(req.body.title || "").trim();
  const baseSlug = slugify(req.body.slug || title);
  if (!title || !baseSlug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  const publishGate = assertPublishedBlogHasPrimaryCommercial(req.body);
  if (!publishGate.ok) {
    return res.status(400).json({ success: false, message: publishGate.message });
  }

  const slug = await uniqueBlogSlug(siteId, baseSlug);
  const bodySections = asBodySections(req.body.bodySections);
  const content =
    String(req.body.content || "").trim() ||
    contentFromBodySections(bodySections);
  const seo = blogSeoFieldsFromBody(req.body);

  const item = await Blog.create({
    siteId,
    title,
    slug,
    excerpt: String(req.body.excerpt || ""),
    content,
    image: sanitizeMediaUrl(req.body.image),
    gallery: asStringArray(req.body.gallery).map(sanitizeMediaUrl),
    category: String(req.body.category || ""),
    author: String(req.body.author || ""),
    readTime: String(req.body.readTime || ""),
    publishDate: String(req.body.publishDate || ""),
    bodySections,
    highlightTitle: String(req.body.highlightTitle || ""),
    highlightText: String(req.body.highlightText || ""),
    quote: String(req.body.quote || ""),
    quoteAuthor: String(req.body.quoteAuthor || ""),
    translations: asBlogTranslations(req.body.translations, {
      title,
      excerpt: String(req.body.excerpt || ""),
      category: String(req.body.category || ""),
      bodySections,
      highlightTitle: String(req.body.highlightTitle || ""),
      highlightText: String(req.body.highlightText || ""),
      quote: String(req.body.quote || ""),
      quoteAuthor: String(req.body.quoteAuthor || ""),
    }),
    published: req.body.published !== false,
    ...seo,
  });

  return res.status(201).json({ success: true, item });
});

const updateBlog = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const existing = await Blog.findOne({ _id: id, siteId });
  if (!existing) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  const title = String(req.body.title || existing.title || "").trim();
  const baseSlug = slugify(req.body.slug || title || existing.slug);
  if (!title || !baseSlug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  // Merge SEO so re-saving a published post without retyping PCP still works
  const mergedBody = {
    ...req.body,
    primaryCommercialPage:
      req.body.primaryCommercialPage !== undefined &&
      String(req.body.primaryCommercialPage || "").trim()
        ? req.body.primaryCommercialPage
        : existing.primaryCommercialPage,
    published:
      req.body.published !== undefined ? req.body.published : existing.published,
  };

  const publishGate = assertPublishedBlogHasPrimaryCommercial(mergedBody);
  if (!publishGate.ok) {
    return res.status(400).json({ success: false, message: publishGate.message });
  }

  const slug = await uniqueBlogSlug(siteId, baseSlug, id);
  const bodySections =
    req.body.bodySections !== undefined
      ? asBodySections(req.body.bodySections)
      : asBodySections(existing.bodySections);
  const content =
    String(req.body.content || "").trim() ||
    contentFromBodySections(bodySections) ||
    String(existing.content || "");
  const seo = blogSeoFieldsFromBody(mergedBody);

  const item = await Blog.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title,
        slug,
        excerpt:
          req.body.excerpt !== undefined
            ? String(req.body.excerpt || "")
            : String(existing.excerpt || ""),
        content,
        image:
          req.body.image !== undefined
            ? sanitizeMediaUrl(req.body.image)
            : sanitizeMediaUrl(existing.image || ""),
        gallery:
          req.body.gallery !== undefined
            ? asStringArray(req.body.gallery).map(sanitizeMediaUrl)
            : asStringArray(existing.gallery).map(sanitizeMediaUrl),
        category:
          req.body.category !== undefined
            ? String(req.body.category || "")
            : String(existing.category || ""),
        author:
          req.body.author !== undefined
            ? String(req.body.author || "")
            : String(existing.author || ""),
        readTime:
          req.body.readTime !== undefined
            ? String(req.body.readTime || "")
            : String(existing.readTime || ""),
        publishDate:
          req.body.publishDate !== undefined
            ? String(req.body.publishDate || "")
            : String(existing.publishDate || ""),
        bodySections,
        highlightTitle:
          req.body.highlightTitle !== undefined
            ? String(req.body.highlightTitle || "")
            : String(existing.highlightTitle || ""),
        highlightText:
          req.body.highlightText !== undefined
            ? String(req.body.highlightText || "")
            : String(existing.highlightText || ""),
        quote:
          req.body.quote !== undefined
            ? String(req.body.quote || "")
            : String(existing.quote || ""),
        quoteAuthor:
          req.body.quoteAuthor !== undefined
            ? String(req.body.quoteAuthor || "")
            : String(existing.quoteAuthor || ""),
        translations:
          req.body.translations !== undefined
            ? asBlogTranslations(req.body.translations, {
                title,
                excerpt:
                  req.body.excerpt !== undefined
                    ? String(req.body.excerpt || "")
                    : String(existing.excerpt || ""),
                category:
                  req.body.category !== undefined
                    ? String(req.body.category || "")
                    : String(existing.category || ""),
                bodySections,
                highlightTitle:
                  req.body.highlightTitle !== undefined
                    ? String(req.body.highlightTitle || "")
                    : String(existing.highlightTitle || ""),
                highlightText:
                  req.body.highlightText !== undefined
                    ? String(req.body.highlightText || "")
                    : String(existing.highlightText || ""),
                quote:
                  req.body.quote !== undefined
                    ? String(req.body.quote || "")
                    : String(existing.quote || ""),
                quoteAuthor:
                  req.body.quoteAuthor !== undefined
                    ? String(req.body.quoteAuthor || "")
                    : String(existing.quoteAuthor || ""),
              })
            : asBlogTranslations(existing.translations, {
                title: existing.title,
                excerpt: existing.excerpt,
                category: existing.category,
                bodySections: existing.bodySections,
                highlightTitle: existing.highlightTitle,
                highlightText: existing.highlightText,
                quote: existing.quote,
                quoteAuthor: existing.quoteAuthor,
              }),
        published: mergedBody.published !== false,
        ...seo,
      },
    },
    { new: true }
  );

  return res.json({ success: true, item });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Blog.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const DEFAULT_LEGAL = {
  privacy: {
    title: L("PRIVACY POLICY", "นโยบายความเป็นส่วนตัว", "POLITYKA PRYWATNOŚCI"),
    subtitle: L(
      "HOW WE COLLECT, USE, AND PROTECT YOUR PERSONAL INFORMATION.",
      "วิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ",
      "JAK ZBIERAMY, UŻYWAMY I CHRONIMY TWOJE DANE OSOBOWE."
    ),
    updatedLabel: L("July 2026", "กรกฎาคม 2026", "Lipiec 2026"),
    sections: [
      {
        title: L(
          "Information We Collect",
          "ข้อมูลที่เราเก็บรวบรวม",
          "Informacje, które zbieramy"
        ),
        body: L(
          "When you request a kitchen consultation, design quote, or contact our support team, we may collect your name, email address, phone number, property address, and project requirements. This information is used solely to provide you with our modular kitchen services.",
          "เมื่อคุณขอคำปรึกษาเรื่องครัว ใบเสนอราคาการออกแบบ หรือติดต่อทีมสนับสนุน เราอาจเก็บชื่อ อีเมล หมายเลขโทรศัพท์ ที่อยู่ทรัพย์สิน และความต้องการของโครงการ ข้อมูลนี้ใช้เพื่อให้บริการครัวโมดูลาร์เท่านั้น",
          "Gdy prosisz o konsultację kuchenną, wycenę projektu lub kontaktujesz się z naszym zespołem, możemy zbierać imię i nazwisko, e-mail, telefon, adres nieruchomości oraz wymagania projektu. Dane te służą wyłącznie do świadczenia usług kuchni modułowych."
        ),
      },
      {
        title: L(
          "How We Use Your Information",
          "วิธีที่เราใช้ข้อมูลของคุณ",
          "Jak wykorzystujemy Twoje informacje"
        ),
        body: L(
          "We use your data to deliver custom modular kitchen designs, coordinate site measurements and installation, and provide project updates. Your information helps us craft kitchens that perfectly match your lifestyle and Thai island home.",
          "เราใช้ข้อมูลของคุณเพื่อส่งมอบการออกแบบครัวโมดูลาร์ จัดตารางวัดพื้นที่และติดตั้ง และอัปเดตความคืบหน้าโครงการ ข้อมูลช่วยให้เราสร้างครัวที่เข้ากับไลฟ์สไตล์และบ้านบนเกาะของคุณ",
          "Wykorzystujemy dane do dostarczania projektów kuchni modułowych, koordynacji pomiarów i montażu oraz aktualizacji projektu. Pomagają one stworzyć kuchnię dopasowaną do Twojego stylu życia i domu na tajskiej wyspie."
        ),
      },
      {
        title: L(
          "Information Sharing & Security",
          "การแบ่งปันข้อมูลและความปลอดภัย",
          "Udostępnianie informacji i bezpieczeństwo"
        ),
        body: L(
          "We do not sell or rent your personal data. Information is only shared with trusted installation partners and hardware suppliers necessary to complete your kitchen project. We implement industry-standard security measures to protect your data.",
          "เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณ ข้อมูลจะแชร์เฉพาะกับพาร์ทเนอร์ติดตั้งและซัพพลายเออร์ฮาร์ดแวร์ที่จำเป็นเพื่อทำโครงการครัวให้เสร็จ เราใช้มาตรการรักษาความปลอดภัยตามมาตรฐานอุตสาหกรรม",
          "Nie sprzedajemy ani nie wynajmujemy Twoich danych. Informacje udostępniamy wyłącznie zaufanym partnerom montażowym i dostawcom okucia niezbędnym do realizacji projektu. Stosujemy branżowe środki ochrony danych."
        ),
      },
      {
        title: L(
          "Your Privacy Rights & Contact",
          "สิทธิความเป็นส่วนตัวและการติดต่อ",
          "Twoje prawa do prywatności i kontakt"
        ),
        body: L(
          "You have the right to access, correct, or delete your personal data at any time. For privacy-related inquiries or to exercise your rights, please contact us at thailandkichens@gmail.com.",
          "คุณมีสิทธิเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลได้ทุกเมื่อ สำหรับคำถามด้านความเป็นส่วนตัวหรือการใช้สิทธิ ติดต่อเราที่ thailandkichens@gmail.com",
          "Masz prawo w każdej chwili uzyskać dostęp, poprawić lub usunąć swoje dane. W sprawach prywatności lub realizacji praw napisz na thailandkichens@gmail.com."
        ),
      },
    ],
  },
  terms: {
    title: L("TERMS & CONDITIONS", "ข้อกำหนดและเงื่อนไข", "REGULAMIN"),
    subtitle: L(
      "TERMS OF USE AND SERVICE AGREEMENT FOR OUR KITCHEN SERVICES.",
      "ข้อกำหนดการใช้และข้อตกลงบริการสำหรับบริการครัวของเรา",
      "WARUNKI KORZYSTANIA I UMOWA O ŚWIADCZENIE USŁUG KUCHENNYCH."
    ),
    updatedLabel: L("July 2026", "กรกฎาคม 2026", "Lipiec 2026"),
    sections: [
      {
        title: L(
          "Acceptance of Terms",
          "การยอมรับข้อกำหนด",
          "Akceptacja warunków"
        ),
        body: L(
          "By accessing our website, booking a consultation, or placing an order for a modular kitchen, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.",
          "การเข้าชมเว็บไซต์ การนัดคำปรึกษา หรือการสั่งซื้อครัวโมดูลาร์ ถือว่าคุณยอมรับข้อกำหนดและเงื่อนไขเหล่านี้ หากไม่ยอมรับ กรุณาอย่าใช้บริการของเรา",
          "Korzystając z witryny, rezerwując konsultację lub składając zamówienie na kuchnię modułową, zgadzasz się na niniejszy Regulamin. Jeśli nie akceptujesz warunków, nie korzystaj z naszych usług."
        ),
      },
      {
        title: L(
          "Quotations, Orders & Payment Terms",
          "ใบเสนอราคา คำสั่งซื้อ และเงื่อนไขการชำระเงิน",
          "Wyceny, zamówienia i warunki płatności"
        ),
        body: L(
          "All quotations are valid for 30 days from the date of issue. A deposit is required to commence manufacturing. The remaining balance is due upon completion of manufacturing and prior to delivery/installation, unless otherwise agreed in writing.",
          "ใบเสนอราคาทุกฉบับมีอายุ 30 วันนับจากวันที่ออก ต้องชำระมัดจำเพื่อเริ่มผลิต ยอดคงเหลือชำระเมื่อผลิตเสร็จและก่อนส่งมอบ/ติดตั้ง เว้นแต่ตกลงเป็นลายลักษณ์อักษรไว้เป็นอย่างอื่น",
          "Wszystkie wyceny są ważne 30 dni od daty wystawienia. Do rozpoczęcia produkcji wymagana jest zaliczka. Pozostała kwota jest płatna po zakończeniu produkcji i przed dostawą/montażem, chyba że uzgodniono inaczej na piśmie."
        ),
      },
      {
        title: L(
          "Site Measurement & Installation",
          "การวัดพื้นที่และการติดตั้ง",
          "Pomiary na miejscu i montaż"
        ),
        body: L(
          "Accurate site preparation (including plumbing and electrical readiness) is the client's responsibility unless otherwise contracted. Our technical team will schedule measurements and installation windows in coordination with you.",
          "การเตรียมพื้นที่ให้พร้อม (รวมถึงระบบประปาและไฟฟ้า) เป็นความรับผิดชอบของลูกค้า เว้นแต่ตกลงไว้เป็นอย่างอื่น ทีมเทคนิคจะนัดหมายการวัดและติดตั้งร่วมกับคุณ",
          "Dokładne przygotowanie miejsca (w tym gotowość instalacji wodno-kanalizacyjnej i elektrycznej) leży po stronie klienta, chyba że umówiono inaczej. Nasz zespół techniczny uzgodni z Tobą terminy pomiarów i montażu."
        ),
      },
      {
        title: L(
          "Warranty & After-Sales Support",
          "การรับประกันและการบริการหลังการขาย",
          "Gwarancja i wsparcie posprzedażowe"
        ),
        body: L(
          "We provide a 10-year structural warranty on HDMR carcase construction and Blum/Hettich hardware (subject to manufacturer terms and fair use). Cosmetic finishes and consumables may carry separate coverage as stated in your order documents.",
          "เรารับประกันโครงสร้างโครงตู้ HDMR และฮาร์ดแวร์ Blum/Hettich เป็นเวลา 10 ปี (ตามเงื่อนไขผู้ผลิตและการใช้งานอย่างเหมาะสม) งานตกแต่งผิวและวัสดุสิ้นเปลืองอาจมีการรับประกันแยกตามเอกสารสั่งซื้อ",
          "Zapewniamy 10-letnią gwarancję konstrukcyjną na korpusy HDMR oraz okucia Blum/Hettich (zgodnie z warunkami producenta i prawidłowym użytkowaniem). Wykończenia i materiały eksploatacyjne mogą mieć osobne warunki określone w dokumentach zamówienia."
        ),
      },
    ],
  },
};

function serializeLegalSections(sections) {
  if (!Array.isArray(sections) || !sections.length) return "";
  return sections
    .map((s, i) => {
      const title = localizedTitleEn(s?.title);
      const body = localizedTitleEn(s?.body);
      if (!title && !body) return "";
      return `${i + 1}. ${title}\n${body}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

function parseLegalSectionsFromContent(content) {
  const text =
    typeof content === "object" && content
      ? localizedTitleEn(content)
      : String(content || "").trim();
  if (!text) return [];
  const parts = text.split(/\n(?=\d+\.\s+)/);
  return parts
    .map((block) => {
      const trimmed = block.trim();
      const match = trimmed.match(/^(?:\d+\.\s*)?([^\n]+)\n?([\s\S]*)$/);
      if (!match) return null;
      return {
        title: asLocalized(String(match[1] || "").trim()),
        body: asLocalized(String(match[2] || "").trim()),
      };
    })
    .filter((s) => s && (localizedTitleEn(s.title) || localizedTitleEn(s.body)));
}

function asLegalSections(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => ({
      title: asLocalized(s?.title),
      body: asLocalized(s?.body),
    }))
    .filter((s) => localizedTitleEn(s.title) || localizedTitleEn(s.body));
}

const getLegal = asyncHandler(async (req, res) => {
  const { siteId, type } = req.params;
  if (!assertSite(siteId) || !["privacy", "terms"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const defaults = DEFAULT_LEGAL[type];
  let page = await LegalPage.findOne({ siteId, type });
  if (!page) {
    page = await LegalPage.create({
      siteId,
      type,
      title: asLocalized(defaults.title),
      subtitle: asLocalized(defaults.subtitle),
      updatedLabel: asLocalized(defaults.updatedLabel),
      sections: asLegalSections(defaults.sections),
      content: asLocalized(serializeLegalSections(defaults.sections)),
    });
  } else {
    let dirty = false;
    const nextTitle = mergeLocalized(page.title, defaults.title);
    const nextSubtitle = mergeLocalized(page.subtitle, defaults.subtitle);
    const nextUpdated = mergeLocalized(page.updatedLabel, defaults.updatedLabel);
    if (JSON.stringify(nextTitle) !== JSON.stringify(asLocalized(page.title))) {
      page.title = nextTitle;
      dirty = true;
    }
    if (
      JSON.stringify(nextSubtitle) !==
      JSON.stringify(asLocalized(page.subtitle))
    ) {
      page.subtitle = nextSubtitle;
      dirty = true;
    }
    if (
      JSON.stringify(nextUpdated) !==
      JSON.stringify(asLocalized(page.updatedLabel))
    ) {
      page.updatedLabel = nextUpdated;
      dirty = true;
    }

    let sections;
    if (!Array.isArray(page.sections) || page.sections.length === 0) {
      const fromContent = parseLegalSectionsFromContent(page.content);
      sections = fromContent.length
        ? fromContent
        : asLegalSections(defaults.sections);
      dirty = true;
    } else {
      sections = page.sections.map((s, i) => ({
        title: mergeLocalized(s?.title, defaults.sections[i]?.title || ""),
        body: mergeLocalized(s?.body, defaults.sections[i]?.body || ""),
      }));
      dirty = true;
    }
    page.sections = sections;

    if (!localizedTitleEn(page.content)) {
      page.content = asLocalized(serializeLegalSections(page.sections));
      dirty = true;
    }
    if (dirty) {
      page.markModified("sections");
      page.markModified("title");
      page.markModified("subtitle");
      page.markModified("updatedLabel");
      page.markModified("content");
      await page.save();
    }
  }

  return res.json({ success: true, page });
});

const updateLegal = asyncHandler(async (req, res) => {
  const { siteId, type } = req.params;
  if (!assertSite(siteId) || !["privacy", "terms"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const defaults = DEFAULT_LEGAL[type];
  let sections = asLegalSections(req.body.sections);
  if (!sections.length && req.body.content) {
    sections = parseLegalSectionsFromContent(req.body.content);
  }
  if (!sections.length) sections = asLegalSections(defaults.sections);

  const title = asLocalized(req.body.title || defaults.title);
  const subtitle = asLocalized(req.body.subtitle || defaults.subtitle);
  const updatedLabel = asLocalized(
    req.body.updatedLabel || defaults.updatedLabel
  );
  const content = asLocalized(
    req.body.content || serializeLegalSections(sections)
  );

  const page = await LegalPage.findOneAndUpdate(
    { siteId, type },
    {
      $set: {
        title,
        subtitle,
        updatedLabel,
        sections,
        content,
      },
    },
    { upsert: true, new: true }
  );

  return res.json({ success: true, page });
});

const listGallery = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  await ensureAllSiteDefaults(siteId).catch(() => {});
  let items = await GalleryItem.find({ siteId }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  
  // Fix: Ensure all tagging fields exist
  items = items.map(item => {
    const obj = item.toObject();
    if (obj.indexable === undefined) {
      obj.indexable = false;
    }
    return obj;
  });
  
  return res.json({ success: true, items });
});

function galleryProjectFieldsFromBody(body = {}) {
  return {
    locationTag: String(body.locationTag || "").trim(),
    layoutTag: String(body.layoutTag || "").trim(),
    styleTag: String(body.styleTag || "").trim(),
    materialTag: String(body.materialTag || "").trim(),
    propertyType: String(body.propertyType || "").trim(),
    projectTitle: String(body.projectTitle || "").trim(),
    projectDesc: String(body.projectDesc || "").trim().slice(0, 300),
  };
}

const createGalleryItem = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const rawFilter = String(req.body.filter || "Style & Color").trim().slice(0, 80);
  const project = galleryProjectFieldsFromBody(req.body);
  const item = await GalleryItem.create({
    siteId,
    title: asLocalized(req.body.title || "Gallery image"),
    image: sanitizeMediaUrl(req.body.image),
    filter: rawFilter || "Style & Color",
    tall: Boolean(req.body.tall),
    wide: Boolean(req.body.wide),
    sortOrder: Number(req.body.sortOrder) || 0,
    ...project,
  });
  return res.status(201).json({ success: true, item });
});

const updateGalleryItem = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const rawFilter = String(req.body.filter || "Style & Color").trim().slice(0, 80);
  const project = galleryProjectFieldsFromBody(req.body);
  const item = await GalleryItem.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title: asLocalized(req.body.title || "Gallery image"),
        image: sanitizeMediaUrl(req.body.image),
        filter: rawFilter || "Style & Color",
        tall: Boolean(req.body.tall),
        wide: Boolean(req.body.wide),
        sortOrder: Number(req.body.sortOrder) || 0,
        ...project,
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, item });
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await GalleryItem.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const listCatalogues = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const items = await CatalogueItem.find({ siteId }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  return res.json({ success: true, items });
});

const createCatalogue = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const item = await CatalogueItem.create({
    siteId,
    title: String(req.body.title || "").trim() || "Catalogue",
    category: String(req.body.category || ""),
    image: sanitizeMediaUrl(req.body.image),
    pdfUrl: String(req.body.pdfUrl || ""),
    fileName: String(req.body.fileName || ""),
    downloadName: String(req.body.downloadName || ""),
    sortOrder: Number(req.body.sortOrder) || 0,
  });
  return res.status(201).json({ success: true, item });
});

const updateCatalogue = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await CatalogueItem.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title: String(req.body.title || "").trim() || "Catalogue",
        category: String(req.body.category || ""),
        image: sanitizeMediaUrl(req.body.image),
        pdfUrl: String(req.body.pdfUrl || ""),
        fileName: String(req.body.fileName || ""),
        downloadName: String(req.body.downloadName || ""),
        sortOrder: Number(req.body.sortOrder) || 0,
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, item });
});

const deleteCatalogue = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await CatalogueItem.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const listFaqs = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  await ensureAllSiteDefaults(siteId).catch(() => {});
  const items = await FaqItem.find({ siteId }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  return res.json({ success: true, items });
});

const createFaq = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const question = asLocalized(req.body.question);
  if (!localizedTitleEn(question)) {
    return res.status(400).json({ success: false, message: "Question required" });
  }
  const item = await FaqItem.create({
    siteId,
    question,
    answer: asLocalized(req.body.answer),
    sortOrder: Number(req.body.sortOrder) || 0,
  });
  return res.status(201).json({ success: true, item });
});

const updateFaq = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const question = asLocalized(req.body.question);
  if (!localizedTitleEn(question)) {
    return res.status(400).json({ success: false, message: "Question required" });
  }
  const item = await FaqItem.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        question,
        answer: asLocalized(req.body.answer),
        sortOrder: Number(req.body.sortOrder) || 0,
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, item });
});

const deleteFaq = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await FaqItem.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

/**
 * Safe CMS sync against the currently connected MongoDB.
 * - Never deletes custom content
 * - Never overwrites existing category/product/blog/gallery/faq rows
 * - Only seeds empty collections + missing taxonomy rows
 * - Fills missing home section keys (enrich) without wiping filled fields
 */
const syncSite = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  if (siteId !== "thailand-kitchen") {
    return res.status(400).json({
      success: false,
      message: "Sync is available for Thailand Kitchen only",
    });
  }

  const mongoose = require("mongoose");
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database not connected. Check backend MongoDB and try again.",
    });
  }

  const before = {
    categories: await Category.countDocuments({ siteId }),
    products: await Product.countDocuments({ siteId }),
    blogs: await Blog.countDocuments({ siteId }),
    gallery: await GalleryItem.countDocuments({ siteId }),
    faqs: await FaqItem.countDocuments({ siteId }),
    catalogues: await CatalogueItem.countDocuments({ siteId }),
    home: Boolean(await HomePage.exists({ siteId })),
  };

  const { syncGalleryMissingOnly } = require("../scripts/syncGallerySafe");
  const { syncBlogsMissingOnly } = require("../scripts/syncBlogsSafe");
  const { syncProductsMissingOnly } = require("../scripts/syncProductsSafe");
  const { syncFaqsMissingOnly } = require("../scripts/syncFaqsSafe");

  await ensureDefaultGallery(siteId);

  const [gallerySync, blogSync, productSync, faqSync] = await Promise.all([
    syncGalleryMissingOnly(siteId, DEFAULT_GALLERY),
    syncBlogsMissingOnly(siteId, DEFAULT_BLOGS),
    syncProductsMissingOnly(siteId, DEFAULT_PRODUCTS, DEFAULT_FEATURE_HIGHLIGHTS),
    syncFaqsMissingOnly(siteId, DEFAULT_FAQS),
  ]);

  // Backfill product highlights + gallery for existing rows
  await ensureDefaultProducts(siteId);

  // Taxonomy: create missing rows only — never overwrite edited categories
  const { syncTaxonomyMissingOnly } = require("../scripts/syncTaxonomySafe");
  const taxonomy = await syncTaxonomyMissingOnly(siteId);

  // Fill empty landing templates (services/materials/kitchens) without overwriting edited content
  const {
    seedEmptyCategoryLandingSections,
    repairCorruptCmsContent,
  } = require("../scripts/repairThailandTaxonomyLib");
  const repaired = await repairCorruptCmsContent(siteId).catch(() => ({
    homeHubsRepaired: 0,
    categoriesRepaired: 0,
    mediaUrlsNormalized: 0,
  }));
  const landingsSeeded = await seedEmptyCategoryLandingSections(siteId).catch(
    () => 0
  );

  const { repairAllThailandLocales } = require("../scripts/repairThailandLocales");
  const localeRepair = await repairAllThailandLocales(siteId, {
    productDefaults: DEFAULT_PRODUCTS,
    galleryDefaults: DEFAULT_GALLERY,
  }).catch(() => ({
    products: { repaired: 0, total: 0 },
    categories: { repaired: 0, total: 0 },
    gallery: { repaired: 0, total: 0 },
    faqs: { repaired: 0, total: 0 },
    blogs: { repaired: 0, total: 0 },
    totalRepaired: 0,
  }));

  localesRepaired.add(siteId);

  // Allow ensureDefaultCategories cache to refresh next list call
  taxonomyRepaired.delete(siteId);
  taxonomyRepaired.add(siteId);

  // Home: enrich missing keys / normalize locales, keep existing copy
  let home = await HomePage.findOne({ siteId });
  if (!home) {
    home = await HomePage.create({
      siteId,
      sections: structuredClone(DEFAULT_HOME_SECTIONS),
    });
  }
  const beforeHome = JSON.stringify(home.sections || {});
  const sections = enrichHomeSections(home.sections || {});
  const afterHome = JSON.stringify(sections);
  let homeUpdated = false;
  if (beforeHome !== afterHome) {
    home.sections = sections;
    home.markModified("sections");
    await home.save();
    homeUpdated = true;
  }

  // Legal pages — create only if missing (same shape as getLegal)
  let legalCreated = 0;
  for (const type of ["privacy", "terms"]) {
    const exists = await LegalPage.exists({ siteId, type });
    if (!exists) {
      const defaults = DEFAULT_LEGAL[type];
      await LegalPage.create({
        siteId,
        type,
        title: asLocalized(defaults.title),
        subtitle: asLocalized(defaults.subtitle),
        updatedLabel: asLocalized(defaults.updatedLabel),
        sections: asLegalSections(defaults.sections),
        content: asLocalized(serializeLegalSections(defaults.sections)),
      });
      legalCreated += 1;
    }
  }

  const after = {
    categories: await Category.countDocuments({ siteId }),
    products: await Product.countDocuments({ siteId }),
    blogs: await Blog.countDocuments({ siteId }),
    gallery: await GalleryItem.countDocuments({ siteId }),
    faqs: await FaqItem.countDocuments({ siteId }),
    catalogues: await CatalogueItem.countDocuments({ siteId }),
    home: true,
  };

  const [
    servicesMenu,
    materialsMenu,
    locationsMenu,
    locationServices,
    galleryTotal,
    guidesTotal,
    productsTotal,
    faqsTotal,
  ] = await Promise.all([
    Category.countDocuments({
      siteId,
      categoryType: "service",
      $or: [{ parentId: null }, { parentId: { $exists: false } }],
    }),
    Category.countDocuments({
      siteId,
      categoryType: "material",
      $or: [{ parentId: null }, { parentId: { $exists: false } }],
    }),
    Category.countDocuments({
      siteId,
      categoryType: "location",
      $or: [{ parentId: null }, { parentId: { $exists: false } }],
    }),
    Category.countDocuments({
      siteId,
      categoryType: "service",
      parentId: { $ne: null, $exists: true },
    }),
    GalleryItem.countDocuments({ siteId }),
    Blog.countDocuments({ siteId }),
    Product.countDocuments({ siteId }),
    FaqItem.countDocuments({ siteId }),
  ]);

  const dbName =
    mongoose.connection.name ||
    mongoose.connection.db?.databaseName ||
    "connected";

  return res.json({
    success: true,
    message: "Synced from connected database. Existing content was preserved.",
    report: {
      database: dbName,
      host: mongoose.connection.host || "unknown",
      siteId,
      before,
      after,
      added: {
        categories: Math.max(0, after.categories - before.categories),
        products: Math.max(0, after.products - before.products),
        blogs: Math.max(0, after.blogs - before.blogs),
        gallery: Math.max(0, after.gallery - before.gallery),
        faqs: Math.max(0, after.faqs - before.faqs),
        catalogues: Math.max(0, after.catalogues - before.catalogues),
        legal: legalCreated,
        landings: landingsSeeded,
      },
      taxonomy,
      gallerySync,
      blogSync,
      productSync,
      faqSync,
      homeUpdated,
      landingsSeeded,
      repaired,
      localeRepair,
      nav: {
        servicesMenu,
        materialsMenu,
        locationsMenu,
        locationServices,
        galleryTotal,
        guidesTotal,
        productsTotal,
        faqsTotal,
        categoriesTotal: after.categories,
      },
      preserved: true,
    },
  });
});

module.exports = {
  listSites,
  getHome,
  updateHome,
  resetHome,
  syncSite,
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getLegal,
  updateLegal,
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  listCatalogues,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
};
