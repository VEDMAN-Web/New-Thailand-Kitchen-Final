/**
 * Ensures Thailand Kitchen SEO IA fixtures:
 * - location: bangkok
 * - service under that location: kitchen-renovation
 * Run: node src/scripts/ensureSeoFixtures.js
 */
require("dotenv").config();
const ConnectDB = require("../config/db");
const { Category } = require("../model/cmsModels");

const SITE_ID = "thailand-kitchen";

async function upsertCategory(filter, data) {
  const existing = await Category.findOne(filter);
  if (existing) {
    Object.assign(existing, data);
    await existing.save();
    return existing;
  }
  return Category.create({ ...filter, ...data });
}

async function main() {
  await ConnectDB();

  const bangkok = await upsertCategory(
    { siteId: SITE_ID, categoryType: "location", slug: "bangkok" },
    {
      title: { en: "Bangkok", th: "", pl: "" },
      description: {
        en: "Custom kitchens and built-in furniture across Bangkok.",
        th: "",
        pl: "",
      },
      image: "",
      metaTitle: "Kitchens in Bangkok | Thailand Kitchens",
      metaDescription:
        "Design, supply and install custom kitchens in Bangkok with Thailand Kitchens.",
      canonicalUrl: "",
      indexable: true,
      parentId: null,
    }
  );

  const service = await upsertCategory(
    {
      siteId: SITE_ID,
      categoryType: "service",
      slug: "kitchen-renovation",
    },
    {
      title: { en: "Kitchen Renovation", th: "", pl: "" },
      description: {
        en: "Full kitchen renovation services for Bangkok homes.",
        th: "",
        pl: "",
      },
      image: "",
      metaTitle: "Kitchen Renovation Bangkok | Thailand Kitchens",
      metaDescription:
        "Kitchen renovation in Bangkok — design, materials and installation by Thailand Kitchens.",
      canonicalUrl: "",
      indexable: true,
      parentId: bangkok._id,
    }
  );

  console.log("OK location", bangkok.slug, bangkok._id.toString());
  console.log(
    "OK service",
    service.slug,
    "parent",
    String(service.parentId),
    "→ /locations/bangkok/kitchen-renovation"
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
