const asyncHandler = require("../utils/asyncHandler");
const {
  SITE_IDS,
  HomePage,
  Category,
  Product,
  Blog,
  LegalPage,
  GalleryItem,
  CatalogueItem,
  FaqItem,
} = require("../model/cmsModels");

const SITES = [
  { id: "thailand-kitchen", name: "Thailand Kitchen", enabled: true },
  { id: "varsovia-kitchen", name: "Varsovia Kitchen", enabled: true },
];

const DEFAULT_HOME_SECTIONS = {
  hero: {
    subtitle: "Thailand Kitchens",
    title: "Craft kitchens with soul",
    description: "Thai heritage meets modern living",
    buttonText: "Free Consultation",
    image: "/products/Kitchen2.png",
    videoUrl: "",
  },
  statistics: {
    items: [
      { label: "Years", value: "15", suffix: "+" },
      { label: "Cities", value: "12", suffix: "" },
      { label: "Kitchens", value: "800", suffix: "+" },
    ],
  },
  advantages: {
    items: [
      {
        title: "Craftsmanship",
        description: "Precision joinery and teak soul.",
        icon: "",
      },
      {
        title: "Custom Design",
        description: "Layouts tailored to your island home.",
        icon: "",
      },
      {
        title: "Full Install",
        description: "From consultation to handover.",
        icon: "",
      },
    ],
  },
  story: {
    title: "Our Story",
    subtitle: "About Us",
    description:
      "We believe in the soul of teak wood and the precision of ancient joining techniques.",
    image: "/slider/crafted-with-passion.png",
  },
  transition: {
    pillars: [
      { title: "Consult", description: "Understand your space and lifestyle.", icon: "" },
      { title: "Design", description: "Plan layouts and materials together.", icon: "" },
      { title: "Craft", description: "Build with precision and care.", icon: "" },
      { title: "Install", description: "Deliver and install as one team.", icon: "" },
    ],
  },
  testimonials: {
    items: [
      {
        name: "Sarah M.",
        role: "Homeowner, Samui",
        quote: "Beautiful craftsmanship and a smooth install from start to finish.",
        image: "",
        rating: 5,
      },
    ],
  },
  catalogue: {
    items: [
      {
        title: "2026 EDITION",
        category: "Minimal",
        image: "/catlog/catlog.png",
        pdfUrl: "",
        fileName: "catalogue-minimal.pdf",
        downloadName: "Thailand-Kitchens-Catalogue-Minimal.pdf",
      },
      {
        title: "2026 EDITION",
        category: "Classic",
        image: "/catlog/catlog (1).png",
        pdfUrl: "",
        fileName: "catalogue-classic.pdf",
        downloadName: "Thailand-Kitchens-Catalogue-Classic.pdf",
      },
      {
        title: "2026 EDITION",
        category: "Modern",
        image: "/catlog/catlog (2).png",
        pdfUrl: "",
        fileName: "catalogue-modern.pdf",
        downloadName: "Thailand-Kitchens-Catalogue-Modern.pdf",
      },
    ],
  },
  partners: {
    logos: [
      { name: "Partner 1", image: "/brandLogo/first (1).png" },
      { name: "Partner 2", image: "/brandLogo/first (2).png" },
      { name: "Partner 3", image: "/brandLogo/first (3).png" },
      { name: "Partner 4", image: "/brandLogo/first (4).png" },
      { name: "Partner 5", image: "/brandLogo/first (5).png" },
      { name: "Partner 6", image: "/brandLogo/first (6).png" },
    ],
  },
  faq: {
    items: [
      {
        question: "How long does a custom kitchen take?",
        answer: "Typical projects take 8–12 weeks from design sign-off to install.",
      },
      {
        question: "Do you install across Thailand?",
        answer: "Yes — we primarily serve Pattaya, Samui, and surrounding areas.",
      },
    ],
  },
  footer: {
    email: "hi@thailandkitchens.com",
    phone: "+66 64 683 9777",
    address: "Pattaya & Samui, Thailand",
    facebook: "https://www.facebook.com/ThailandKitchens/",
    instagram: "",
    line: "",
  },
  galleryPage: {
    eyebrow: "The Gallery · Vol. 04",
    title: "Kitchens of the island, moments of everyday luxury.",
    description:
      "A curated inspiration library of tropical, modern and minimal kitchens crafted by our Samui atelier — filter by style, layout, palette or material and discover your next design.",
    collage: [
      "/products/Kitchen2.png",
      "/products/Kitchen3.png",
      "/features/image2.png",
      "/products/Kitchen1.png",
    ],
  },
};

function assertSite(siteId) {
  return SITE_IDS.includes(siteId);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Default Features & Details copy shown on the product page */
const DEFAULT_FEATURE_HIGHLIGHTS = [
  {
    title: "Matte Obsidian Finish",
    description:
      "A deep, light-absorbing lacquer that keeps surfaces calm and fingerprints discreet in daily living.",
  },
  {
    title: "Artisanal Gold Hardware",
    description:
      "Hand-finished pulls and hinges that catch soft light and complete the dark timber silhouette.",
  },
  {
    title: "Imperial Marble Worktops",
    description:
      "Thick stone slabs with natural veining, sealed for lasting kitchen use and a quiet luxury feel.",
  },
];

/** Website catalogue seed — keeps admin + public site in sync */
const DEFAULT_PRODUCTS = [
  {
    title: "Obsidian Bay",
    slug: "obsidian-bay",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Obsidian Bay pairs matte dark cabinetry with warm timber undertones — a quiet, gallery-like presence designed for open-plan living and island entertaining.",
    image: "/products/Kitchen1.png",
    gallery: ["/product/product.png", "/products/Kitchen1.png", "/products/Kitchen2.png"],
    category: "Islands",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Pearl Harbor",
    slug: "pearl-harbor",
    subtitle: "Straight layout",
    productType: "Straight",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen3.png", "/products/Kitchen4.png"],
    category: "Straight",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Teak Atelier",
    slug: "teak-atelier",
    subtitle: "L Shape layout",
    productType: "L Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen3.png", "/products/Kitchen1.png", "/products/Kitchen6.png"],
    category: "L Shape",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Midnight Gallery",
    slug: "midnight-gallery",
    subtitle: "U Shape layout",
    productType: "U Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen4.png",
    gallery: ["/products/Kitchen4.png", "/products/Kitchen5.png", "/products/Kitchen2.png"],
    category: "U Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Soft Horizon",
    slug: "soft-horizon",
    subtitle: "Island layout",
    productType: "Modern",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen5.png",
    gallery: ["/products/Kitchen5.png", "/products/Kitchen6.png", "/products/Kitchen1.png"],
    category: "Modern",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Coastal Line",
    slug: "coastal-line",
    subtitle: "T Shape layout",
    productType: "T Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen6.png",
    gallery: ["/products/Kitchen6.png", "/products/Kitchen2.png", "/products/Kitchen3.png"],
    category: "T Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Amber Court",
    slug: "amber-court",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen1.png",
    gallery: ["/products/Kitchen1.png", "/products/Kitchen2.png", "/products/Kitchen3.png"],
    category: "Islands",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Nova Kitchen",
    slug: "nova-kitchen",
    subtitle: "Straight layout",
    productType: "Modern",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen2.png",
    gallery: ["/products/Kitchen2.png", "/products/Kitchen3.png", "/products/Kitchen4.png"],
    category: "Modern",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Heritage Wing",
    slug: "heritage-wing",
    subtitle: "U Shape layout",
    productType: "U Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen3.png",
    gallery: ["/products/Kitchen3.png", "/products/Kitchen4.png", "/products/Kitchen5.png"],
    category: "U Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Calm Studio",
    slug: "calm-studio",
    subtitle: "L Shape layout",
    productType: "L Shape",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen4.png",
    gallery: ["/products/Kitchen4.png", "/products/Kitchen5.png", "/products/Kitchen6.png"],
    category: "L Shape",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Shadow Ridge",
    slug: "shadow-ridge",
    subtitle: "Island layout",
    productType: "Islands",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen5.png",
    gallery: ["/products/Kitchen5.png", "/products/Kitchen6.png", "/products/Kitchen1.png"],
    category: "Islands",
    featured: true,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
  {
    title: "Linen Bay",
    slug: "linen-bay",
    subtitle: "Straight layout",
    productType: "Straight",
    sectionTag: "Core Component",
    description:
      "Teak brings warmth, strength, and quiet richness to every surface — a material that ages with character and elevates the kitchen into a lasting heirloom.",
    image: "/products/Kitchen6.png",
    gallery: ["/products/Kitchen6.png", "/products/Kitchen1.png", "/products/Kitchen2.png"],
    category: "Straight",
    featured: false,
    featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS,
  },
];

async function ensureDefaultProducts(siteId) {
  const existing = await Product.find({ siteId }).select("slug image featureHighlights gallery").lean();
  const existingSlugs = new Set(
    existing.map((p) => String(p.slug || "").trim().toLowerCase())
  );

  const missing = DEFAULT_PRODUCTS.filter(
    (p) => !existingSlugs.has(String(p.slug).toLowerCase())
  );
  if (missing.length) {
    await Product.insertMany(
      missing.map((p) => ({
        siteId,
        title: p.title,
        slug: p.slug,
        subtitle: p.subtitle || "",
        productType: p.productType || "",
        sectionTag: p.sectionTag || "",
        description: p.description || "",
        image: p.image || "",
        icon: "",
        gallery: p.gallery || [],
        pdfUrl: "",
        featureHighlights: p.featureHighlights || DEFAULT_FEATURE_HIGHLIGHTS,
        category: p.category || "",
        featured: Boolean(p.featured),
      }))
    );
  }

  // Backfill empty Features & Details for products created before highlights existed
  const needsHighlights = existing.filter((p) => {
    const highlights = Array.isArray(p.featureHighlights) ? p.featureHighlights : [];
    return !highlights.some((h) => String(h?.title || "").trim() || String(h?.description || "").trim());
  });
  if (needsHighlights.length) {
    await Product.updateMany(
      { _id: { $in: needsHighlights.map((p) => p._id) } },
      { $set: { featureHighlights: DEFAULT_FEATURE_HIGHLIGHTS } }
    );
  }

  // Ensure each product has at least two gallery images for the Features side panel
  const needsGallery = existing.filter((p) => !Array.isArray(p.gallery) || p.gallery.length < 2);
  for (const product of needsGallery) {
    const seed = DEFAULT_PRODUCTS.find(
      (p) => String(p.slug).toLowerCase() === String(product.slug || "").toLowerCase()
    );
    const gallery =
      seed?.gallery?.length >= 2
        ? seed.gallery
        : [product.image || "/products/Kitchen1.png", "/products/Kitchen2.png"].filter(Boolean);
    await Product.updateOne({ _id: product._id }, { $set: { gallery } });
  }
}

/** Website gallery seed — keeps admin + public gallery in sync */
const DEFAULT_GALLERY = [
  {
    title: "Obsidian Island",
    image: "/products/Kitchen1.png",
    filter: "Layout & Space",
    tall: true,
    wide: false,
    sortOrder: 1,
  },
  {
    title: "Pearl Straight",
    image: "/products/Kitchen2.png",
    filter: "Style & Color",
    tall: false,
    wide: false,
    sortOrder: 2,
  },
  {
    title: "Tailored Corner",
    image: "/features/image.png",
    filter: "Storage",
    tall: false,
    wide: false,
    sortOrder: 3,
  },
  {
    title: "Midnight Gallery",
    image: "/products/Kitchen4.png",
    filter: "Materials",
    tall: true,
    wide: false,
    sortOrder: 4,
  },
  {
    title: "Soft Horizon",
    image: "/catlog/catlog.png",
    filter: "Style & Color",
    tall: false,
    wide: false,
    sortOrder: 5,
  },
  {
    title: "Warm Atelier",
    image: "/products/Kitchen3.png",
    filter: "Materials",
    tall: false,
    wide: false,
    sortOrder: 6,
  },
  {
    title: "Quiet Living",
    image: "/features/image3.png",
    filter: "Layout & Space",
    tall: true,
    wide: false,
    sortOrder: 7,
  },
];

async function ensureDefaultGallery(siteId) {
  const count = await GalleryItem.countDocuments({ siteId });
  if (count > 0) return;

  await GalleryItem.insertMany(
    DEFAULT_GALLERY.map((g) => ({
      siteId,
      title: g.title,
      image: g.image,
      filter: g.filter,
      tall: Boolean(g.tall),
      wide: Boolean(g.wide),
      sortOrder: Number(g.sortOrder) || 0,
    }))
  );
}

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || "").trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function asFeatureHighlights(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      title: String(item?.title || "").trim(),
      description: String(item?.description || "").trim(),
    }))
    .filter((item) => item.title || item.description);
}

/**
 * Migrate legacy field names + fill empty sections so admin "ready" checks pass
 * and the website always has usable content.
 */
function normalizeHomeSections(raw = {}) {
  const defaults = structuredClone(DEFAULT_HOME_SECTIONS);
  const src = raw && typeof raw === "object" ? raw : {};

  const heroSrc = src.hero || {};
  const hero = {
    ...defaults.hero,
    ...heroSrc,
    buttonText:
      heroSrc.buttonText || heroSrc.cta || defaults.hero.buttonText,
    description:
      heroSrc.description ||
      heroSrc.subtitle ||
      defaults.hero.description,
    subtitle:
      heroSrc.subtitle && heroSrc.subtitle !== heroSrc.description
        ? heroSrc.subtitle
        : heroSrc.eyebrow || defaults.hero.subtitle,
    title: heroSrc.title || defaults.hero.title,
    image: heroSrc.image || defaults.hero.image,
    videoUrl: heroSrc.videoUrl || "",
  };

  const storySrc = src.story || {};
  const story = {
    ...defaults.story,
    ...storySrc,
    description:
      storySrc.description || storySrc.text || defaults.story.description,
    subtitle: storySrc.subtitle || defaults.story.subtitle,
    image: storySrc.image || defaults.story.image,
  };

  const transitionSrc = src.transition || {};
  const pillarsRaw = Array.isArray(transitionSrc.pillars)
    ? transitionSrc.pillars
    : Array.isArray(transitionSrc.items)
      ? transitionSrc.items
      : [];
  const transition = {
    pillars:
      pillarsRaw.length > 0
        ? pillarsRaw.map((p, i) => ({
            title: p.title || defaults.transition.pillars[i]?.title || "",
            description:
              p.description ||
              defaults.transition.pillars[i]?.description ||
              "",
            icon: p.icon || "",
          }))
        : defaults.transition.pillars,
  };

  const partnersSrc = src.partners || {};
  const logosRaw = Array.isArray(partnersSrc.logos)
    ? partnersSrc.logos
    : Array.isArray(partnersSrc.items)
      ? partnersSrc.items
      : [];
  const mappedLogos = logosRaw
    .map((l) => ({
      name: l.name || l.title || "Partner",
      image: String(l.image || l.logo || "").trim(),
    }))
    .filter(
      (l) =>
        l.image &&
        !l.image.includes("/brand/brand.png") &&
        l.image !== "/brand/brand.png"
    );
  const partners = {
    logos: mappedLogos.length > 0 ? mappedLogos : defaults.partners.logos,
  };

  const statsItems =
    Array.isArray(src.statistics?.items) && src.statistics.items.length
      ? src.statistics.items.map((it) => ({
          label: it.label || "",
          value: String(it.value || "").replace(/\+$/, "") || it.value || "",
          suffix:
            it.suffix != null
              ? it.suffix
              : String(it.value || "").endsWith("+")
                ? "+"
                : "",
        }))
      : defaults.statistics.items;

  const advantagesItems =
    Array.isArray(src.advantages?.items) && src.advantages.items.length
      ? src.advantages.items
      : defaults.advantages.items;

  const testimonialsItems =
    Array.isArray(src.testimonials?.items) && src.testimonials.items.length
      ? src.testimonials.items
      : defaults.testimonials.items;

  const catalogueItems =
    Array.isArray(src.catalogue?.items) && src.catalogue.items.length
      ? src.catalogue.items.map((c) => ({
          title: c.title || "Catalogue",
          category: c.category || "",
          image: c.image || "",
          pdfUrl: c.pdfUrl || "",
          fileName: c.fileName || "",
          downloadName: c.downloadName || c.fileName || "",
        }))
      : defaults.catalogue.items;

  const faqItems =
    Array.isArray(src.faq?.items) && src.faq.items.length
      ? src.faq.items
      : defaults.faq.items;

  const footerSrc = src.footer || {};
  const footer = {
    ...defaults.footer,
    ...footerSrc,
  };

  const galleryPageSrc = src.galleryPage || {};
  const collageRaw = Array.isArray(galleryPageSrc.collage)
    ? galleryPageSrc.collage.map((c) => String(c || "").trim()).filter(Boolean)
    : [];
  const galleryPage = {
    eyebrow: galleryPageSrc.eyebrow || defaults.galleryPage.eyebrow,
    title: galleryPageSrc.title || defaults.galleryPage.title,
    description: galleryPageSrc.description || defaults.galleryPage.description,
    collage:
      collageRaw.length > 0 ? collageRaw : defaults.galleryPage.collage,
  };

  return {
    hero,
    statistics: { items: statsItems },
    advantages: { items: advantagesItems },
    story,
    transition,
    testimonials: { items: testimonialsItems },
    catalogue: { items: catalogueItems },
    partners,
    faq: { items: faqItems },
    footer,
    galleryPage,
  };
}

const listSites = asyncHandler(async (_req, res) => {
  return res.json({ success: true, sites: SITES });
});

const getHome = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  let home = await HomePage.findOne({ siteId });
  if (!home) {
    home = await HomePage.create({
      siteId,
      sections: structuredClone(DEFAULT_HOME_SECTIONS),
    });
  }

  const sections = normalizeHomeSections(home.sections || {});

  // Persist normalized shape so admin "ready" state stays consistent
  const before = JSON.stringify(home.sections || {});
  const after = JSON.stringify(sections);
  if (before !== after) {
    home.sections = sections;
    home.markModified("sections");
    await home.save();
  }

  return res.json({ success: true, home: { sections } });
});

const updateHome = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const sections = normalizeHomeSections(req.body.sections || {});
  const home = await HomePage.findOneAndUpdate(
    { siteId },
    { $set: { sections } },
    { upsert: true, new: true }
  );

  return res.json({ success: true, home: { sections: home.sections || {} } });
});

const resetHome = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const home = await HomePage.findOneAndUpdate(
    { siteId },
    { $set: { sections: structuredClone(DEFAULT_HOME_SECTIONS) } },
    { upsert: true, new: true }
  );

  return res.json({ success: true, home: { sections: home.sections || {} } });
});

const listCategories = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const items = await Category.find({ siteId }).sort({ createdAt: -1 });
  return res.json({ success: true, items });
});

const createCategory = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const item = await Category.create({
    siteId,
    title: String(req.body.title || "").trim(),
    description: String(req.body.description || ""),
    image: String(req.body.image || ""),
    icon: String(req.body.icon || ""),
  });
  return res.status(201).json({ success: true, item });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Category.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title: String(req.body.title || "").trim(),
        description: String(req.body.description || ""),
        image: String(req.body.image || ""),
        icon: String(req.body.icon || ""),
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  return res.json({ success: true, item });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Category.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const listProducts = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  // Seed website catalogue products into CMS so admin + site share one list
  await ensureDefaultProducts(siteId);
  const items = await Product.find({ siteId }).sort({ createdAt: -1 });
  return res.json({ success: true, items });
});

const createProduct = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const title = String(req.body.title || "").trim();
  const slug = slugify(req.body.slug || title);
  if (!title || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  const item = await Product.create({
    siteId,
    title,
    slug,
    subtitle: String(req.body.subtitle || ""),
    productType: String(req.body.productType || ""),
    sectionTag: String(req.body.sectionTag || ""),
    description: String(req.body.description || ""),
    image: String(req.body.image || ""),
    icon: String(req.body.icon || ""),
    gallery: asStringArray(req.body.gallery),
    pdfUrl: String(req.body.pdfUrl || ""),
    featureHighlights: asFeatureHighlights(req.body.featureHighlights),
    category: String(req.body.category || ""),
    featured: Boolean(req.body.featured),
  });

  return res.status(201).json({ success: true, item });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const title = String(req.body.title || "").trim();
  const slug = slugify(req.body.slug || title);

  const item = await Product.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title,
        slug,
        subtitle: String(req.body.subtitle || ""),
        productType: String(req.body.productType || ""),
        sectionTag: String(req.body.sectionTag || ""),
        description: String(req.body.description || ""),
        image: String(req.body.image || ""),
        icon: String(req.body.icon || ""),
        gallery: asStringArray(req.body.gallery),
        pdfUrl: String(req.body.pdfUrl || ""),
        featureHighlights: asFeatureHighlights(req.body.featureHighlights),
        category: String(req.body.category || ""),
        featured: Boolean(req.body.featured),
      },
    },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  return res.json({ success: true, item });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Product.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

function asBodySections(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => ({
      title: String(s?.title || "").trim(),
      content: String(s?.content || "").trim(),
      image: String(s?.image || "").trim(),
    }))
    .filter((s) => s.title || s.content || s.image);
}

const BLOG_LOCALES = ["th", "pl"];

/** Keep only known per-locale blog fields so strict schema writes succeed. */
function asBlogTranslations(value) {
  const source = value && typeof value === "object" ? value : {};
  return BLOG_LOCALES.reduce((acc, locale) => {
    const entry = source[locale] && typeof source[locale] === "object"
      ? source[locale]
      : {};
    acc[locale] = {
      title: String(entry.title || "").trim(),
      excerpt: String(entry.excerpt || "").trim(),
      category: String(entry.category || "").trim(),
      bodySections: asBodySections(entry.bodySections),
      highlightTitle: String(entry.highlightTitle || "").trim(),
      highlightText: String(entry.highlightText || "").trim(),
      quote: String(entry.quote || "").trim(),
      quoteAuthor: String(entry.quoteAuthor || "").trim(),
    };
    return acc;
  }, {});
}

/**
 * Blog slugs are unique per site. Two articles can legitimately share a title,
 * so append a counter instead of rejecting the save.
 */
async function uniqueBlogSlug(siteId, baseSlug, excludeId) {
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const query = { siteId, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const taken = await Blog.exists(query);
    if (!taken) return candidate;
  }
  return `${baseSlug}-${Date.now()}`;
}

function contentFromBodySections(sections) {
  return asBodySections(sections)
    .map((s) => [s.title, s.content].filter(Boolean).join("\n"))
    .filter(Boolean)
    .join("\n\n");
}

const DEFAULT_BLOGS = [
  {
    title:
      "The Art of Teak: Why Heritage Timber Remains the Ultimate Kitchen Luxury",
    slug: "the-art-of-teak",
    excerpt:
      "From grain to finish, teak brings warmth, strength, and lasting character to every kitchen we craft—rooted in Thai heritage and modern living.",
    category: "Kitchen Design Trends",
    author: "Thailand Kitchen",
    readTime: "8 min",
    publishDate: "2024-05-12",
    image: "/blog/blogImage (1).jpg",
    gallery: ["/blog/blogImage (2).jpg", "/blog/blogImage (3).jpg"],
    bodySections: [
      {
        title: "A Legacy of Resilience",
        content:
          "Teak has long been prized across Thailand for its natural oils, rich grain, and remarkable resistance to moisture. In the kitchen—where heat, steam, and daily use put materials to the test—this heritage timber still stands as one of the most refined choices available.",
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
    title:
      "Open Concept Living: Designing a Kitchen That Connects the Whole Home",
    slug: "open-concept-kitchen-design",
    excerpt:
      "An open kitchen can become the heart of family life. Here’s how thoughtful layout and proportion create flow without sacrificing function.",
    category: "Layout & Space",
    author: "Thailand Kitchen",
    readTime: "6 min",
    publishDate: "2024-04-28",
    image: "/blog/blogImage (2).jpg",
    gallery: ["/blog/blogImage (1).jpg", "/blog/blogImage (3).jpg"],
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
    quote:
      "A kitchen should invite people in—not push them to the edges of the room.",
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
    image: "/blog/blogImage (3).jpg",
    gallery: ["/blog/blogImage (1).jpg", "/blog/blogImage (2).jpg"],
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
      "A modern kitchen should feel effortless every morning—and still look considered every evening.",
    quoteAuthor: "Thailand Kitchen Studio",
    published: true,
  },
];

async function ensureDefaultBlogs(siteId) {
  const existing = await Blog.find({ siteId }).select("slug").lean();
  const existingSlugs = new Set(
    existing.map((b) => String(b.slug || "").trim().toLowerCase())
  );
  const missing = DEFAULT_BLOGS.filter(
    (b) => !existingSlugs.has(String(b.slug).toLowerCase())
  );
  if (!missing.length) return;

  await Blog.insertMany(
    missing.map((b) => ({
      siteId,
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: contentFromBodySections(b.bodySections) || b.excerpt,
      image: b.image,
      gallery: b.gallery || [],
      category: b.category || "",
      author: b.author || "",
      readTime: b.readTime || "",
      publishDate: b.publishDate || "",
      bodySections: b.bodySections || [],
      highlightTitle: b.highlightTitle || "",
      highlightText: b.highlightText || "",
      quote: b.quote || "",
      quoteAuthor: b.quoteAuthor || "",
      published: b.published !== false,
    }))
  );
}

const listBlogs = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  await ensureDefaultBlogs(siteId);
  const items = await Blog.find({ siteId }).sort({ createdAt: -1 });
  return res.json({ success: true, items });
});

const createBlog = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }

  const title = String(req.body.title || "").trim();
  const baseSlug = slugify(req.body.slug || title);
  if (!title || !baseSlug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  const slug = await uniqueBlogSlug(siteId, baseSlug);
  const bodySections = asBodySections(req.body.bodySections);
  const content =
    String(req.body.content || "").trim() ||
    contentFromBodySections(bodySections);

  const item = await Blog.create({
    siteId,
    title,
    slug,
    excerpt: String(req.body.excerpt || ""),
    content,
    image: String(req.body.image || ""),
    gallery: asStringArray(req.body.gallery),
    category: String(req.body.category || ""),
    author: String(req.body.author || ""),
    readTime: String(req.body.readTime || ""),
    publishDate: String(req.body.publishDate || ""),
    bodySections,
    highlightTitle: String(req.body.highlightTitle || ""),
    highlightText: String(req.body.highlightText || ""),
    quote: String(req.body.quote || ""),
    quoteAuthor: String(req.body.quoteAuthor || ""),
    translations: asBlogTranslations(req.body.translations),
    published: req.body.published !== false,
  });

  return res.status(201).json({ success: true, item });
});

const updateBlog = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const title = String(req.body.title || "").trim();
  const baseSlug = slugify(req.body.slug || title);
  if (!title || !baseSlug) {
    return res
      .status(400)
      .json({ success: false, message: "Title and slug are required" });
  }

  const slug = await uniqueBlogSlug(siteId, baseSlug, id);
  const bodySections = asBodySections(req.body.bodySections);
  const content =
    String(req.body.content || "").trim() ||
    contentFromBodySections(bodySections);

  const item = await Blog.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title,
        slug,
        excerpt: String(req.body.excerpt || ""),
        content,
        image: String(req.body.image || ""),
        gallery: asStringArray(req.body.gallery),
        category: String(req.body.category || ""),
        author: String(req.body.author || ""),
        readTime: String(req.body.readTime || ""),
        publishDate: String(req.body.publishDate || ""),
        bodySections,
        highlightTitle: String(req.body.highlightTitle || ""),
        highlightText: String(req.body.highlightText || ""),
        quote: String(req.body.quote || ""),
        quoteAuthor: String(req.body.quoteAuthor || ""),
        translations: asBlogTranslations(req.body.translations),
        published: req.body.published !== false,
      },
    },
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }
  return res.json({ success: true, item });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await Blog.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const DEFAULT_LEGAL = {
  privacy: {
    title: "PRIVACY POLICY",
    subtitle: "HOW WE COLLECT, USE, AND PROTECT YOUR PERSONAL INFORMATION.",
    updatedLabel: "July 2026",
    sections: [
      {
        title: "Information We Collect",
        body: "When you request a kitchen consultation, design quote, or contact our support team, we may collect your name, email address, phone number, property address, and project requirements. This information is used solely to provide you with our modular kitchen services.",
      },
      {
        title: "How We Use Your Information",
        body: "We use your data to deliver custom modular kitchen designs, coordinate site measurements and installation, and provide project updates. Your information helps us craft kitchens that perfectly match your lifestyle and Thai island home.",
      },
      {
        title: "Information Sharing & Security",
        body: "We do not sell or rent your personal data. Information is only shared with trusted installation partners and hardware suppliers necessary to complete your kitchen project. We implement industry-standard security measures to protect your data.",
      },
      {
        title: "Your Privacy Rights & Contact",
        body: "You have the right to access, correct, or delete your personal data at any time. For privacy-related inquiries or to exercise your rights, please contact us at thailandkichens@gmail.com.",
      },
    ],
  },
  terms: {
    title: "TERMS & CONDITIONS",
    subtitle: "TERMS OF USE AND SERVICE AGREEMENT FOR OUR KITCHEN SERVICES.",
    updatedLabel: "July 2026",
    sections: [
      {
        title: "Acceptance of Terms",
        body: "By accessing our website, booking a consultation, or placing an order for a modular kitchen, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.",
      },
      {
        title: "Quotations, Orders & Payment Terms",
        body: "All quotations are valid for 30 days from the date of issue. A deposit is required to commence manufacturing. The remaining balance is due upon completion of manufacturing and prior to delivery/installation, unless otherwise agreed in writing.",
      },
      {
        title: "Site Measurement & Installation",
        body: "Accurate site preparation (including plumbing and electrical readiness) is the client's responsibility unless otherwise contracted. Our technical team will schedule measurements and installation windows in coordination with you.",
      },
      {
        title: "Warranty & After-Sales Support",
        body: "We provide a 10-year structural warranty on HDMR carcase construction and Blum/Hettich hardware (subject to manufacturer terms and fair use). Cosmetic finishes and consumables may carry separate coverage as stated in your order documents.",
      },
    ],
  },
};

function serializeLegalSections(sections) {
  if (!Array.isArray(sections) || !sections.length) return "";
  return sections
    .map((s, i) => {
      const title = String(s?.title || "").trim();
      const body = String(s?.body || "").trim();
      if (!title && !body) return "";
      return `${i + 1}. ${title}\n${body}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");
}

function parseLegalSectionsFromContent(content) {
  const text = String(content || "").trim();
  if (!text) return [];
  const parts = text.split(/\n(?=\d+\.\s+)/);
  return parts
    .map((block) => {
      const trimmed = block.trim();
      const match = trimmed.match(/^(?:\d+\.\s*)?([^\n]+)\n?([\s\S]*)$/);
      if (!match) return null;
      return {
        title: String(match[1] || "").trim(),
        body: String(match[2] || "").trim(),
      };
    })
    .filter((s) => s && (s.title || s.body));
}

function asLegalSections(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => ({
      title: String(s?.title || "").trim(),
      body: String(s?.body || "").trim(),
    }))
    .filter((s) => s.title || s.body);
}

const getLegal = asyncHandler(async (req, res) => {
  const { siteId, type } = req.params;
  if (!assertSite(siteId) || !["privacy", "terms"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const defaults = DEFAULT_LEGAL[type];
  let page = await LegalPage.findOne({ siteId, type });
  if (!page) {
    page = await LegalPage.create({
      siteId,
      type,
      title: defaults.title,
      subtitle: defaults.subtitle,
      updatedLabel: defaults.updatedLabel,
      sections: defaults.sections,
      content: serializeLegalSections(defaults.sections),
    });
  } else {
    let dirty = false;
    if (!String(page.title || "").trim()) {
      page.title = defaults.title;
      dirty = true;
    }
    if (!String(page.subtitle || "").trim()) {
      page.subtitle = defaults.subtitle;
      dirty = true;
    }
    if (!String(page.updatedLabel || "").trim()) {
      page.updatedLabel = defaults.updatedLabel;
      dirty = true;
    }
    if (!Array.isArray(page.sections) || page.sections.length === 0) {
      const fromContent = parseLegalSectionsFromContent(page.content);
      page.sections = fromContent.length ? fromContent : defaults.sections;
      dirty = true;
    }
    if (!String(page.content || "").trim()) {
      page.content = serializeLegalSections(page.sections);
      dirty = true;
    }
    if (dirty) await page.save();
  }

  return res.json({ success: true, page });
});

const updateLegal = asyncHandler(async (req, res) => {
  const { siteId, type } = req.params;
  if (!assertSite(siteId) || !["privacy", "terms"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  const defaults = DEFAULT_LEGAL[type];
  let sections = asLegalSections(req.body.sections);
  if (!sections.length && req.body.content) {
    sections = parseLegalSectionsFromContent(req.body.content);
  }
  if (!sections.length) sections = defaults.sections;

  const title =
    String(req.body.title || "").trim() || defaults.title;
  const subtitle =
    String(req.body.subtitle || "").trim() || defaults.subtitle;
  const updatedLabel =
    String(req.body.updatedLabel || "").trim() || defaults.updatedLabel;
  const content =
    String(req.body.content || "").trim() || serializeLegalSections(sections);

  const page = await LegalPage.findOneAndUpdate(
    { siteId, type },
    {
      $set: {
        title,
        subtitle,
        updatedLabel,
        sections,
        content,
      },
    },
    { upsert: true, new: true }
  );

  return res.json({ success: true, page });
});

const listGallery = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  await ensureDefaultGallery(siteId);
  const items = await GalleryItem.find({ siteId }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  return res.json({ success: true, items });
});

const createGalleryItem = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const item = await GalleryItem.create({
    siteId,
    title: String(req.body.title || "").trim() || "Gallery image",
    image: String(req.body.image || ""),
    filter: String(req.body.filter || "Style & Color"),
    tall: Boolean(req.body.tall),
    wide: Boolean(req.body.wide),
    sortOrder: Number(req.body.sortOrder) || 0,
  });
  return res.status(201).json({ success: true, item });
});

const updateGalleryItem = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await GalleryItem.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title: String(req.body.title || "").trim() || "Gallery image",
        image: String(req.body.image || ""),
        filter: String(req.body.filter || "Style & Color"),
        tall: Boolean(req.body.tall),
        wide: Boolean(req.body.wide),
        sortOrder: Number(req.body.sortOrder) || 0,
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, item });
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await GalleryItem.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const listCatalogues = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const items = await CatalogueItem.find({ siteId }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  return res.json({ success: true, items });
});

const createCatalogue = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const item = await CatalogueItem.create({
    siteId,
    title: String(req.body.title || "").trim() || "Catalogue",
    category: String(req.body.category || ""),
    image: String(req.body.image || ""),
    pdfUrl: String(req.body.pdfUrl || ""),
    fileName: String(req.body.fileName || ""),
    downloadName: String(req.body.downloadName || ""),
    sortOrder: Number(req.body.sortOrder) || 0,
  });
  return res.status(201).json({ success: true, item });
});

const updateCatalogue = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await CatalogueItem.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        title: String(req.body.title || "").trim() || "Catalogue",
        category: String(req.body.category || ""),
        image: String(req.body.image || ""),
        pdfUrl: String(req.body.pdfUrl || ""),
        fileName: String(req.body.fileName || ""),
        downloadName: String(req.body.downloadName || ""),
        sortOrder: Number(req.body.sortOrder) || 0,
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, item });
});

const deleteCatalogue = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await CatalogueItem.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

const listFaqs = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const items = await FaqItem.find({ siteId }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  return res.json({ success: true, items });
});

const createFaq = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  if (!assertSite(siteId)) {
    return res.status(400).json({ success: false, message: "Invalid site" });
  }
  const question = String(req.body.question || "").trim();
  if (!question) {
    return res.status(400).json({ success: false, message: "Question required" });
  }
  const item = await FaqItem.create({
    siteId,
    question,
    answer: String(req.body.answer || ""),
    sortOrder: Number(req.body.sortOrder) || 0,
  });
  return res.status(201).json({ success: true, item });
});

const updateFaq = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const question = String(req.body.question || "").trim();
  if (!question) {
    return res.status(400).json({ success: false, message: "Question required" });
  }
  const item = await FaqItem.findOneAndUpdate(
    { _id: id, siteId },
    {
      $set: {
        question,
        answer: String(req.body.answer || ""),
        sortOrder: Number(req.body.sortOrder) || 0,
      },
    },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, item });
});

const deleteFaq = asyncHandler(async (req, res) => {
  const { siteId, id } = req.params;
  const item = await FaqItem.findOneAndDelete({ _id: id, siteId });
  if (!item) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  return res.json({ success: true, message: "Deleted" });
});

module.exports = {
  listSites,
  getHome,
  updateHome,
  resetHome,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getLegal,
  updateLegal,
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  listCatalogues,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
};
