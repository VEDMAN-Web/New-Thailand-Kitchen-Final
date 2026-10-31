/**
 * Thailand Kitchen — SAFE IDEMPOTENT SEED
 * =========================================
 * Creates missing CMS records only. Never deletes or overwrites existing data.
 * Safe to run at any time — on a live database, after deploys, or in CI.
 *
 * Logic per collection:
 *   • Admin user  — skipped if email already exists
 *   • HomePage    — created only when absent; existing sections are NOT changed
 *   • FAQs        — skipped by English question text (no duplicate questions)
 *   • Products    — skipped by slug (no duplicate slugs)
 *   • Gallery     — skipped by title + filter pair
 *   • Blogs       — skipped by slug
 *   • Catalogues  — skipped by sortOrder (each sortOrder is canonical per edition)
 *   • Legal       — skipped when type already exists
 *   • Categories  — upserted via repairThailandTaxonomy (idempotent $set)
 *
 * Usage (local):
 *   npm run seed:tk:safe
 *
 * Usage (staging):
 *   MONGO_URI=mongodb+srv://... MONGO_DB_NAME=production npm run seed:tk:safe
 *
 * ✓  SAFE: no existing data is modified.
 */

"use strict";
require("dotenv").config();

const mongoose  = require("mongoose");
const ConnectDB = require("../config/db");
const AdminUser = require("../model/adminUserModel");
const {
  HomePage,
  Category,
  Product,
  Blog,
  GalleryItem,
  CatalogueItem,
  FaqItem,
  LegalPage,
} = require("../model/cmsModels");

const {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_FAQS,
  DEFAULT_CATEGORIES,
} = require("../seed/thailandSiteDefaults");
const { factsForSlug } = require("../seed/productModelFacts");

const { syncProductsMissingOnly } = require("./syncProductsSafe");
const { syncBlogsMissingOnly }    = require("./syncBlogsSafe");
const { syncFaqsMissingOnly }     = require("./syncFaqsSafe");
const { syncGalleryMissingOnly }  = require("./syncGallerySafe");

// ─── helpers ────────────────────────────────────────────────────────────────

function pad(n, w = 3) { return String(n).padStart(w, " "); }
function row(label, created, existing = 0, note = "") {
  const tick = created > 0 ? "+" : "·";
  const skipped = existing > 0 ? `  (${existing} already existed)` : "";
  const extra   = note      ? `  [${note}]` : "";
  console.log(`  ${tick}  ${pad(created, 3)} ${label}${skipped}${extra}`);
}

function productSeed(partial) {
  const facts = factsForSlug(partial.slug);
  return {
    ...partial,
    featureHighlights: facts?.featureHighlights || [],
  };
}

// ─── default products (same as full seed) ───────────────────────────────────

const DEFAULT_PRODUCTS = [
  productSeed({
    title: "Obsidian Bay",        slug: "obsidian-bay",      subtitle: "Island layout",   productType: "Islands",  sectionTag: "Core Component",
    description: "Obsidian Bay pairs matte dark cabinetry with warm timber undertones — a gallery-like presence designed for open-plan living.",
    image: "/products/Kitchen1.png", gallery: ["/products/Kitchen1.png"], category: "Islands", featured: true,
  }),
  productSeed({
    title: "Pearl Harbor",        slug: "pearl-harbor",      subtitle: "Straight layout", productType: "Straight", sectionTag: "Core Component",
    description: "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character.",
    image: "/products/Kitchen2.png", gallery: ["/products/Kitchen2.png"], category: "Straight", featured: true,
  }),
  productSeed({
    title: "Teak Atelier",        slug: "teak-atelier",      subtitle: "L Shape layout",  productType: "L Shape",  sectionTag: "Core Component",
    description: "Teak brings warmth, strength, and quiet richness to every surface — elevating your kitchen into a lasting heirloom.",
    image: "/products/Kitchen3.png", gallery: ["/products/Kitchen3.png"], category: "L Shape", featured: true,
  }),
  productSeed({
    title: "Midnight Gallery",    slug: "midnight-gallery",  subtitle: "U Shape layout",  productType: "U Shape",  sectionTag: "Core Component",
    description: "Deep tones with layered storage and generous worktop surfaces.",
    image: "/products/Kitchen4.png", gallery: ["/products/Kitchen4.png"], category: "U Shape", featured: false,
  }),
  productSeed({
    title: "Soft Horizon",        slug: "soft-horizon",      subtitle: "Island layout",   productType: "Modern",   sectionTag: "Core Component",
    description: "Light finishes and open proportions for contemporary island homes.",
    image: "/products/Kitchen5.png", gallery: ["/products/Kitchen5.png"], category: "Modern", featured: true,
  }),
  productSeed({
    title: "Coastal Line",        slug: "coastal-line",      subtitle: "T Shape layout",  productType: "T Shape",  sectionTag: "Core Component",
    description: "T-shape kitchen with peninsula seating for casual dining.",
    image: "/products/Kitchen6.png", gallery: ["/products/Kitchen6.png"], category: "T Shape", featured: false,
  }),
  productSeed({
    title: "Amber Court",         slug: "amber-court",       subtitle: "Island layout",   productType: "Islands",  sectionTag: "Core Component",
    description: "Warm amber tones paired with brass hardware and marble accents.",
    image: "", gallery: [], category: "Islands", featured: false,
  }),
  productSeed({
    title: "Nova Kitchen",        slug: "nova-kitchen",      subtitle: "Straight layout", productType: "Modern",   sectionTag: "Core Component",
    description: "Clean lines and smart storage in a bright straight-run layout.",
    image: "", gallery: [], category: "Modern", featured: true,
  }),
  productSeed({
    title: "Heritage Wing",       slug: "heritage-wing",     subtitle: "U Shape layout",  productType: "U Shape",  sectionTag: "Core Component",
    description: "Classic proportions updated with contemporary materials.",
    image: "", gallery: [], category: "U Shape", featured: false,
  }),
  productSeed({
    title: "Calm Studio",         slug: "calm-studio",       subtitle: "L Shape layout",  productType: "L Shape",  sectionTag: "Core Component",
    description: "Quiet palette, integrated appliances, and seamless storage.",
    image: "", gallery: [], category: "L Shape", featured: false,
  }),
  productSeed({
    title: "Shadow Ridge",        slug: "shadow-ridge",      subtitle: "Island layout",   productType: "Islands",  sectionTag: "Core Component",
    description: "Deep charcoal cabinetry with a statement waterfall island.",
    image: "", gallery: [], category: "Islands", featured: true,
  }),
  productSeed({
    title: "Linen Bay",           slug: "linen-bay",         subtitle: "Straight layout", productType: "Straight", sectionTag: "Core Component",
    description: "Warm linen fronts with handle-less profiles and soft lighting.",
    image: "", gallery: [], category: "Straight", featured: false,
  }),
];

const DEFAULT_PRODUCTS_WITH_HIGHLIGHTS = DEFAULT_PRODUCTS;

// ─── default gallery ─────────────────────────────────────────────────────────

const DEFAULT_GALLERY = [
  { title: "Obsidian Island", image: "/products/Kitchen1.png", filter: "Layout & Space", tall: true,  wide: false, sortOrder: 1 },
  { title: "Pearl Straight",  image: "/products/Kitchen2.png", filter: "Style & Color",  tall: false, wide: false, sortOrder: 2 },
  { title: "Tailored Corner", image: "/features/image.png",    filter: "Storage",        tall: false, wide: false, sortOrder: 3 },
  { title: "Midnight Gallery",image: "/products/Kitchen4.png", filter: "Materials",      tall: true,  wide: false, sortOrder: 4 },
  { title: "Soft Horizon",    image: "/catlog/catlog.png",     filter: "Style & Color",  tall: false, wide: false, sortOrder: 5 },
  { title: "Warm Atelier",    image: "/products/Kitchen3.png", filter: "Materials",      tall: false, wide: false, sortOrder: 6 },
  { title: "Quiet Living",    image: "/features/image3.png",   filter: "Layout & Space", tall: true,  wide: false, sortOrder: 7 },
];

// ─── default blogs ───────────────────────────────────────────────────────────

const DEFAULT_BLOGS = [
  {
    title: "The Art of Teak: Why Heritage Timber Remains the Ultimate Kitchen Luxury",
    slug: "the-art-of-teak",
    excerpt: "From grain to finish, teak brings warmth, strength, and lasting character to every kitchen we craft.",
    category: "Kitchen Design Trends", author: "Thailand Kitchen", readTime: "8 min", publishDate: "2024-05-12",
    image: "", gallery: [], metaTitle: "The Art of Teak | Thailand Kitchens",
    bodySections: [
      { title: "A Legacy of Resilience", content: "Teak has long been prized across Thailand for its natural oils, rich grain, and remarkable resistance to moisture.", image: "" },
    ],
    published: true,
  },
  {
    title: "Open Concept Living: Designing a Kitchen That Connects the Whole Home",
    slug: "open-concept-kitchen-design",
    excerpt: "An open kitchen can become the heart of family life.",
    category: "Layout & Space", author: "Thailand Kitchen", readTime: "6 min", publishDate: "2024-04-28",
    image: "", gallery: [], metaTitle: "Open Concept Kitchen Design | Thailand Kitchens",
    bodySections: [
      { title: "Designing for Connection", content: "Open-concept kitchens succeed when they balance cooking needs with social connection.", image: "" },
    ],
    published: true,
  },
  {
    title: "The Ultimate Guide to Modern Kitchen Transformation in Thailand",
    slug: "modern-kitchen-transformation",
    excerpt: "From layout planning to finish selection, explore how a modern modular kitchen can transform daily living.",
    category: "Kitchen Care", author: "Anan Sukhumvit", readTime: "5 min", publishDate: "2026-07-09",
    image: "", gallery: [], metaTitle: "Modern Kitchen Transformation | Thailand Kitchens",
    bodySections: [
      { title: "Start With Lifestyle", content: "The best kitchens begin with how you cook, host, and move through the home.", image: "" },
    ],
    published: true,
  },
];

// ─── default catalogues ──────────────────────────────────────────────────────

const DEFAULT_CATALOGUES = [
  { title: "2026 Minimal Edition", category: "Minimal", image: "/catlog/catlog.png",     pdfUrl: "", fileName: "catalogue-minimal.pdf", downloadName: "Thailand-Kitchens-Catalogue-Minimal.pdf", sortOrder: 1, editionKey: "minimal", locked: true },
  { title: "2026 Classic Edition", category: "Classic", image: "/catlog/catlog (1).png", pdfUrl: "", fileName: "catalogue-classic.pdf", downloadName: "Thailand-Kitchens-Catalogue-Classic.pdf", sortOrder: 2, editionKey: "classic", locked: true },
  { title: "2026 Modern Edition",  category: "Modern",  image: "/catlog/catlog (2).png", pdfUrl: "", fileName: "catalogue-modern.pdf",  downloadName: "Thailand-Kitchens-Catalogue-Modern.pdf",  sortOrder: 3, editionKey: "modern", locked: true },
];

// ─── default legal ───────────────────────────────────────────────────────────

const DEFAULT_LEGAL = {
  privacy: { title: "Privacy Policy", subtitle: "How Thailand Kitchens protects your information", updatedLabel: "Last updated: January 2026", content: "We collect minimal information.", sections: [{ title: "Data We Collect", body: "Name, email, phone provided when you contact us." }, { title: "Your Rights", body: "You may request access or deletion of your data. Contact hello@thailandkitchens.com for privacy requests." }] },
  terms:   { title: "Terms of Use",   subtitle: "Terms governing use of the website",              updatedLabel: "Last updated: January 2026", content: "By using this website you agree to these terms.", sections: [{ title: "Acceptance", body: "By accessing thailandkitchens.com you agree to these Terms of Use." }, { title: "Governing Law", body: "Governed by the laws of the Kingdom of Thailand." }] },
};

// ─── main ─────────────────────────────────────────────────────────────────────

const SITE_ID = process.env.SYNC_SITE_ID || "thailand-kitchen";

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Thailand Kitchen — SAFE SEED (create missing only)      ║");
  console.log(`║   siteId: ${SITE_ID.padEnd(49)}║`);
  console.log("╚═══════════════════════════════════════════════════════════╝");

  await ConnectDB();
  const { asLocalized } = require("../utils/localized");
  const loc = (v) => asLocalized(v);
  console.log();

  // ── Admin user ────────────────────────────────────────────────────────────
  const email    = (process.env.ADMIN_EMAIL    || "admin@thailandkitchens.com").toLowerCase();
  const password =  process.env.ADMIN_PASSWORD || "admin123";
  const name     =  process.env.ADMIN_NAME     || "Admin";
  const existingAdmin = await AdminUser.findOne({ email });
  if (existingAdmin) {
    row("Admin user", 0, 1, email);
  } else {
    await AdminUser.create({ name, email, password, role: "admin" });
    row("Admin user", 1, 0, email);
  }

  // ── HomePage ──────────────────────────────────────────────────────────────
  const existingHome = await HomePage.findOne({ siteId: SITE_ID });
  if (existingHome) {
    row("HomePage sections", 0, 1, "already seeded — not modified");
  } else {
    await HomePage.create({ siteId: SITE_ID, sections: structuredClone(DEFAULT_HOME_SECTIONS) });
    row("HomePage sections", 1);
  }

  // ── FAQs (by English question text) ──────────────────────────────────────
  const faqResult = await syncFaqsMissingOnly(SITE_ID, DEFAULT_FAQS);
  row("FAQs", faqResult.created, faqResult.existing);

  // ── Products (by slug) ────────────────────────────────────────────────────
  const productResult = await syncProductsMissingOnly(
    SITE_ID,
    DEFAULT_PRODUCTS_WITH_HIGHLIGHTS
  );
  row("Products", productResult.created, productResult.existing);

  // ── Gallery (by title + filter) ───────────────────────────────────────────
  const galleryResult = await syncGalleryMissingOnly(SITE_ID, DEFAULT_GALLERY);
  row("Gallery items", galleryResult.created, galleryResult.existing);

  // ── Blogs (by slug) ───────────────────────────────────────────────────────
  const blogResult = await syncBlogsMissingOnly(SITE_ID, DEFAULT_BLOGS);
  row("Blog posts", blogResult.created, blogResult.existing);

  // ── Catalogues (by sortOrder) ─────────────────────────────────────────────
  let catCreated = 0, catExisting = 0;
  const existingOrders = new Set(
    (await CatalogueItem.find({ siteId: SITE_ID }).select("sortOrder").lean())
      .map((c) => Number(c.sortOrder))
  );
  for (const c of DEFAULT_CATALOGUES) {
    if (existingOrders.has(Number(c.sortOrder))) { catExisting++; continue; }
    await CatalogueItem.create({ siteId: SITE_ID, ...c });
    existingOrders.add(Number(c.sortOrder));
    catCreated++;
  }
  row("Catalogues", catCreated, catExisting);

  // ── Legal pages (by type) ─────────────────────────────────────────────────
  let legalCreated = 0, legalExisting = 0;
  for (const type of ["privacy", "terms"]) {
    const exists = await LegalPage.findOne({ siteId: SITE_ID, type });
    if (exists) { legalExisting++; continue; }
    const d = DEFAULT_LEGAL[type];
    await LegalPage.create({
      siteId: SITE_ID, type,
      title: loc(d.title), subtitle: loc(d.subtitle), updatedLabel: loc(d.updatedLabel),
      content: loc(d.content),
      sections: d.sections.map((s) => ({ title: loc(s.title), body: loc(s.body) })),
    });
    legalCreated++;
  }
  row("Legal pages", legalCreated, legalExisting, "privacy + terms");

  // ── Category taxonomy (idempotent upsert) ─────────────────────────────────
  console.log();
  console.log("Category taxonomy (SEO hub pages)…");
  const { repairThailandTaxonomy } = require("./repairThailandTaxonomyLib");
  const taxResult = await repairThailandTaxonomy(SITE_ID);
  row("Categories (upserted)",     taxResult.upserted,       0);
  row("Landing sections seeded",   taxResult.sectionsSeeded, 0);
  row("Total categories in DB",    taxResult.total,          0);

  // ── Basic categories fallback ─────────────────────────────────────────────
  if (taxResult.total === 0 && DEFAULT_CATEGORIES?.length > 0) {
    let basicCreated = 0, basicExisting = 0;
    for (const c of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ siteId: SITE_ID, slug: c.slug });
      if (exists) { basicExisting++; continue; }
      await Category.create({ siteId: SITE_ID, ...c, icon: "" });
      basicCreated++;
    }
    row("Basic categories (fallback)", basicCreated, basicExisting);
  }

  console.log();
  const totals = await Promise.all([
    HomePage    .countDocuments({ siteId: SITE_ID }),
    Product     .countDocuments({ siteId: SITE_ID }),
    Blog        .countDocuments({ siteId: SITE_ID }),
    GalleryItem .countDocuments({ siteId: SITE_ID }),
    CatalogueItem.countDocuments({ siteId: SITE_ID }),
    FaqItem     .countDocuments({ siteId: SITE_ID }),
    Category    .countDocuments({ siteId: SITE_ID }),
    LegalPage   .countDocuments({ siteId: SITE_ID }),
  ]);
  const labels = ["HomePage", "Products", "Blogs", "Gallery", "Catalogues", "FAQs", "Categories", "LegalPages"];
  console.log("Final counts:");
  totals.forEach((n, i) => console.log(`  ${String(n).padStart(4)}  ${labels[i]}`));

  console.log();
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  Status: SAFE SEED COMPLETE ✓ (no existing data changed)  ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Safe seed failed:", err.message);
  process.exit(1);
});
