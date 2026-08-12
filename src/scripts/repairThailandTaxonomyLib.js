/**
 * Upsert full Thailand Kitchen SEO category taxonomy (idempotent).
 */
const { Category } = require("../model/cmsModels");
const { THAILAND_TAXONOMY } = require("../seed/thailandTaxonomy");

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

  return {
    removed: removed.deletedCount,
    upserted,
    total: await Category.countDocuments({ siteId }),
    withSlug: await Category.countDocuments({
      siteId,
      slug: { $type: "string", $ne: "" },
      categoryType: { $type: "string", $ne: "" },
    }),
  };
}

module.exports = { repairThailandTaxonomy };
