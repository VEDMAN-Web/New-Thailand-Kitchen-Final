/**
 * Safe product sync — creates missing seed products only (by slug).
 * Never overwrites existing product rows.
 */
const { Product } = require("../model/cmsModels");
const { asLocalized } = require("../utils/localized");
const { categoryLabelFallback } = require("./repairThailandLocales");

function localizeProductField(field, value) {
  if (field === "category") {
    return asLocalized(categoryLabelFallback(value) || value);
  }
  return asLocalized(value);
}

function localizeHighlights(rows = []) {
  return rows.map((item) => ({
    title: asLocalized(item?.title),
    description: asLocalized(item?.description),
  }));
}

async function syncProductsMissingOnly(siteId, defaults = [], featureHighlights = []) {
  let created = 0;
  let existing = 0;

  const rows = await Product.find({ siteId }).select("slug").lean();
  const existingSlugs = new Set(
    rows.map((p) => String(p.slug || "").trim().toLowerCase())
  );

  for (const p of defaults) {
    const slug = String(p.slug || "").trim().toLowerCase();
    if (!slug) continue;

    if (existingSlugs.has(slug)) {
      existing += 1;
      continue;
    }

    await Product.create({
      siteId,
      title: localizeProductField("title", p.title),
      slug: p.slug,
      subtitle: localizeProductField("subtitle", p.subtitle || ""),
      productType: localizeProductField("productType", p.productType || ""),
      sectionTag: localizeProductField("sectionTag", p.sectionTag || ""),
      description: localizeProductField("description", p.description || ""),
      image: p.image || "",
      icon: "",
      gallery: p.gallery || [],
      pdfUrl: "",
      featureHighlights: localizeHighlights(
        p.featureHighlights || featureHighlights
      ),
      category: localizeProductField("category", p.category || ""),
      featured: Boolean(p.featured),
    });
    existingSlugs.add(slug);
    created += 1;
  }

  return {
    created,
    existing,
    total: await Product.countDocuments({ siteId }),
  };
}

module.exports = { syncProductsMissingOnly };
