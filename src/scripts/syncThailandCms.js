/**
 * One-shot sync: fill Thailand Kitchen CMS from site defaults.
 * Usage: node src/scripts/syncThailandCms.js
 */
require("dotenv").config();
const ConnectDB = require("../config/db");
const {
  HomePage,
  Category,
  Product,
  Blog,
  GalleryItem,
  FaqItem,
  LegalPage,
} = require("../model/cmsModels");
const {
  DEFAULT_HOME_SECTIONS,
  DEFAULT_FAQS,
  DEFAULT_CATEGORIES,
} = require("../seed/thailandSiteDefaults");

const SITE_ID = process.env.SYNC_SITE_ID || "thailand-kitchen";

async function main() {
  await ConnectDB();

  // Trigger ensure paths by requiring controller helpers via HTTP-less duplicate
  // Prefer direct upserts here so sync works even if server is stopped.
  const cms = require("../controller/cmsController");
  // Controller doesn't export ensurers — call via getHome side effects through DB ops:

  // Home enrich
  let home = await HomePage.findOne({ siteId: SITE_ID });
  if (!home) {
    home = await HomePage.create({
      siteId: SITE_ID,
      sections: structuredClone(DEFAULT_HOME_SECTIONS),
    });
    console.log("Created home sections");
  } else {
    const defaults = structuredClone(DEFAULT_HOME_SECTIONS);
    const sec = home.sections || {};
    if (!sec.testimonials?.items || sec.testimonials.items.length < 3) {
      sec.testimonials = defaults.testimonials;
    }
    if (!sec.faq?.items || sec.faq.items.length < 8) {
      sec.faq = defaults.faq;
    }
    if (!sec.catalogue?.items || sec.catalogue.items.length < 4) {
      sec.catalogue = defaults.catalogue;
    }
    if (!sec.advantages?.items || sec.advantages.items.length < 3) {
      sec.advantages = defaults.advantages;
    }
    if (!sec.transition?.pillars || sec.transition.pillars.length < 4) {
      sec.transition = defaults.transition;
    }
    if (!sec.statistics?.items || sec.statistics.items.length < 3) {
      sec.statistics = defaults.statistics;
    }
    if (!sec.partners?.logos || sec.partners.logos.length < 6) {
      sec.partners = defaults.partners;
    }
    if (!sec.productsPage) sec.productsPage = defaults.productsPage;
    if (!sec.galleryPage) sec.galleryPage = defaults.galleryPage;
    if (!sec.blogPage) sec.blogPage = defaults.blogPage;
    if (!sec.faqPage) sec.faqPage = defaults.faqPage;
    if (!sec.contactPage) sec.contactPage = defaults.contactPage;
    if (!sec.nav) sec.nav = defaults.nav;
    if (!sec.seo) sec.seo = defaults.seo;
    if (String(sec.hero?.title || "").trim() === "Craft kitchens with soul") {
      sec.hero = defaults.hero;
      sec.story = defaults.story;
      sec.statistics = defaults.statistics;
      sec.advantages = defaults.advantages;
      sec.transition = defaults.transition;
      sec.footer = { ...defaults.footer, ...sec.footer };
    }
    home.sections = sec;
    home.markModified("sections");
    await home.save();
    console.log("Enriched home sections");
  }

  if ((await FaqItem.countDocuments({ siteId: SITE_ID })) === 0) {
    await FaqItem.insertMany(
      DEFAULT_FAQS.map((f) => ({ siteId: SITE_ID, ...f }))
    );
    console.log(`Seeded ${DEFAULT_FAQS.length} FAQs`);
  } else {
    console.log("FAQs already present — skip");
  }

  if ((await Category.countDocuments({ siteId: SITE_ID })) === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ siteId: SITE_ID, ...c, icon: "" }))
    );
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
  } else {
    console.log("Categories already present — skip");
  }

  // Touch list endpoints via controller by reading counts
  console.log("Products:", await Product.countDocuments({ siteId: SITE_ID }));
  console.log("Blogs:", await Blog.countDocuments({ siteId: SITE_ID }));
  console.log("Gallery:", await GalleryItem.countDocuments({ siteId: SITE_ID }));
  console.log("FAQs:", await FaqItem.countDocuments({ siteId: SITE_ID }));
  console.log("Categories:", await Category.countDocuments({ siteId: SITE_ID }));
  console.log("Legal privacy:", await LegalPage.countDocuments({ siteId: SITE_ID, type: "privacy" }));
  console.log("Legal terms:", await LegalPage.countDocuments({ siteId: SITE_ID, type: "terms" }));
  console.log("Sync complete for", SITE_ID);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
