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
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    productType: { type: String, default: "" },
    sectionTag: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    icon: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    pdfUrl: { type: String, default: "" },
    featureHighlights: {
      type: [
        {
          title: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    category: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ siteId: 1, slug: 1 }, { unique: true });

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
  },
  { timestamps: true }
);

blogSchema.index({ siteId: 1, slug: 1 }, { unique: true });

const legalPageSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true },
    type: { type: String, enum: ["privacy", "terms"], required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    updatedLabel: { type: String, default: "" },
    content: { type: String, default: "" },
    sections: {
      type: [
        {
          title: { type: String, default: "" },
          body: { type: String, default: "" },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

legalPageSchema.index({ siteId: 1, type: 1 }, { unique: true });

const galleryItemSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true, default: "" },
    filter: {
      type: String,
      default: "Style & Color",
      enum: [
        "Layout & Space",
        "Storage",
        "Style & Color",
        "Materials",
      ],
    },
    tall: { type: Boolean, default: false },
    wide: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const catalogueItemSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    downloadName: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const faqItemSchema = new mongoose.Schema(
  {
    siteId: { type: String, enum: SITE_IDS, required: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

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
};
