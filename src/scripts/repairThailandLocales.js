/**
 * Non-destructive locale repair for Thailand Kitchen CMS.
 * Fills empty th/pl from seed defaults; normalizes legacy plain strings.
 */
const { Product, Category, GalleryItem, FaqItem, Blog, HomePage } = require("../model/cmsModels");
const { THAILAND_TAXONOMY } = require("../seed/thailandTaxonomy");
const {
  DEFAULT_FEATURE_HIGHLIGHTS,
  DEFAULT_FAQS,
  DEFAULT_CATEGORIES,
} = require("../seed/thailandSiteDefaults");
const { asLocalized, mergeLocalizedFillEmpty, mergeLocalized, fillEmptyLocalesFromEn } = require("../utils/localized");

const PRODUCT_TEXT_FIELDS = [
  "title",
  "subtitle",
  "productType",
  "sectionTag",
  "description",
  "contactEyebrow",
  "contactTitle",
  "contactFormTitle",
  "category",
  "finish",
  "material",
  "style",
  "color",
];

function titleEn(value) {
  const map = asLocalized(value);
  return map.en || map.th || map.pl || "";
}

async function safeSave(doc) {
  try {
    await doc.save();
    return true;
  } catch (err) {
    console.warn(
      `[locale-repair] skip ${doc.constructor.modelName} ${doc._id}: ${err.message}`
    );
    return false;
  }
}

function categoryLabelFallback(enLabel) {
  const needle = String(enLabel || "").trim().toLowerCase();
  if (!needle) return null;
  for (const row of DEFAULT_CATEGORIES) {
    const map = asLocalized(row.title);
    if (
      map.en.toLowerCase() === needle ||
      map.th.toLowerCase() === needle ||
      map.pl.toLowerCase() === needle
    ) {
      return row.title;
    }
  }
  return null;
}

function repairHighlightList(current, seedList = DEFAULT_FEATURE_HIGHLIGHTS) {
  const cur = Array.isArray(current) ? current : [];
  if (!cur.length) return seedList.map((s) => ({ ...s }));

  return cur.map((item, index) => {
    const seed = seedList[index] || seedList[0];
    return {
      title: mergeLocalizedFillEmpty(item?.title, seed?.title),
      description: mergeLocalizedFillEmpty(item?.description, seed?.description),
    };
  });
}

function repairProductRow(product, seed) {
  let dirty = false;

  for (const field of PRODUCT_TEXT_FIELDS) {
    const before = JSON.stringify(product[field]);
    let fallback = seed?.[field];

    if (field === "category" && !fallback) {
      fallback = categoryLabelFallback(titleEn(product[field]));
    }

    product[field] = fillEmptyLocalesFromEn(
      fallback
        ? mergeLocalized(product[field], fallback)
        : asLocalized(product[field])
    );

    if (JSON.stringify(product[field]) !== before) dirty = true;
  }

  const highlightsBefore = JSON.stringify(product.featureHighlights || []);
  product.featureHighlights = repairHighlightList(
    product.featureHighlights,
    seed?.featureHighlights || DEFAULT_FEATURE_HIGHLIGHTS
  ).map((row) => ({
    title: fillEmptyLocalesFromEn(row.title),
    description: fillEmptyLocalesFromEn(row.description),
  }));
  if (JSON.stringify(product.featureHighlights) !== highlightsBefore) dirty = true;

  return dirty;
}

async function repairProductLocales(siteId, productDefaults = []) {
  const products = await Product.find({ siteId });
  let repaired = 0;

  for (const product of products) {
    const seed = productDefaults.find(
      (row) =>
        String(row.slug || "").trim().toLowerCase() ===
        String(product.slug || "").trim().toLowerCase()
    );
    const dirty = repairProductRow(product, seed);
    if (dirty) {
      product.markModified("featureHighlights");
      if (await safeSave(product)) repaired += 1;
    }
  }

  return {
    repaired,
    total: products.length,
  };
}

function taxonomyFallback(slug, categoryType, parentSlug) {
  return THAILAND_TAXONOMY.find((row) => {
    if (row.slug !== slug || row.categoryType !== categoryType) return false;
    if (parentSlug) return row.parentSlug === parentSlug;
    return !row.parentSlug;
  });
}

async function repairCategoryLocales(siteId) {
  const categories = await Category.find({ siteId });
  const locations = await Category.find({
    siteId,
    categoryType: "location",
    parentId: null,
  }).select("_id slug");
  const locationById = new Map(locations.map((l) => [String(l._id), l.slug]));

  let repaired = 0;
  for (const cat of categories) {
    let dirty = false;
    const parentSlug =
      cat.parentId != null ? locationById.get(String(cat.parentId)) : undefined;
    const seed = taxonomyFallback(cat.slug, cat.categoryType, parentSlug);

    const mergeField = (field, fallback) => {
      if (!fallback) {
        const normalized = asLocalized(cat[field]);
        if (JSON.stringify(normalized) !== JSON.stringify(cat[field])) {
          cat[field] = normalized;
          dirty = true;
        }
        return;
      }
      const before = JSON.stringify(cat[field]);
      cat[field] = mergeLocalizedFillEmpty(cat[field], fallback);
      if (JSON.stringify(cat[field]) !== before) dirty = true;
    };

    mergeField("title", seed?.title);
    mergeField("description", seed?.description);
    mergeField("eyebrow", seed?.eyebrow);
    mergeField("ctaLabel", seed?.ctaLabel);
    mergeField("footerCtaHeading", seed?.footerCtaHeading);
    mergeField("footerCtaBody", seed?.footerCtaBody);

    for (const field of [
      "title",
      "description",
      "eyebrow",
      "ctaLabel",
      "footerCtaHeading",
      "footerCtaBody",
    ]) {
      if (cat[field]) {
        const before = JSON.stringify(cat[field]);
        cat[field] = fillEmptyLocalesFromEn(cat[field]);
        if (JSON.stringify(cat[field]) !== before) dirty = true;
      }
    }

    const asPlain = (value) => {
      if (typeof value === "string") return value.trim();
      if (value && typeof value === "object") {
        return String(value.en || value.th || value.pl || "").trim();
      }
      return "";
    };
    const metaTitle = asPlain(cat.metaTitle) || asPlain(seed?.metaTitle);
    const metaDescription =
      asPlain(cat.metaDescription) || asPlain(seed?.metaDescription);
    if (String(cat.metaTitle || "") !== metaTitle) {
      cat.metaTitle = metaTitle.slice(0, 60);
      dirty = true;
    }
    if (String(cat.metaDescription || "") !== metaDescription) {
      cat.metaDescription = metaDescription.slice(0, 160);
      dirty = true;
    }

    if (Array.isArray(cat.sections)) {
      const nextSections = cat.sections.map((block) => ({
        ...block,
        heading: fillEmptyLocalesFromEn(
          mergeLocalizedFillEmpty(block?.heading, block?.heading)
        ),
        body: fillEmptyLocalesFromEn(
          mergeLocalizedFillEmpty(block?.body, block?.body)
        ),
      }));
      if (JSON.stringify(nextSections) !== JSON.stringify(cat.sections)) {
        cat.sections = nextSections;
        dirty = true;
      }
    }

    if (dirty) {
      cat.markModified("sections");
      if (await safeSave(cat)) repaired += 1;
    }
  }

  return { repaired, total: categories.length };
}

async function repairGalleryLocales(siteId, galleryDefaults = []) {
  const items = await GalleryItem.find({ siteId });
  let repaired = 0;

  for (const item of items) {
    const en = titleEn(item.title);
    const seed = galleryDefaults.find(
      (row) => String(row.title || "").trim().toLowerCase() === en.toLowerCase()
    );
    const before = JSON.stringify(item.title);
    item.title = fillEmptyLocalesFromEn(
      seed
        ? mergeLocalizedFillEmpty(item.title, asLocalized(seed.title))
        : asLocalized(item.title)
    );
    let dirty = JSON.stringify(item.title) !== before;
    if (!String(item.image || "").trim()) {
      item.image = String(seed?.image || "").trim() || "/products/Kitchen1.png";
      dirty = true;
    }
    if (dirty && (await safeSave(item))) repaired += 1;
  }

  return { repaired, total: items.length };
}

async function repairFaqLocales(siteId) {
  const items = await FaqItem.find({ siteId });
  let repaired = 0;

  for (const item of items) {
    let dirty = false;
    const enQ = titleEn(item.question);
    const seed = DEFAULT_FAQS.find(
      (row) => titleEn(row.question).toLowerCase() === enQ.toLowerCase()
    );

    const qBefore = JSON.stringify(item.question);
    item.question = fillEmptyLocalesFromEn(
      seed
        ? mergeLocalizedFillEmpty(item.question, seed.question)
        : asLocalized(item.question)
    );
    if (JSON.stringify(item.question) !== qBefore) dirty = true;

    const aBefore = JSON.stringify(item.answer);
    item.answer = fillEmptyLocalesFromEn(
      seed
        ? mergeLocalizedFillEmpty(item.answer, seed.answer)
        : asLocalized(item.answer)
    );
    if (JSON.stringify(item.answer) !== aBefore) dirty = true;

    if (dirty && (await safeSave(item))) repaired += 1;
  }

  return { repaired, total: items.length };
}

async function repairBlogLocales(siteId) {
  const blogs = await Blog.find({ siteId });
  let repaired = 0;

  for (const blog of blogs) {
    let dirty = false;
    const translations = blog.translations || {};

    for (const locale of ["th", "pl"]) {
      const entry =
        translations[locale] && typeof translations[locale] === "object"
          ? { ...translations[locale] }
          : {};

      const fillFromBase = (key, baseValue) => {
        const current = String(entry[key] || "").trim();
        if (current) return;
        const base = String(baseValue || "").trim();
        if (!base) return;
        entry[key] = base;
        dirty = true;
      };

      fillFromBase("title", blog.title);
      fillFromBase("excerpt", blog.excerpt);
      fillFromBase("category", blog.category);
      fillFromBase("highlightTitle", blog.highlightTitle);
      fillFromBase("highlightText", blog.highlightText);
      fillFromBase("quote", blog.quote);
      fillFromBase("quoteAuthor", blog.quoteAuthor);

      if (!Array.isArray(entry.bodySections) || !entry.bodySections.length) {
        if (Array.isArray(blog.bodySections) && blog.bodySections.length) {
          entry.bodySections = blog.bodySections.map((s) => ({
            title: String(s?.title || "").trim(),
            content: String(s?.content || "").trim(),
            image: String(s?.image || "").trim(),
          }));
          dirty = true;
        }
      }

      translations[locale] = entry;
    }

    if (!String(blog.image || "").trim()) {
      const fromGallery = (blog.gallery || []).find((g) => String(g || "").trim());
      const fromSection = (blog.bodySections || []).find((s) =>
        String(s?.image || "").trim()
      );
      blog.image =
        String(fromGallery || fromSection?.image || "").trim() ||
        "/products/Kitchen1.png";
      dirty = true;
    }

    if (dirty) {
      blog.translations = translations;
      blog.markModified("translations");
      if (await safeSave(blog)) repaired += 1;
    }
  }

  return { repaired, total: blogs.length };
}

async function repairHomeLocales(siteId) {
  const { normalizeLocalizedHomeSections } = require("../utils/normalizeLocalizedHome");

  function deepFillLocales(value) {
    if (value == null) return value;
    if (Array.isArray(value)) return value.map(deepFillLocales);
    if (typeof value !== "object") return value;
    if ("en" in value || "th" in value || "pl" in value) {
      return fillEmptyLocalesFromEn(value);
    }
    const next = {};
    for (const [key, entry] of Object.entries(value)) {
      next[key] = deepFillLocales(entry);
    }
    return next;
  }

  const home = await HomePage.findOne({ siteId });
  if (!home) return { repaired: 0, total: 0 };

  const before = JSON.stringify(home.sections || {});
  home.sections = deepFillLocales(
    normalizeLocalizedHomeSections(home.sections || {})
  );
  const after = JSON.stringify(home.sections || {});

  if (before !== after) {
    home.markModified("sections");
    if (await safeSave(home)) return { repaired: 1, total: 1 };
  }

  return { repaired: 0, total: 1 };
}

async function repairAllThailandLocales(siteId, options = {}) {
  const productDefaults = options.productDefaults || [];
  const galleryDefaults = options.galleryDefaults || [];

  const [home, products, categories, gallery, faqs, blogs] = await Promise.all([
    repairHomeLocales(siteId),
    repairProductLocales(siteId, productDefaults),
    repairCategoryLocales(siteId),
    repairGalleryLocales(siteId, galleryDefaults),
    repairFaqLocales(siteId),
    repairBlogLocales(siteId),
  ]);

  return {
    home,
    products,
    categories,
    gallery,
    faqs,
    blogs,
    totalRepaired:
      home.repaired +
      products.repaired +
      categories.repaired +
      gallery.repaired +
      faqs.repaired +
      blogs.repaired,
  };
}

module.exports = {
  repairProductLocales,
  repairCategoryLocales,
  repairGalleryLocales,
  repairFaqLocales,
  repairBlogLocales,
  repairHomeLocales,
  repairAllThailandLocales,
  categoryLabelFallback,
};
