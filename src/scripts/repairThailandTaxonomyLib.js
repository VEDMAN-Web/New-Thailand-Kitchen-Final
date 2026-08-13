/**
 * Upsert full Thailand Kitchen SEO category taxonomy (idempotent).
 * Also seeds empty landing sections for kitchens + services + materials (non-destructive).
 */
const { Category, HomePage } = require("../model/cmsModels");
const { THAILAND_TAXONOMY } = require("../seed/thailandTaxonomy");
const {
  buildDefaultCategorySections,
  defaultFooterCta,
  defaultEyebrowForType,
  sectionsAreEmpty,
  titleEn,
} = require("../seed/categoryPageTemplates");
const { asLocalized } = require("../utils/localized");
const {
  sectionsContainProbe,
  sanitizeMediaUrl,
  sanitizeMediaUrlsDeep,
  repairHubPages,
} = require("../utils/cmsContentGuard");
const { DEFAULT_HOME_SECTIONS } = require("../seed/thailandSiteDefaults");

/** Category types that get full landing templates (hero + sections + footer CTA). */
const LANDING_CATEGORY_TYPES = [
  "layout",
  "style",
  "property-type",
  "service",
  "material",
  "built-in-furniture",
];

async function seedEmptyCategoryLandingSections(siteId) {
  const cats = await Category.find({
    siteId,
    categoryType: { $in: LANDING_CATEGORY_TYPES },
  });

  let seeded = 0;
  for (const cat of cats) {
    let dirty = false;

    if (sectionsAreEmpty(cat.sections) || sectionsContainProbe(cat.sections)) {
      cat.sections = buildDefaultCategorySections({
        title: cat.title,
        description: cat.description,
        image: cat.image,
        categoryType: cat.categoryType,
        slug: cat.slug,
      });
      cat.markModified("sections");
      dirty = true;
    }

    const normalizedImage = sanitizeMediaUrl(cat.image);
    if (normalizedImage !== String(cat.image || "")) {
      cat.image = normalizedImage;
      dirty = true;
    }

    if (Array.isArray(cat.sections) && cat.sections.length) {
      let sectionsDirty = false;
      cat.sections = cat.sections.map((block) => {
        const nextImage = sanitizeMediaUrl(block?.image);
        if (nextImage !== String(block?.image || "")) {
          sectionsDirty = true;
          return { ...block.toObject?.() || block, image: nextImage };
        }
        return block;
      });
      if (sectionsDirty) {
        cat.markModified("sections");
        dirty = true;
      }
    }

    const eyebrowEn = titleEn(cat.eyebrow);
    if (!eyebrowEn) {
      cat.eyebrow = defaultEyebrowForType(cat.categoryType);
      cat.markModified("eyebrow");
      dirty = true;
    }

    const ctaEn = titleEn(cat.ctaLabel);
    if (!ctaEn) {
      cat.ctaLabel = asLocalized("Request a consultation");
      if (!String(cat.ctaHref || "").trim()) cat.ctaHref = "/contact";
      cat.markModified("ctaLabel");
      dirty = true;
    }

    if (!titleEn(cat.footerCtaHeading) || !titleEn(cat.footerCtaBody)) {
      const footer = defaultFooterCta(cat.title);
      if (!titleEn(cat.footerCtaHeading)) {
        cat.footerCtaHeading = footer.footerCtaHeading;
        cat.markModified("footerCtaHeading");
        dirty = true;
      }
      if (!titleEn(cat.footerCtaBody)) {
        cat.footerCtaBody = footer.footerCtaBody;
        cat.markModified("footerCtaBody");
        dirty = true;
      }
    }

    if (dirty) {
      await cat.save();
      seeded += 1;
    }
  }

  return seeded;
}

/** Remove smoke-test probe strings and localhost media URLs from CMS records. */
async function repairCorruptCmsContent(siteId = "thailand-kitchen") {
  const defaults = structuredClone(DEFAULT_HOME_SECTIONS);
  let homeHubsRepaired = 0;
  let categoriesRepaired = 0;
  let mediaUrlsNormalized = 0;

  const home = await HomePage.findOne({ siteId });
  if (home) {
    const before = JSON.stringify(home.sections || {});
    const sections = sanitizeMediaUrlsDeep(home.sections || {});
    const hadLocalhost = before.includes("127.0.0.1") || before.includes("localhost:5000");

    if (sections.hubPages) {
      const repaired = repairHubPages(sections.hubPages, defaults.hubPages || {});
      if (JSON.stringify(repaired) !== JSON.stringify(sections.hubPages)) {
        homeHubsRepaired += 1;
      }
      sections.hubPages = repaired;
    }

    const after = JSON.stringify(sections);
    if (before !== after) {
      home.sections = sections;
      home.markModified("sections");
      await home.save();
      if (hadLocalhost) mediaUrlsNormalized += 1;
    }
  }

  categoriesRepaired = await seedEmptyCategoryLandingSections(siteId);

  return {
    homeHubsRepaired,
    categoriesRepaired,
    mediaUrlsNormalized,
  };
}

/** @deprecated Use seedEmptyCategoryLandingSections */
async function seedEmptyKitchenLandingSections(siteId) {
  return seedEmptyCategoryLandingSections(siteId);
}

async function repairThailandTaxonomy(siteId = "thailand-kitchen") {
  const removed = await Category.deleteMany({
    siteId,
    $or: [
      { slug: { $in: [null, ""] } },
      { categoryType: { $in: [null, ""] } },
    ],
  });

  const locationIds = {};
  let upserted = 0;

  for (const row of THAILAND_TAXONOMY.filter((r) => !r.parentSlug)) {
    const doc = await Category.findOneAndUpdate(
      { siteId, categoryType: row.categoryType, slug: row.slug, parentId: null },
      {
        $set: {
          siteId,
          title: row.title,
          description: row.description,
          image: row.image,
          icon: "",
          slug: row.slug,
          categoryType: row.categoryType,
          parentId: null,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          canonicalUrl: "",
          indexable: row.indexable,
        },
      },
      { upsert: true, new: true }
    );
    if (row.categoryType === "location") {
      locationIds[row.slug] = doc._id;
    }
    upserted += 1;
  }

  for (const row of THAILAND_TAXONOMY.filter((r) => r.parentSlug)) {
    const parentId = locationIds[row.parentSlug];
    if (!parentId) continue;
    await Category.findOneAndUpdate(
      { siteId, categoryType: row.categoryType, slug: row.slug, parentId },
      {
        $set: {
          siteId,
          title: row.title,
          description: row.description,
          image: row.image,
          icon: "",
          slug: row.slug,
          categoryType: row.categoryType,
          parentId,
          metaTitle: row.metaTitle,
          metaDescription: row.metaDescription,
          canonicalUrl: "",
          indexable: row.indexable,
        },
      },
      { upsert: true }
    );
    upserted += 1;
  }

  const sectionsSeeded = await seedEmptyCategoryLandingSections(siteId);

  return {
    removed: removed.deletedCount,
    upserted,
    sectionsSeeded,
    total: await Category.countDocuments({ siteId }),
    withSlug: await Category.countDocuments({
      siteId,
      slug: { $type: "string", $ne: "" },
      categoryType: { $type: "string", $ne: "" },
    }),
  };
}

module.exports = {
  repairThailandTaxonomy,
  seedEmptyCategoryLandingSections,
  seedEmptyKitchenLandingSections,
  repairCorruptCmsContent,
};
