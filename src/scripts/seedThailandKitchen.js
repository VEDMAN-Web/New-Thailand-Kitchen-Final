/**
 * Thailand Kitchen — FULL SEED (destructive reset)
 * =================================================
 * Wipes every CMS collection then re-inserts canonical seed data:
 *   admin user, home page, FAQs, products, gallery, blogs, categories,
 *   catalogues, and full SEO taxonomy with landing-page sections.
 *
 * Usage (local):
 *   npm run seed:tk
 *
 * Usage (staging — set MONGO_URI + MONGO_DB_NAME in environment):
 *   MONGO_URI=mongodb+srv://... MONGO_DB_NAME=production npm run seed:tk
 *
 * ⚠  DESTRUCTIVE: every CMS collection is wiped before re-seeding.
 *    Use `npm run seed:tk:safe` to create missing records without wiping.
 *
 * Never commit real credentials. All secrets come from .env.
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

// ─── helpers ────────────────────────────────────────────────────────────────

function pad(n, w = 3) { return String(n).padStart(w, " "); }
function row(label, count, note = "") {
  const tick = count > 0 ? "✓" : "–";
  const extra = note ? `  (${note})` : "";
  console.log(`  ${tick}  ${pad(count)} ${label}${extra}`);
}

function productSeed(partial) {
  const facts = factsForSlug(partial.slug);
  return {
    ...partial,
    featureHighlights: facts?.featureHighlights || [],
  };
}

// ─── default products ────────────────────────────────────────────────────────

const DEFAULT_PRODUCTS = [
  productSeed({
    title: "Obsidian Bay",
    slug: "obsidian-bay",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Obsidian Bay pairs matte dark cabinetry with warm timber undertones — a gallery-like presence designed for open-plan living.",
    image: "/products/Kitchen1.png",
    gallery: ["/products/Kitchen1.png"],
    category: "Islands",
    featured: true,
  }),
  productSeed({
    title: "Pearl Harbor",
    slug: "pearl-harbor",
    subtitle: "Straight layout",
    productType: "Straight",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character.",
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen2.png"],
    category: "Straight",
    featured: true,
  }),
  productSeed({
    title: "Teak Atelier",
    slug: "teak-atelier",
    subtitle: "L Shape layout",
    productType: "L Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — elevating your kitchen into a lasting heirloom.",
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen3.png"],
    category: "L Shape",
    featured: true,
  }),
  productSeed({
    title: "Midnight Gallery",
    slug: "midnight-gallery",
    subtitle: "U Shape layout",
    productType: "U Shape",
    sectionTag: "Core Component",
    description: "Deep tones with layered storage and generous worktop surfaces.",
    image: "/products/Kitchen4.png",
    gallery: ["/products/Kitchen4.png"],
    category: "U Shape",
    featured: false,
  }),
  productSeed({
    title: "Soft Horizon",
    slug: "soft-horizon",
    subtitle: "Island layout",
    productType: "Modern",
    sectionTag: "Core Component",
    description: "Light finishes and open proportions for contemporary island homes.",
    image: "/products/Kitchen5.png",
    gallery: ["/products/Kitchen5.png"],
    category: "Modern",
    featured: true,
  }),
  productSeed({
    title: "Coastal Line",
    slug: "coastal-line",
    subtitle: "T Shape layout",
    productType: "T Shape",
    sectionTag: "Core Component",
    description: "T-shape kitchen with peninsula seating for casual dining.",
    image: "/products/Kitchen6.png",
    gallery: ["/products/Kitchen6.png"],
    category: "T Shape",
    featured: false,
  }),
  productSeed({
    title: "Amber Court",
    slug: "amber-court",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description: "Warm amber tones paired with brass hardware and marble accents.",
    image: "",
    gallery: [],
    category: "Islands",
    featured: false,
  }),
  productSeed({
    title: "Nova Kitchen",
    slug: "nova-kitchen",
    subtitle: "Straight layout",
    productType: "Modern",
    sectionTag: "Core Component",
    description: "Clean lines and smart storage in a bright straight-run layout.",
    image: "",
    gallery: [],
    category: "Modern",
    featured: true,
  }),
  productSeed({
    title: "Heritage Wing",
    slug: "heritage-wing",
    subtitle: "U Shape layout",
    productType: "U Shape",
    sectionTag: "Core Component",
    description: "Classic proportions updated with contemporary materials.",
    image: "",
    gallery: [],
    category: "U Shape",
    featured: false,
  }),
  productSeed({
    title: "Calm Studio",
    slug: "calm-studio",
    subtitle: "L Shape layout",
    productType: "L Shape",
    sectionTag: "Core Component",
    description: "Quiet palette, integrated appliances, and seamless storage.",
    image: "",
    gallery: [],
    category: "L Shape",
    featured: false,
  }),
  productSeed({
    title: "Shadow Ridge",
    slug: "shadow-ridge",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description: "Deep charcoal cabinetry with a statement waterfall island.",
    image: "",
    gallery: [],
    category: "Islands",
    featured: true,
  }),
  productSeed({
    title: "Linen Bay",
    slug: "linen-bay",
    subtitle: "Straight layout",
    productType: "Straight",
    sectionTag: "Core Component",
    description: "Warm linen fronts with handle-less profiles and soft lighting.",
    image: "",
    gallery: [],
    category: "Straight",
    featured: false,
  }),
];

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
    excerpt:
      "From grain to finish, teak brings warmth, strength, and lasting character to every kitchen we craft — rooted in Thai heritage and modern living.",
    category: "Kitchen Design Trends",
    author: "Thailand Kitchen",
    readTime: "8 min",
    publishDate: "2024-05-12",
    image: "",
    gallery: [],
    metaTitle: "The Art of Teak | Thailand Kitchens",
    bodySections: [
      {
        title: "A Legacy of Resilience",
        content:
          "Teak has long been prized across Thailand for its natural oils, rich grain, and remarkable resistance to moisture. In the kitchen — where heat, steam, and daily use put materials to the test — this heritage timber still stands as one of the most refined choices available.",
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
    title: "Open Concept Living: Designing a Kitchen That Connects the Whole Home",
    slug: "open-concept-kitchen-design",
    excerpt:
      "An open kitchen can become the heart of family life. Here's how thoughtful layout and proportion create flow without sacrificing function.",
    category: "Layout & Space",
    author: "Thailand Kitchen",
    readTime: "6 min",
    publishDate: "2024-04-28",
    image: "",
    gallery: [],
    metaTitle: "Open Concept Kitchen Design | Thailand Kitchens",
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
    quote: "A kitchen should invite people in — not push them to the edges of the room.",
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
    image: "",
    gallery: [],
    metaTitle: "Modern Kitchen Transformation | Thailand Kitchens",
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
      "A modern kitchen should feel effortless every morning — and still look considered every evening.",
    quoteAuthor: "Thailand Kitchen Studio",
    published: true,
  },
];

// ─── default catalogues ──────────────────────────────────────────────────────

const DEFAULT_CATALOGUES = [
  { title: "2026 Minimal Edition", category: "Minimal", image: "/catlog/catlog.png",    pdfUrl: "", fileName: "catalogue-minimal.pdf", downloadName: "Thailand-Kitchens-Catalogue-Minimal.pdf", sortOrder: 1, editionKey: "minimal", locked: true },
  { title: "2026 Classic Edition", category: "Classic", image: "/catlog/catlog (1).png", pdfUrl: "", fileName: "catalogue-classic.pdf", downloadName: "Thailand-Kitchens-Catalogue-Classic.pdf", sortOrder: 2, editionKey: "classic", locked: true },
  { title: "2026 Modern Edition",  category: "Modern",  image: "/catlog/catlog (2).png", pdfUrl: "", fileName: "catalogue-modern.pdf",  downloadName: "Thailand-Kitchens-Catalogue-Modern.pdf",  sortOrder: 3, editionKey: "modern", locked: true },
];

// ─── legal defaults ──────────────────────────────────────────────────────────

const DEFAULT_LEGAL = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How Thailand Kitchens collects, uses, and protects your information",
    updatedLabel: "Last updated: January 2026",
    content: "We collect minimal information necessary to respond to your enquiry. Your data is never sold.",
    sections: [
      { title: "Data We Collect", body: "Name, email, phone, and project details provided when you contact us." },
      { title: "How We Use It",   body: "To respond to enquiries, provide quotes, and improve our service." },
      { title: "Your Rights",     body: "You may request access, correction, or deletion of your data at any time. Contact hello@thailandkitchens.com for privacy requests." },
    ],
  },
  terms: {
    title: "Terms of Use",
    subtitle: "Terms governing use of the Thailand Kitchens website and services",
    updatedLabel: "Last updated: January 2026",
    content: "By using this website you agree to these terms.",
    sections: [
      { title: "Acceptance",       body: "By accessing thailandkitchens.com you agree to these Terms of Use." },
      { title: "Website Content",  body: "All content is owned by Thailand Kitchens or used under licence." },
      { title: "Governing Law",    body: "These terms are governed by the laws of the Kingdom of Thailand." },
    ],
  },
};

// ─── main ────────────────────────────────────────────────────────────────────

const SITE_ID = process.env.SYNC_SITE_ID || "thailand-kitchen";

async function main() {
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║   Thailand Kitchen — FULL SEED (destructive reset)        ║");
  console.log(`║   siteId: ${SITE_ID.padEnd(49)}║`);
  console.log("╚═══════════════════════════════════════════════════════════╝");

  await ConnectDB();
  console.log();

  // ── Step 1: Clear all CMS collections for this siteId ───────────────────
  console.log("Step 1 · Clearing CMS collections…");
  await Promise.all([
    HomePage    .deleteMany({ siteId: SITE_ID }),
    Category    .deleteMany({ siteId: SITE_ID }),
    Product     .deleteMany({ siteId: SITE_ID }),
    Blog        .deleteMany({ siteId: SITE_ID }),
    GalleryItem .deleteMany({ siteId: SITE_ID }),
    CatalogueItem.deleteMany({ siteId: SITE_ID }),
    FaqItem     .deleteMany({ siteId: SITE_ID }),
    LegalPage   .deleteMany({ siteId: SITE_ID }),
  ]);
  console.log("  ✓  All CMS collections cleared.");
  console.log();

  // ── Step 2: Admin user (idempotent — never re-creates if email exists) ───
  console.log("Step 2 · Admin user…");
  const email    = (process.env.ADMIN_EMAIL    || "admin@thailandkitchens.com").toLowerCase();
  const password =  process.env.ADMIN_PASSWORD || "admin123";
  const name     =  process.env.ADMIN_NAME     || "Admin";
  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`  –  Admin already exists: ${email} (skipped)`);
  } else {
    await AdminUser.create({ name, email, password, role: "admin" });
    console.log(`  ✓    1 Admin user created: ${email}`);
  }
  console.log();

  // ── Step 3: Home page sections ───────────────────────────────────────────
  console.log("Step 3 · CMS collections…");
  await HomePage.create({ siteId: SITE_ID, sections: structuredClone(DEFAULT_HOME_SECTIONS) });
  row("HomePage (home sections)", 1, "hero, stats, advantages, testimonials, catalogue, faq, nav, footer…");

  // ── Step 4: FAQs ─────────────────────────────────────────────────────────
  const faqs = await FaqItem.insertMany(
    DEFAULT_FAQS.map((f) => ({ siteId: SITE_ID, ...f }))
  );
  row("FAQs", faqs.length);

  // ── Step 5: Products ─────────────────────────────────────────────────────
  const { asLocalized } = require("../utils/localized");

  function loc(value) { return asLocalized(value); }
  function locHighlights(rows = []) {
    return rows.map((item) => ({
      title: loc(item?.title),
      description: loc(item?.description),
    }));
  }

  const productDocs = DEFAULT_PRODUCTS.map((p) => ({
    siteId: SITE_ID,
    title:            loc(p.title),
    slug:             p.slug,
    subtitle:         loc(p.subtitle || ""),
    productType:      loc(p.productType || ""),
    sectionTag:       loc(p.sectionTag || ""),
    description:      loc(p.description || ""),
    image:            p.image || "",
    icon:             "",
    gallery:          p.gallery || [],
    pdfUrl:           "",
    featureHighlights: locHighlights(p.featureHighlights || []),
    category:         loc(p.category || ""),
    featured:         Boolean(p.featured),
  }));
  const products = await Product.insertMany(productDocs);
  row("Products", products.length);

  // ── Step 6: Gallery ──────────────────────────────────────────────────────
  const galleryDocs = DEFAULT_GALLERY.map((g) => ({
    siteId: SITE_ID,
    title:     loc(g.title),
    image:     g.image,
    filter:    g.filter,
    tall:      Boolean(g.tall),
    wide:      Boolean(g.wide),
    sortOrder: Number(g.sortOrder) || 0,
  }));
  const gallery = await GalleryItem.insertMany(galleryDocs);
  row("Gallery items", gallery.length);

  // ── Step 7: Blogs ────────────────────────────────────────────────────────
  const blogs = await Blog.insertMany(
    DEFAULT_BLOGS.map((b) => ({ siteId: SITE_ID, ...b }))
  );
  row("Blog posts", blogs.length);

  // ── Step 8: Catalogues ───────────────────────────────────────────────────
  const catalogues = await CatalogueItem.insertMany(
    DEFAULT_CATALOGUES.map((c) => ({ siteId: SITE_ID, ...c }))
  );
  row("Catalogues", catalogues.length);

  // ── Step 9: Legal pages ──────────────────────────────────────────────────
  for (const type of ["privacy", "terms"]) {
    const d = DEFAULT_LEGAL[type];
    await LegalPage.create({
      siteId: SITE_ID, type,
      title: loc(d.title), subtitle: loc(d.subtitle), updatedLabel: loc(d.updatedLabel),
      content: loc(d.content),
      sections: d.sections.map((s) => ({ title: loc(s.title), body: loc(s.body) })),
    });
  }
  row("Legal pages", 2, "privacy + terms");

  // ── Step 10: Category taxonomy + landing sections ─────────────────────────
  console.log();
  console.log("Step 4 · Category taxonomy (SEO hub pages)…");
  const { repairThailandTaxonomy } = require("./repairThailandTaxonomyLib");
  const taxResult = await repairThailandTaxonomy(SITE_ID);
  row("Categories upserted",        taxResult.upserted);
  row("Landing sections seeded",    taxResult.sectionsSeeded);
  row("Total categories",           taxResult.total);
  console.log();

  // ── Step 5: Categories from DEFAULT_CATEGORIES (basic set) ──────────────
  // repairThailandTaxonomy already inserted the full taxonomy above.
  // DEFAULT_CATEGORIES is a minimal fallback; skip if taxonomy ran.
  if (taxResult.upserted === 0 && DEFAULT_CATEGORIES?.length > 0) {
    console.log("Step 5 · Fallback basic categories (taxonomy was empty)…");
    const cats = await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ siteId: SITE_ID, ...c, icon: "" }))
    );
    row("Basic categories", cats.length);
    console.log();
  }

  // ── Total ────────────────────────────────────────────────────────────────
  const total =
    1 + faqs.length + products.length + gallery.length +
    blogs.length + catalogues.length + 2 + taxResult.total;

  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log(`║  Total records: ${String(total).padEnd(43)}║`);
  console.log("║  Status: COMPLETE ✓                                       ║");
  console.log("╚═══════════════════════════════════════════════════════════╝");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
