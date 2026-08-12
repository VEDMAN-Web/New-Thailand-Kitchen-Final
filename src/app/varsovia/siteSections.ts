import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Map as MapIcon,
  MapPin,
  BookOpen,
  BriefcaseBusiness,
  Contact,
  FileDown,
  FolderKanban,
  Globe2,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquareQuote,
  Navigation,
  Package,
  Share2,
  Sparkles,
  Wrench,
  Sofa,
  Building2,
  HardHat,
  Newspaper,
  Shield,
  ScrollText,
} from "lucide-react";

export type MediaKind = "image" | "icon" | "pdf";
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "json"
  | "string-list"
  | "localized-string-list"
  | "stats-list"
  | "process-list"
  | "faq-list"
  | "showcase-meta-list"
  | "tool-list"
  | "spec-list"
  | "content-sections"
  | "strength-list"
  | "office-list"
  | "search-page-list"
  | "footer-nav"
  | "inquiry-form"
  | "select"
  | "ia-children-list"
  | "section-divider";

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  localized?: boolean;
  required?: boolean;
  media?: MediaKind;
  itemKey?: string;
  options?: { value: string; label: string }[];
  /** Hard character limit for text/textarea (hub meta 60/160). */
  maxLength?: number;
  /** Fixed slot labels for string-list image fields (Image 1, Image 2…). */
  listLabels?: string[];
  /** Ensure at least this many slots render (pads with empty strings). */
  minItems?: number;
  /** Hub key for Live URL preview when type is ia-children-list */
  iaHubKey?: string;
  /** Short help under the label for non-technical editors. */
  helpText?: string;
};

export type SiteSection = {
  id: string;
  title: string;
  description: string;
  fields: Field[];
  icon: LucideIcon;
  /** Optional group label in the Site Settings rail */
  group?: "home" | "pages" | "chrome";
};

function pageSeoFields(prefix: string): Field[] {
  return [
    {
      key: `${prefix}.indexable`,
      label: "Show in Google sitemap (Indexable)",
      type: "boolean",
      helpText: "Leave OFF until final copy is approved.",
    },
    {
      key: `${prefix}.metaTitle`,
      label: "Google title (browser tab)",
      localized: true,
      maxLength: 60,
    },
    {
      key: `${prefix}.metaDescription`,
      label: "Google description",
      localized: true,
      type: "textarea",
      maxLength: 160,
    },
  ];
}

function legalDocFields(docKey: "privacy" | "terms", label: string): Field[] {
  const p = `legalPages.${docKey}`;
  return [
    {
      key: `${p}.__div`,
      label,
      type: "section-divider",
      helpText: `Content and SEO for /${docKey}.`,
    },
    ...pageSeoFields(p),
    { key: `${p}.title`, label: "Page title", localized: true },
    { key: `${p}.subtitle`, label: "Page subtitle", localized: true },
    { key: `${p}.updated`, label: "Last updated line", localized: true },
    {
      key: `${p}.blocks`,
      label: "Content sections",
      type: "content-sections",
      helpText: "Heading + body blocks shown on the legal page.",
    },
  ];
}

/**
 * Site Settings sections — ordered like the live Varsovia site.
 * Home block matches `/` section order exactly.
 */
const SITE_SECTIONS_CORE: SiteSection[] = [
  {
    id: "hero",
    title: "1. Hero",
    description: "Home · top banner",
    group: "home",
    icon: ImageIcon,
    fields: [
      { key: "heroEyebrow", label: "Hero Eyebrow", localized: true },
      { key: "heroHeadline", label: "Hero Headline", localized: true },
      { key: "heroSubtitle", label: "Hero Subtitle", localized: true, type: "textarea" },
      { key: "heroImage", label: "Hero Image (1) — full-bleed banner", media: "image" },
      { key: "heroPrimaryCtaLabel", label: "Primary CTA Label", localized: true },
      { key: "heroPrimaryCtaHref", label: "Primary CTA Link" },
      { key: "heroSecondaryCtaLabel", label: "Secondary CTA Label", localized: true },
      { key: "heroSecondaryCtaHref", label: "Secondary CTA Link" },
    ],
  },
  {
    id: "about",
    title: "2. About",
    description: "Home · about strip",
    group: "home",
    icon: BookOpen,
    fields: [
      { key: "aboutTitle", label: "About Title", localized: true },
      { key: "aboutText", label: "About Text", localized: true, type: "textarea" },
      {
        key: "aboutImages",
        label: "About Images — home collage (3 slots)",
        type: "string-list",
        media: "image",
        minItems: 3,
        listLabels: [
          "Image 1 — Left large tile",
          "Image 2 — Right mid tile",
          "Image 3 — Bottom overlapping tile",
        ],
      },
    ],
  },
  {
    id: "stats",
    title: "3. Statistics",
    description: "Home · counters",
    group: "home",
    icon: BarChart3,
    fields: [
      { key: "stats", label: "Statistics", type: "stats-list" },
      { key: "statsImage", label: "Statistics Image (1) — side photo", media: "image" },
    ],
  },
  {
    id: "featured",
    title: "4. Featured Projects",
    description: "Home · featured carousel",
    group: "home",
    icon: FolderKanban,
    fields: [
      {
        key: "featured.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the project carousel on the home page.",
      },
      { key: "sectionCopy.featured.title", label: "Featured Projects Title", localized: true },
      { key: "sectionCopy.featured.subtitle", label: "Featured Projects Subtitle", localized: true },
      { key: "sectionCopy.featured.ctaLabel", label: "Button label", localized: true },
      { key: "sectionCopy.featured.ctaHref", label: "Button link", helpText: "e.g. /projects" },
      {
        key: "featured.__div_items",
        label: "Carousel projects",
        type: "section-divider",
        helpText:
          "Manage project cards below (cover image, title, order, visibility). Visible projects appear in the home carousel.",
      },
    ],
  },
  {
    id: "catalogue",
    title: "5. Free Catalogue",
    description: "Home · catalogue section",
    group: "home",
    icon: FileDown,
    fields: [
      {
        key: "catalogue.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the downloadable catalogue carousel.",
      },
      { key: "sectionCopy.catalogue.title", label: "Catalogue Section Title", localized: true },
      { key: "sectionCopy.catalogue.subtitle", label: "Catalogue Section Subtitle", localized: true },
      {
        key: "catalogue.__div_items",
        label: "Catalogue PDFs",
        type: "section-divider",
        helpText: "Add cover image + PDF for each brochure. Background collage uses Contact images (section 10).",
      },
    ],
  },
  {
    id: "products",
    title: "6. Products",
    description: "Home · products grid headings",
    group: "home",
    icon: Package,
    fields: [
      {
        key: "products.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the home products grid.",
      },
      { key: "sectionCopy.products.title", label: "Products Section Title", localized: true },
      { key: "sectionCopy.products.subtitle", label: "Products Section Subtitle", localized: true },
      { key: "sectionCopy.products.ctaLabel", label: "Button label", localized: true },
      { key: "sectionCopy.products.ctaHref", label: "Button link", helpText: "e.g. /interior-design" },
      {
        key: "products.__div_items",
        label: "Product cards",
        type: "section-divider",
        helpText: "Manage product cards below (image, title, description, category, order, visibility).",
      },
    ],
  },
  {
    id: "testimonials",
    title: "7. Testimonials",
    description: "Home · testimonials headings",
    group: "home",
    icon: MessageSquareQuote,
    fields: [
      {
        key: "testimonials.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the testimonials slider.",
      },
      { key: "sectionCopy.testimonials.title", label: "Testimonials Section Title", localized: true },
      { key: "sectionCopy.testimonials.subtitle", label: "Testimonials Section Subtitle", localized: true },
      {
        key: "testimonials.__div_items",
        label: "Customer reviews",
        type: "section-divider",
        helpText: "Add quotes, names, photos, and star ratings below.",
      },
    ],
  },
  {
    id: "coreStrengths",
    title: "8. Core Strengths",
    description: "Home · strengths headings",
    group: "home",
    icon: Sparkles,
    fields: [
      {
        key: "coreStrengths.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the strengths carousel.",
      },
      { key: "sectionCopy.coreStrengths.title", label: "Core Strengths Title", localized: true },
      { key: "sectionCopy.coreStrengths.subtitle", label: "Core Strengths Subtitle", localized: true },
      {
        key: "coreStrengths.__div_items",
        label: "Strength cards",
        type: "section-divider",
        helpText: "Manage strength cards below (title, description, image, icon, order).",
      },
    ],
  },
  {
    id: "partners",
    title: "9. Partners",
    description: "Home · partners headings",
    group: "home",
    icon: Globe2,
    fields: [
      {
        key: "partners.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the partner logo strip.",
      },
      { key: "sectionCopy.partners.title", label: "Partners Section Title", localized: true },
      { key: "sectionCopy.partners.subtitle", label: "Partners Section Subtitle", localized: true },
      {
        key: "partners.__div_items",
        label: "Partner logos",
        type: "section-divider",
        helpText: "Add partner name, logo, website link, and visibility below.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    description: "Home contact strip + /contact page · form, headings & details",
    group: "home",
    icon: Contact,
    fields: [
      {
        key: "inquiryForm",
        label: "Contact Form Fields (labels, placeholders, options, required)",
        type: "inquiry-form",
      },
      { key: "sectionCopy.contact.title", label: "Contact Section Title", localized: true },
      { key: "sectionCopy.contact.subtitle", label: "Contact Section Subtitle", localized: true },
      {
        key: "contactImages",
        label: "Contact Images — collage (7 slots)",
        type: "string-list",
        media: "image",
        minItems: 7,
        listLabels: [
          "Image 1 — Contact collage tile 1",
          "Image 2 — Contact collage tile 2",
          "Image 3 — Contact collage tile 3",
          "Image 4 — Contact collage tile 4",
          "Image 5 — Contact collage tile 5",
          "Image 6 — Contact collage tile 6",
          "Image 7 — Contact collage tile 7",
        ],
      },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", localized: true, type: "textarea" },
      { key: "contactPhone", label: "Footer Contact Phone" },
      { key: "mobileWhatsapp", label: "Footer Mobile / WhatsApp Number" },
    ],
  },
  {
    id: "aboutPage",
    title: "About Page",
    description: "/about · hero → values → story → process (matches live page top to bottom)",
    group: "pages",
    icon: BookOpen,
    fields: [
      {
        key: "aboutPage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Subtitle + intro under the page title. Hero banner uses Home → 2. About images.",
      },
      { key: "aboutHeroSubtitle", label: "Hero subtitle", localized: true },
      { key: "aboutIntro", label: "Intro paragraph", localized: true, type: "textarea" },
      {
        key: "aboutPage.__div_values",
        label: "2 · Vision, mission & values",
        type: "section-divider",
        helpText: "Three cards shown after the hero on /about.",
      },
      { key: "vision.title", label: "Vision title", localized: true },
      { key: "vision.text", label: "Vision text", localized: true, type: "textarea" },
      { key: "vision.icon", label: "Vision icon", media: "image" },
      { key: "mission.title", label: "Mission title", localized: true },
      { key: "mission.text", label: "Mission text", localized: true, type: "textarea" },
      { key: "mission.icon", label: "Mission icon", media: "image" },
      { key: "values.title", label: "Values title", localized: true },
      { key: "values.text", label: "Values text", localized: true, type: "textarea" },
      { key: "values.icon", label: "Values icon", media: "image" },
      {
        key: "aboutPage.__div_story",
        label: "3 · Our story",
        type: "section-divider",
        helpText: "Story copy + four-image gallery grid.",
      },
      { key: "aboutStory", label: "Story text", localized: true, type: "textarea" },
      {
        key: "aboutStoryImages",
        label: "Story gallery (4 slots)",
        type: "string-list",
        media: "image",
        minItems: 4,
        listLabels: [
          "Story image 1",
          "Story image 2",
          "Story image 3",
          "Story image 4",
        ],
      },
      {
        key: "aboutPage.__div_process",
        label: "4 · Process timeline",
        type: "section-divider",
        helpText: "Four numbered steps at the bottom of /about.",
      },
      { key: "processSteps", label: "Process steps", type: "process-list" },
      {
        key: "aboutPage.__div_seo",
        label: "5 · Google / SEO",
        type: "section-divider",
        helpText: "Browser tab title and Google listing for /about.",
      },
      ...pageSeoFields("aboutPageSettings"),
    ],
  },
  {
    id: "teamPage",
    title: "Team Page",
    description: "/team · hero → intro → stats → teams → tools (matches live page)",
    group: "pages",
    icon: BriefcaseBusiness,
    fields: [
      {
        key: "teamPage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Top banner on /team. Member photos are managed under Team members.",
      },
      { key: "teamPage.heroTitle", label: "Hero title", localized: true },
      { key: "teamPage.heroSubtitle", label: "Hero subtitle", localized: true },
      {
        key: "teamPage.__div_intro",
        label: "2 · Intro & stats",
        type: "section-divider",
      },
      { key: "teamPage.intro", label: "Intro paragraph", localized: true, type: "textarea" },
      { key: "teamPage.stats", label: "Stats counters", type: "stats-list" },
      {
        key: "teamPage.__div_teams",
        label: "3 · Team sections",
        type: "section-divider",
        helpText: "Headings above each team grid. Rosters come from Team members.",
      },
      { key: "teamPage.designTitle", label: "Design team title", localized: true },
      { key: "teamPage.designEyebrow", label: "Design team eyebrow", localized: true },
      { key: "teamPage.designBody", label: "Design team intro", localized: true, type: "textarea" },
      { key: "teamPage.architectTitle", label: "Architect team title", localized: true },
      { key: "teamPage.architectEyebrow", label: "Architect team eyebrow", localized: true },
      { key: "teamPage.architectBody", label: "Architect team intro", localized: true, type: "textarea" },
      {
        key: "teamPage.__div_tools",
        label: "4 · Design tools",
        type: "section-divider",
      },
      { key: "teamPage.toolsTitle", label: "Tools section title", localized: true },
      { key: "teamPage.toolsBody", label: "Tools section body", localized: true, type: "textarea" },
      { key: "designTools", label: "Tool logos", type: "tool-list" },
      {
        key: "teamPage.__div_seo",
        label: "5 · Google / SEO",
        type: "section-divider",
        helpText: "Browser tab title and Google listing for /team.",
      },
      { key: "teamPage.indexable", label: "Show in Google sitemap (Indexable)", type: "boolean" },
      { key: "teamPage.metaTitle", label: "Google title (browser tab)", localized: true, maxLength: 60 },
      {
        key: "teamPage.metaDescription",
        label: "Google description",
        localized: true,
        type: "textarea",
        maxLength: 160,
      },
    ],
  },
  {
    id: "qualitySale",
    title: "Quality After Sales",
    description: "/quality-sale · hero → features → support → FAQ (matches live page)",
    group: "pages",
    icon: Wrench,
    fields: [
      {
        key: "qualitySale.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
      },
      { key: "qualitySale.heroTitle", label: "Hero title", localized: true },
      { key: "qualitySale.heroSubtitle", label: "Hero subtitle", localized: true },
      { key: "qualitySale.heroBody", label: "Hero body", localized: true, type: "textarea" },
      {
        key: "qualitySale.__div_features",
        label: "2 · Feature columns",
        type: "section-divider",
        helpText: "Four alternating image + card columns.",
      },
      { key: "qualitySale.feature1Title", label: "Feature 1 title", localized: true },
      { key: "qualitySale.feature1Image", label: "Feature 1 image", media: "image" },
      { key: "qualitySale.feature1ImageAlt", label: "Feature 1 alt text", localized: true },
      { key: "qualitySale.feature2Title", label: "Feature 2 title", localized: true },
      { key: "qualitySale.feature2Image", label: "Feature 2 image", media: "image" },
      { key: "qualitySale.feature2ImageAlt", label: "Feature 2 alt text", localized: true },
      { key: "qualitySale.feature3Title", label: "Feature 3 title", localized: true },
      { key: "qualitySale.feature3Image", label: "Feature 3 image", media: "image" },
      { key: "qualitySale.feature3ImageAlt", label: "Feature 3 alt text", localized: true },
      { key: "qualitySale.feature4Title", label: "Feature 4 title", localized: true },
      { key: "qualitySale.feature4Image", label: "Feature 4 image", media: "image" },
      { key: "qualitySale.feature4ImageAlt", label: "Feature 4 alt text", localized: true },
      {
        key: "qualitySale.__div_support",
        label: "3 · Support process",
        type: "section-divider",
      },
      { key: "qualitySale.supportTitle", label: "Support section title", localized: true },
      { key: "qualitySale.supportSubtitle", label: "Support section subtitle", localized: true },
      { key: "qualitySale.step1Title", label: "Step 1 title", localized: true },
      { key: "qualitySale.step1Desc", label: "Step 1 description", localized: true, type: "textarea" },
      { key: "qualitySale.support1Image", label: "Step 1 illustration", media: "image" },
      { key: "qualitySale.step2Title", label: "Step 2 title", localized: true },
      { key: "qualitySale.step2Desc", label: "Step 2 description", localized: true, type: "textarea" },
      { key: "qualitySale.support2Image", label: "Step 2 illustration", media: "image" },
      { key: "qualitySale.step3Title", label: "Step 3 title", localized: true },
      { key: "qualitySale.step3Desc", label: "Step 3 description", localized: true, type: "textarea" },
      { key: "qualitySale.support3Image", label: "Step 3 illustration", media: "image" },
      { key: "qualitySale.step4Title", label: "Step 4 title", localized: true },
      { key: "qualitySale.step4Desc", label: "Step 4 description", localized: true, type: "textarea" },
      { key: "qualitySale.support4Image", label: "Step 4 illustration", media: "image" },
      {
        key: "qualitySale.__div_faq",
        label: "4 · FAQ accordion",
        type: "section-divider",
      },
      { key: "qualitySale.faqTitle", label: "FAQ title", localized: true },
      { key: "qualitySale.faqSubtitle", label: "FAQ subtitle", localized: true },
      { key: "qualitySale.faq1Q", label: "FAQ 1 question", localized: true },
      { key: "qualitySale.faq1A", label: "FAQ 1 answer", localized: true, type: "textarea" },
      { key: "qualitySale.faq2Q", label: "FAQ 2 question", localized: true },
      { key: "qualitySale.faq2A", label: "FAQ 2 answer", localized: true, type: "textarea" },
      { key: "qualitySale.faq3Q", label: "FAQ 3 question", localized: true },
      { key: "qualitySale.faq3A", label: "FAQ 3 answer", localized: true, type: "textarea" },
      { key: "qualitySale.faq4Q", label: "FAQ 4 question", localized: true },
      { key: "qualitySale.faq4A", label: "FAQ 4 answer", localized: true, type: "textarea" },
      {
        key: "qualitySale.__div_seo",
        label: "5 · Google / SEO",
        type: "section-divider",
        helpText: "Browser tab title and Google listing for /quality-sale.",
      },
      { key: "qualitySale.indexable", label: "Show in Google sitemap (Indexable)", type: "boolean" },
      { key: "qualitySale.metaTitle", label: "Google title (browser tab)", localized: true, maxLength: 60 },
      {
        key: "qualitySale.metaDescription",
        label: "Google description",
        localized: true,
        type: "textarea",
        maxLength: 160,
      },
    ],
  },
  {
    id: "projectsPage",
    title: "Projects listing",
    description: "/projects · page hero + Google listing · cards under Project showcases",
    group: "pages",
    icon: FolderKanban,
    fields: [
      {
        key: "projectsPage.indexable",
        label: "Show in Google sitemap (Indexable)",
        type: "boolean",
        helpText: "Leave OFF until real photos and final copy are approved. When ON, /projects can appear in the sitemap.",
      },
      {
        key: "projectsPage.metaTitle",
        label: "Google title (browser tab)",
        localized: true,
        maxLength: 60,
        helpText: "Appears in Google results and the browser tab for /projects.",
      },
      {
        key: "projectsPage.metaDescription",
        label: "Google description",
        localized: true,
        type: "textarea",
        maxLength: 160,
        helpText: "Short summary under the Google title (~150–160 characters).",
      },
      {
        key: "projectsPage.heroTitle",
        label: "Big headline on page",
        localized: true,
        helpText: "Main headline visitors see at the top of /projects.",
      },
      {
        key: "projectsPage.heroSubtitle",
        label: "Intro line under headline",
        localized: true,
        type: "textarea",
        helpText: "One short sentence under the headline.",
      },
    ],
  },
  {
    id: "faqPage",
    title: "FAQ Page",
    description: "/faq · hero + SEO · Q&A items in FAQs resource",
    group: "pages",
    icon: MessageSquareQuote,
    fields: [
      {
        key: "faqPage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Title and subtitle at the top of /faq. Questions are managed under FAQs in the sidebar.",
      },
      { key: "faqPage.heroTitle", label: "Hero title", localized: true },
      { key: "faqPage.heroSubtitle", label: "Hero subtitle", localized: true, type: "textarea" },
      {
        key: "faqPage.__div_seo",
        label: "2 · Google / SEO",
        type: "section-divider",
      },
      ...pageSeoFields("faqPage"),
    ],
  },
  {
    id: "cataloguePage",
    title: "Catalogue Page",
    description: "/catalogue · standalone listing hero + SEO · PDFs in Free Catalogue resource",
    group: "pages",
    icon: FileDown,
    fields: [
      {
        key: "cataloguePage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Headline on /catalogue. Brochure files are under Free Catalogue in the sidebar.",
      },
      { key: "cataloguePage.heroTitle", label: "Hero title", localized: true },
      { key: "cataloguePage.heroSubtitle", label: "Hero subtitle", localized: true },
      {
        key: "cataloguePage.__div_seo",
        label: "2 · Google / SEO",
        type: "section-divider",
      },
      ...pageSeoFields("cataloguePage"),
    ],
  },
  {
    id: "contactPage",
    title: "Contact Page",
    description: "/contact · SEO, map, showrooms · form in Home → 10. Contact",
    group: "pages",
    icon: MapPin,
    fields: [
      {
        key: "contactPage.__div_seo",
        label: "1 · Google / SEO",
        type: "section-divider",
        helpText: "Browser tab and Google listing for /contact.",
      },
      ...pageSeoFields("contactPage"),
      {
        key: "contactPage.__div_location",
        label: "2 · Map section",
        type: "section-divider",
        helpText: "Our Location block with embedded map on /contact.",
      },
      { key: "contactPage.locationTitle", label: "Location section title", localized: true },
      { key: "contactPage.locationSubtitle", label: "Location section subtitle", localized: true },
      { key: "contactPage.mapEmbedUrl", label: "Google Maps embed URL" },
      { key: "contactPage.mapAriaLabel", label: "Map iframe aria label", localized: true },
      {
        key: "contactPage.__div_showrooms",
        label: "3 · Showrooms strip",
        type: "section-divider",
        helpText: "Headings above showroom cards. Manage cards below (also in sidebar → Showrooms).",
      },
      { key: "contactPage.showroomsTitle", label: "Showrooms section title", localized: true },
      { key: "contactPage.showroomsSubtitle", label: "Showrooms section subtitle", localized: true },
    ],
  },
  {
    id: "privacyPage",
    title: "Privacy Policy",
    description: "/privacy · legal document",
    group: "pages",
    icon: Shield,
    fields: legalDocFields("privacy", "Privacy Policy"),
  },
  {
    id: "termsPage",
    title: "Terms of Use",
    description: "/terms · legal document",
    group: "pages",
    icon: ScrollText,
    fields: legalDocFields("terms", "Terms of Use"),
  },
];

const SITE_SECTIONS_CHROME: SiteSection[] = [
  {
    id: "brand",
    title: "Brand & Locale Flags",
    description: "Logos and navbar language flags",
    group: "chrome",
    icon: ImageIcon,
    fields: [
      { key: "brandLogoMark", label: "Logo Mark", media: "image" },
      { key: "brandLogoMarkOnDark", label: "Logo Mark (on dark)", media: "image" },
      { key: "brandLogoLockup", label: "Logo Lockup", media: "image" },
      { key: "brandLogoLockupOnDark", label: "Logo Lockup (on dark)", media: "image" },
      { key: "brandWordmarkLine1", label: "Wordmark Line 1", localized: true },
      { key: "brandWordmarkLine2", label: "Wordmark Line 2", localized: true },
      { key: "localeFlags.en", label: "Flag — English", media: "image" },
      { key: "localeFlags.th", label: "Flag — Thai", media: "image" },
      { key: "localeFlags.pl", label: "Flag — Polish", media: "image" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation & Search",
    description: "Header menu & search pages",
    group: "chrome",
    icon: Navigation,
    fields: [
      { key: "mainNavigation", label: "Main Navigation (JSON)", type: "json" },
      { key: "searchPages", label: "Search Result Pages", type: "search-page-list" },
    ],
  },
  {
    id: "footer",
    title: "Footer & Social",
    description: "Footer bio, offices & social links",
    group: "chrome",
    icon: Share2,
    fields: [
      { key: "footerBio", label: "Footer Description", localized: true, type: "textarea" },
      { key: "whatsappUrl", label: "WhatsApp URL" },
      { key: "facebookUrl", label: "Facebook URL" },
      { key: "instagramUrl", label: "Instagram URL" },
      { key: "xUrl", label: "X (Twitter) URL" },
      { key: "footerOffices", label: "Footer Offices", type: "office-list" },
      { key: "footerNavigation", label: "Footer Navigation", type: "footer-nav" },
    ],
  },
  {
    id: "interior",
    title: "Interior Catalogue Mode",
    description: "/interior-design · CMS vs hybrid source",
    group: "chrome",
    icon: LayoutGrid,
    fields: [
      {
        key: "interiorCatalogMode",
        label: "Interior Catalogue Source",
        type: "select",
        options: [
          { value: "hybrid", label: "Hybrid — sample projects + CMS projects" },
          { value: "api", label: "CMS only — show just my projects" },
        ],
      },
    ],
  },
];

function iaHubSection(
  id: string,
  title: string,
  description: string,
  hubKey: string,
  icon: LucideIcon,
  withChildren: boolean
): SiteSection {
  const prefix = `pages.${hubKey}`;
  const divider = (key: string, label: string, helpText: string): Field => ({
    key: `${prefix}.__${key}`,
    label,
    type: "section-divider",
    helpText,
  });

  const fields: Field[] = [
    divider(
      "div_hero",
      "1 · Top banner (Hero)",
      "Matches the live page top: photo, headline, intro line, button.",
    ),
    {
      key: `${prefix}.hero.image`,
      label: "Banner photo",
      media: "image",
      helpText: "Full-width photo behind the headline. Path e.g. /home/hero.jpg",
    },
    {
      key: `${prefix}.hero.eyebrow`,
      label: "Eyebrow (small line above headline)",
      localized: true,
      helpText: "Optional. Leave blank to hide.",
    },
    {
      key: `${prefix}.hero.title`,
      label: "Headline (H1)",
      localized: true,
      helpText: "Big title on the banner.",
    },
    {
      key: `${prefix}.hero.subtitle`,
      label: "Intro line under headline",
      localized: true,
      type: "textarea",
      helpText: "Short supporting sentence on the banner.",
    },
    {
      key: `${prefix}.hero.ctaLabel`,
      label: "Button text",
      localized: true,
      helpText: 'e.g. "Get a consultation". Clear this to hide the button.',
    },
    {
      key: `${prefix}.hero.ctaHref`,
      label: "Button link",
      helpText: "Where the button goes, e.g. /contact",
    },

    divider(
      "div_intro",
      "2 · Intro paragraph",
      "Centered text under the banner (before content blocks).",
    ),
    {
      key: `${prefix}.body`,
      label: "Intro paragraph",
      localized: true,
      type: "textarea",
      helpText: "Main intro copy visitors read first under the hero.",
    },

    divider(
      "div_sections",
      "3 · Content blocks (image + text)",
      "Horizontal story blocks — each has heading, text, photo, layout.",
    ),
    {
      key: `${prefix}.sections`,
      label: "Content blocks",
      type: "content-sections",
      helpText:
        "Add / reorder blocks. Layout: Band, Spotlight, Editorial, Overlay, or Rail. Live page updates after Save.",
    },
  ];

  if (withChildren) {
    fields.push(
      divider(
        "div_explore",
        "4 · Explore (sub-pages list)",
        "Heading + cards linking to each child URL under this hub.",
      ),
      {
        key: `${prefix}.exploreTitle`,
        label: "Explore section title",
        localized: true,
        helpText: 'Default "Explore". Shown above the sub-page cards.',
      },
      {
        key: `${prefix}.exploreSubtitle`,
        label: "Explore section subtitle",
        localized: true,
        helpText: 'Default "Choose a focus area to continue."',
      },
      {
        key: `${prefix}.children`,
        label: "Sub-pages (each card = one URL)",
        type: "ia-children-list",
        iaHubKey: hubKey,
        helpText:
          "Edit each sub-page: hero, intro, content blocks, SEO. Drag order with ↑↓. Services: set city slugs for location pages.",
      },
    );
  }

  if (hubKey === "locations") {
    fields.push(
      divider(
        "div_loc_services",
        "5 · Services list on city pages",
        "Heading shown on /locations/[city] above related services.",
      ),
      {
        key: `${prefix}.servicesTitle`,
        label: "Services list title",
        localized: true,
        helpText: 'Default "Services in this location".',
      },
      {
        key: `${prefix}.servicesSubtitle`,
        label: "Services list subtitle",
        localized: true,
        helpText: 'Default "How we support homes and projects here."',
      },
    );
  }

  fields.push(
    divider(
      "div_seo",
      withChildren || hubKey === "locations" ? "6 · Google / SEO" : "4 · Google / SEO",
      "Search listing only — keep Indexable OFF until photo + copy are final.",
    ),
    {
      key: `${prefix}.indexable`,
      label: "Show in Google sitemap (Indexable)",
      type: "boolean",
      helpText: "OFF until final. ON = can appear in sitemap.",
    },
    {
      key: `${prefix}.metaTitle`,
      label: "Google title (browser tab)",
      localized: true,
      maxLength: 60,
      helpText: "Under 60 characters.",
    },
    {
      key: `${prefix}.metaDescription`,
      label: "Google description",
      localized: true,
      type: "textarea",
      maxLength: 160,
      helpText: "1–2 sentences. Max 160 characters.",
    },
  );

  return {
    id,
    title,
    description,
    group: "pages",
    icon,
    fields,
  };
}

const SITE_SECTIONS_IA: SiteSection[] = [
  iaHubSection(
    "iaFurniture",
    "Furniture",
    "/furniture · banner → intro → blocks → explore categories",
    "furniture",
    Sofa,
    true,
  ),
  iaHubSection(
    "iaInteriorDesign",
    "Interior Design",
    "/interior-design · banner → intro → content blocks · catalogue items in Interior catalogue projects",
    "interiorDesign",
    LayoutGrid,
    false,
  ),
  iaHubSection(
    "iaCompleteInteriors",
    "Complete Interiors",
    "/complete-interiors · villas / condos / hotels / developers",
    "completeInteriors",
    Building2,
    true,
  ),
  iaHubSection(
    "iaServices",
    "Services",
    "/services · set Location slugs on each service for city pages",
    "services",
    Wrench,
    true,
  ),
  iaHubSection(
    "iaLocations",
    "Locations",
    "/locations · cities + services list headings",
    "locations",
    MapPin,
    true,
  ),
  iaHubSection(
    "iaForDevelopers",
    "For Developers",
    "/for-developers · standalone developer partner page",
    "forDevelopers",
    HardHat,
    false,
  ),
  iaHubSection(
    "iaJournal",
    "Journal",
    "/journal · hub + topics + article grid · posts in Journal articles",
    "journal",
    Newspaper,
    true,
  ),
  iaHubSection(
    "iaAboutBrand",
    "About brands",
    "/about/varsovia · /about/livo · /about/oppolia",
    "aboutBrand",
    BookOpen,
    true,
  ),
];

/** Home → standalone pages → IA hubs → site chrome — matches live site structure. */
export const SITE_SECTIONS: SiteSection[] = [
  ...SITE_SECTIONS_CORE,
  ...SITE_SECTIONS_IA,
  ...SITE_SECTIONS_CHROME,
];

export const HOME_SECTION_IDS = new Set(
  SITE_SECTIONS.filter((s) => s.group === "home").map((s) => s.id)
);

export function isSiteSectionId(id: string | null | undefined): boolean {
  return Boolean(id && SITE_SECTIONS.some((section) => section.id === id));
}
