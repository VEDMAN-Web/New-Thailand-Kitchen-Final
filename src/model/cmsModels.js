const mongoose = require("mongoose");

const SITE_IDS = ["thailand-kitchen", "varsovia-kitchen"];

const homePageSchema = new mongoose.Schema(
  {
    siteId: {
      type: String,
      enum: SITE_IDS,
      required: true,
      unique: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: mongoose.Schema.Types.Mixed, default: "" },
    image: { type: String, default: "" },
    icon: { type: String, default: "" },
    // SEO & Taxonomy Fields
    slug: { 
      type: String, 
      default: "", 
      trim: true, 
      lowercase: true,
      index: true,
      validate: {
        validator: function(v) {
          // Allow empty OR valid URL-safe slug (lowercase letters, numbers, hyphens only)
          return !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
        },
        message: 'Slug must be URL-safe (lowercase letters, numbers, and hyphens only)'
      }
    },
    categoryType: { 
      type: String, 
      enum: ["service", "material", "style", "layout", "property-type", "location", "built-in-furniture", ""], 
      default: "",
      index: true 
    },
    parentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CmsCategory", 
      default: null,
      index: true
    },
    metaTitle: { 
      type: String, 
      default: "",
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
      trim: true
    },
    metaDescription: { 
      type: String, 
      default: "",
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      trim: true
    },
    canonicalUrl: { 
      type: String, 
      default: "",
      trim: true
    },
    indexable: { 
      type: Boolean, 
      default: false, 
      index: true 
    },
    /** Rich landing page blocks (heading, body, image, layout). */
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    eyebrow: { type: mongoose.Schema.Types.Mixed, default: "" },
    ctaLabel: { type: mongoose.Schema.Types.Mixed, default: "" },
    ctaHref: { type: String, default: "/contact", trim: true },
    footerCtaHeading: { type: mongoose.Schema.Types.Mixed, default: "" },
    footerCtaBody: { type: mongoose.Schema.Types.Mixed, default: "" },
  },
  { timestamps: true }
);

// Unique per site + type + slug + parent (allows same service slug under different locations).
categorySchema.index(
  { siteId: 1, categoryType: 1, slug: 1, parentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      slug: { $type: "string", $gt: "" },
      categoryType: { $type: "string", $gt: "" },
    },
  }
);
categorySchema.index({ siteId: 1, categoryType: 1 });
categorySchema.index({ siteId: 1, indexable: 1 });

const productSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    slug: { type: String, required: true, trim: true },
    subtitle: { type: mongoose.Schema.Types.Mixed, default: "" },
    productType: { type: mongoose.Schema.Types.Mixed, default: "" },
    sectionTag: { type: mongoose.Schema.Types.Mixed, default: "" },
    description: { type: mongoose.Schema.Types.Mixed, default: "" },
    image: { type: String, default: "" },
    icon: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    /** Side image on product detail contact band (falls back to `image`). */
    contactImage: { type: String, default: "" },
    contactEyebrow: { type: mongoose.Schema.Types.Mixed, default: "" },
    contactTitle: { type: mongoose.Schema.Types.Mixed, default: "" },
    contactFormTitle: { type: mongoose.Schema.Types.Mixed, default: "" },
    pdfUrl: { type: String, default: "" },
    featureHighlights: {
      type: [
        {
          title: { type: mongoose.Schema.Types.Mixed, default: "" },
          description: { type: mongoose.Schema.Types.Mixed, default: "" },
        },
      ],
      default: [],
    },
    category: { type: mongoose.Schema.Types.Mixed, default: "" },
    featured: { type: Boolean, default: false },
    finish: { type: mongoose.Schema.Types.Mixed, default: "" },
    material: { type: mongoose.Schema.Types.Mixed, default: "" },
    style: { type: mongoose.Schema.Types.Mixed, default: "" },
    color: { type: mongoose.Schema.Types.Mixed, default: "" },
    // SEO Fields
    metaTitle: { 
      type: String, 
      default: "",
      maxlength: [60, 'Meta title cannot exceed 60 characters'],
      trim: true
    },
    metaDescription: { 
      type: String, 
      default: "",
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      trim: true
    },
    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
    },
    indexable: { 
      type: Boolean, 
      default: false,
      index: true
    },
  },
  { timestamps: true }
);

productSchema.index({ siteId: 1, slug: 1 }, { unique: true });
productSchema.index({ siteId: 1, indexable: 1 });
productSchema.index({ siteId: 1, createdAt: -1 });

/** Per-locale copy for a blog. Empty fields fall back to the English base. */
const blogTranslationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    category: { type: String, default: "" },
    bodySections: {
      type: [
        {
          title: { type: String, default: "" },
          content: { type: String, default: "" },
          image: { type: String, default: "" },
        },
      ],
      default: [],
    },
    highlightTitle: { type: String, default: "" },
    highlightText: { type: String, default: "" },
    quote: { type: String, default: "" },
    quoteAuthor: { type: String, default: "" },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    image: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    category: { type: String, default: "" },
    author: { type: String, default: "" },
    readTime: { type: String, default: "" },
    publishDate: { type: String, default: "" },
    bodySections: {
      type: [
        {
          title: { type: String, default: "" },
          content: { type: String, default: "" },
          image: { type: String, default: "" },
        },
      ],
      default: [],
    },
    highlightTitle: { type: String, default: "" },
    highlightText: { type: String, default: "" },
    quote: { type: String, default: "" },
    quoteAuthor: { type: String, default: "" },
    translations: {
      th: { type: blogTranslationSchema, default: () => ({}) },
      pl: { type: blogTranslationSchema, default: () => ({}) },
    },
    published: { type: Boolean, default: true },
    // SEO & Linking Fields
    primaryCommercialPage: { 
      type: String, 
      default: "",
      trim: true
    },
    locationTag: { 
      type: String, 
      default: "",
      trim: true,
      index: true
    },
    serviceTag: { 
      type: String, 
      default: "",
      trim: true,
      index: true
    },
    materialTag: { 
      type: String, 
      default: "",
      trim: true
    },
    metaTitle: {
      type: String,
      default: "",
      maxlength: [60, "Meta title cannot exceed 60 characters"],
      trim: true,
    },
    metaDescription: { 
      type: String, 
      default: "",
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      trim: true
    },
    reviewer: { 
      type: String, 
      default: "",
      trim: true
    },
  },
  { timestamps: true }
);

blogSchema.index({ siteId: 1, slug: 1 }, { unique: true });
blogSchema.index({ siteId: 1, published: 1 });
blogSchema.index({ siteId: 1, locationTag: 1 });
blogSchema.index({ siteId: 1, serviceTag: 1 });

const legalPageSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true },
    type: { type: String, enum: ["privacy", "terms"], required: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    subtitle: { type: mongoose.Schema.Types.Mixed, default: "" },
    updatedLabel: { type: mongoose.Schema.Types.Mixed, default: "" },
    content: { type: mongoose.Schema.Types.Mixed, default: "" },
    sections: {
      type: [
        {
          title: { type: mongoose.Schema.Types.Mixed, default: "" },
          body: { type: mongoose.Schema.Types.Mixed, default: "" },
        },
      ],
      default: [],
    },
    /** Set when the owner confirms deposit / warranty / commercial clauses (DEV-29). */
    ownerConfirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

legalPageSchema.index({ siteId: 1, type: 1 }, { unique: true });

const galleryItemSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    image: { type: String, required: true, default: "" },
    filter: {
      type: String,
      default: "Style & Color",
      trim: true,
      maxlength: [80, "Gallery filter cannot exceed 80 characters"],
    },
    tall: { type: Boolean, default: false },
    wide: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    // Project Tagging Fields
    locationTag: { 
      type: String, 
      default: "",
      trim: true,
      index: true
    },
    layoutTag: { 
      type: String, 
      default: "",
      trim: true,
      index: true
    },
    styleTag: { 
      type: String, 
      default: "",
      trim: true
    },
    materialTag: { 
      type: String, 
      default: "",
      trim: true
    },
    propertyType: { 
      type: String, 
      default: "",
      trim: true,
      index: true
    },
    projectTitle: { 
      type: String, 
      default: "",
      trim: true
    },
    projectDesc: { 
      type: String, 
      default: "",
      maxlength: [300, 'Project description cannot exceed 300 characters'],
      trim: true
    },
  },
  { timestamps: true }
);

galleryItemSchema.index({ siteId: 1, locationTag: 1 });
galleryItemSchema.index({ siteId: 1, layoutTag: 1 });
galleryItemSchema.index({ siteId: 1, propertyType: 1 });

const catalogueItemSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    downloadName: { type: String, default: "" },
    editionKey: { type: String, default: "", trim: true, lowercase: true },
    locked: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const faqItemSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    question: { type: mongoose.Schema.Types.Mixed, required: true },
    answer: { type: mongoose.Schema.Types.Mixed, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const cmsDeletionSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    resource: { type: String, required: true },
    key: { type: String, required: true },
  },
  { timestamps: true }
);

cmsDeletionSchema.index({ siteId: 1, resource: 1, key: 1 }, { unique: true });

module.exports = {
  SITE_IDS,
  HomePage: mongoose.model("CmsHomePage", homePageSchema),
  Category: mongoose.model("CmsCategory", categorySchema),
  Product: mongoose.model("CmsProduct", productSchema),
  Blog: mongoose.model("CmsBlog", blogSchema),
  LegalPage: mongoose.model("CmsLegalPage", legalPageSchema),
  GalleryItem: mongoose.model("CmsGalleryItem", galleryItemSchema),
  CatalogueItem: mongoose.model("CmsCatalogueItem", catalogueItemSchema),
  FaqItem: mongoose.model("CmsFaqItem", faqItemSchema),
  CmsDeletion: mongoose.model("CmsDeletion", cmsDeletionSchema),
};
