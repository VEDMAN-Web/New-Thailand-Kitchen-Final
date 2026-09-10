/**
 * Export CMS image URLs to CSV and optionally HEAD-check them.
 * Usage:
 *   node src/scripts/exportImageInventory.js
 *   CHECK_URLS=1 MEDIA_BASE_URL=https://staging.thailandkitchens.com node src/scripts/exportImageInventory.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const ConnectDB = require("../config/db");
const {
  HomePage,
  Product,
  Blog,
  Category,
  GalleryItem,
  CatalogueItem,
} = require("../model/cmsModels");
const { collect, uniqueRows, absoluteUrl } = require("../utils/imageInventory");

const SITE_ID = process.env.SYNC_SITE_ID || "thailand-kitchen";
const MEDIA_BASE = String(
  process.env.MEDIA_BASE_URL || process.env.PUBLIC_API_URL || ""
).replace(/\/+$/, "");
const CHECK = process.env.CHECK_URLS === "1";

function withBase(url) {
  return absoluteUrl(url, MEDIA_BASE);
}

async function headStatus(url) {
  if (!CHECK || !/^https?:\/\//i.test(url)) return "";
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    return String(res.status);
  } catch (err) {
    return `ERR:${err.cause?.code || err.message || "fail"}`;
  }
}

async function main() {
  await ConnectDB();
  const rows = [];
  const [home, products, blogs, categories, gallery, catalogues] =
    await Promise.all([
      HomePage.findOne({ siteId: SITE_ID }).lean(),
      Product.find({ siteId: SITE_ID }).lean(),
      Blog.find({ siteId: SITE_ID }).lean(),
      Category.find({ siteId: SITE_ID }).lean(),
      GalleryItem.find({ siteId: SITE_ID }).lean(),
      CatalogueItem.find({ siteId: SITE_ID }).lean(),
    ]);

  collect(home?.sections, rows, "home.sections");
  products.forEach((p, i) => collect(p, rows, `products[${i}:${p.slug}]`));
  blogs.forEach((b, i) => collect(b, rows, `blogs[${i}:${b.slug}]`));
  categories.forEach((c, i) =>
    collect(c, rows, `categories[${i}:${c.slug || c._id}]`)
  );
  gallery.forEach((g, i) => collect(g, rows, `gallery[${i}]`));
  catalogues.forEach((c, i) => collect(c, rows, `catalogues[${i}]`));

  const unique = uniqueRows(rows);

  const outDir = path.join(process.cwd(), "tmp");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "image_inventory.csv");
  const lines = ["source,url,absolute_url,http_status"];
  for (const row of unique) {
    const abs = withBase(row.url);
    const status = await headStatus(abs);
    lines.push(
      [row.source, row.url, abs, status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
  }
  fs.writeFileSync(outFile, `${lines.join("\n")}\n`, "utf8");
  console.log(`Wrote ${unique.length} URLs to ${outFile}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
