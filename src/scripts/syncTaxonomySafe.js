/**
 * Safe taxonomy sync — creates missing category rows only.
 * Never overwrites titles/descriptions/sections of existing categories.
 */
const { Category, CmsDeletion } = require("../model/cmsModels");
const { THAILAND_TAXONOMY } = require("../seed/thailandTaxonomy");

async function syncTaxonomyMissingOnly(siteId = "thailand-kitchen") {
  const locationIds = {};
  let created = 0;
  let existing = 0;
  const deletedRows = await CmsDeletion.find({ siteId, resource: "categories" })
    .select("key")
    .lean();
  const deletedKeys = new Set(deletedRows.map((row) => String(row.key || "")));
  const categoryKey = (categoryType, slug, parentId = null) =>
    `${categoryType}:${String(slug || "").trim().toLowerCase()}:${parentId || "root"}`;
  if (process.env.NODE_ENV !== "production") {
    console.info("[cms.syncTaxonomy] deletion markers", {
      siteId,
      deletedCount: deletedKeys.size,
    });
  }

  for (const row of THAILAND_TAXONOMY.filter((r) => !r.parentSlug)) {
    const found = await Category.findOne({
      siteId,
      categoryType: row.categoryType,
      slug: row.slug,
      parentId: null,
    }).select("_id");

    if (found) {
      existing += 1;
      if (row.categoryType === "location") {
        locationIds[row.slug] = found._id;
      }
      continue;
    }
    if (deletedKeys.has(categoryKey(row.categoryType, row.slug))) continue;

    const doc = await Category.create({
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
      sections: [],
      eyebrow: { en: "", th: "", pl: "" },
      ctaLabel: { en: "", th: "", pl: "" },
      ctaHref: "/contact",
    });
    created += 1;
    if (row.categoryType === "location") {
      locationIds[row.slug] = doc._id;
    }
  }

  // Load any existing locations not just created (for child parents)
  const locations = await Category.find({
    siteId,
    categoryType: "location",
    parentId: null,
  }).select("_id slug");
  for (const loc of locations) {
    locationIds[loc.slug] = loc._id;
  }

  for (const row of THAILAND_TAXONOMY.filter((r) => r.parentSlug)) {
    const parentId = locationIds[row.parentSlug];
    if (!parentId) continue;

    const found = await Category.findOne({
      siteId,
      categoryType: row.categoryType,
      slug: row.slug,
      parentId,
    }).select("_id");

    if (found) {
      existing += 1;
      continue;
    }
    if (deletedKeys.has(categoryKey(row.categoryType, row.slug, parentId))) continue;

    await Category.create({
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
      sections: [],
      eyebrow: { en: "", th: "", pl: "" },
      ctaLabel: { en: "", th: "", pl: "" },
      ctaHref: "/contact",
    });
    created += 1;
  }

  return {
    created,
    existing,
    total: await Category.countDocuments({ siteId }),
  };
}

module.exports = { syncTaxonomyMissingOnly };
