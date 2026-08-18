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
  | "main-nav"
  | "inquiry-form"
  | "select"
  | "ia-children-list"
  | "section-divider"
  /** Renders an inline list editor (FAQs, showcase cards, team, articles). */
  | "embedded-resource";

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
  /** One scrolling form in live-page order (no tab cards). */
  stackFields?: boolean;
};

function pageSeoFields(prefix: string): Field[] {
  return [
    {
      key: `${prefix}.indexable`,
      label: "Show in Google sitemap (Indexable)",
      type: "boolean",
      helpText: "OFF = this page is noindex and omitted from /sitemap.xml. ON = listed for Google.",
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
    description: "Home · top banner (matches live `/`)",
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
      {
        key: "hero.__div_seo",
        label: "Google / SEO (whole site home)",
        type: "section-divider",
        helpText: "Browser tab + Google listing for the home page (`/` / `/{locale}`).",
      },
      {
        key: "homeSeo.metaTitle",
        label: "Google title (browser tab)",
        localized: true,
        maxLength: 60,
      },
      {
        key: "homeSeo.metaDescription",
        label: "Google description",
        localized: true,
        type: "textarea",
        maxLength: 160,
      },
      {
        key: "homeSeo.indexable",
        label: "Show home in Google sitemap (Indexable)",
        type: "boolean",
        helpText:
          "OFF = home is noindex and omitted from /sitemap.xml. ON = /en /th /pl home URLs are listed for Google.",
      },
    ],
  },
  {
    id: "about",
    title: "2. About Varsovia",
    description: "Home · About Varsovia",
    group: "home",
    icon: BookOpen,
    fields: [
      { key: "aboutTitle", label: "About Varsovia Title", localized: true },
      { key: "aboutSubtitle", label: "About Varsovia Subtitle", localized: true },
      { key: "aboutText", label: "About Varsovia Text", localized: true, type: "textarea" },
      { key: "aboutCtaLabel", label: "Learn more button label", localized: true },
      { key: "aboutCtaHref", label: "Learn more button link", helpText: "e.g. #projects or /about" },
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
    description: "Home · Years / Projects / Cities counters",
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
    description: "Home · Featured Projects",
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
          "Toggle Featured ON for each project that should appear in the home carousel. If none are Featured, the carousel shows all projects.",
      },
    ],
  },
  {
    id: "catalogue",
    title: "5. Free Catalogue",
    description: "Home · Free Catalogue",
    group: "home",
    icon: FileDown,
    fields: [
      {
        key: "catalogue.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the downloadable catalogue carousel.",
      },
      { key: "sectionCopy.catalogue.title", label: "Free Catalogue Title", localized: true },
      { key: "sectionCopy.catalogue.subtitle", label: "Free Catalogue Subtitle", localized: true },
      {
        key: "catalogue.__div_items",
        label: "Catalogue PDFs",
        type: "section-divider",
        helpText: "Add cover image + PDF for each brochure. Title and cover are what visitors see.",
      },
    ],
  },
  {
    id: "products",
    title: "6. Our Products",
    description: "Home · Our Products",
    group: "home",
    icon: Package,
    fields: [
      {
        key: "products.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the home products grid.",
      },
      { key: "sectionCopy.products.title", label: "Our Products Title", localized: true },
      { key: "sectionCopy.products.subtitle", label: "Our Products Subtitle", localized: true },
      { key: "sectionCopy.products.ctaLabel", label: "Button label", localized: true, helpText: "Button under the 3 home cards. Opens the Interior Design catalogue." },
      { key: "sectionCopy.products.ctaHref", label: "Button link", helpText: "Where the section button goes. Use /interior-design for the full interior catalogue." },
      { key: "sectionCopy.products.itemCtaLabel", label: "Card button label", localized: true, helpText: "Shown on each of the 3 home cards, e.g. Explore interiors" },
      {
        key: "products.__div_items",
        label: "Homepage cards (exactly 3)",
        type: "section-divider",
        helpText:
          "Live home shows 3 cards only (1 on phones, 2 on tablets, 3 on desktop). Turn on “Show on homepage” and set Order 1–3. Extra products are a swap library — they do not list on a products page. Card click opens Interior Design filtered by that card’s category.",
      },
    ],
  },
  {
    id: "testimonials",
    title: "7. Real Stories. Real Spaces.",
    description: "Home · Real Stories. Real Spaces.",
    group: "home",
    icon: MessageSquareQuote,
    fields: [
      {
        key: "testimonials.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the testimonials slider.",
      },
      { key: "sectionCopy.testimonials.title", label: "Real Stories Title", localized: true },
      { key: "sectionCopy.testimonials.subtitle", label: "Real Stories Subtitle", localized: true },
      {
        key: "testimonials.__div_items",
        label: "Customer reviews",
        type: "section-divider",
        helpText: "Add name, photo, quote, and star rating below.",
      },
    ],
  },
  {
    id: "coreStrengths",
    title: "8. Core Strengths",
    description: "Home · Core Strengths",
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
    title: "9. Our Global Partners",
    description: "Home · Our Global Partners",
    group: "home",
    icon: Globe2,
    fields: [
      {
        key: "partners.__div_headings",
        label: "Section headings",
        type: "section-divider",
        helpText: "Title and subtitle above the partner logo strip.",
      },
      { key: "sectionCopy.partners.title", label: "Our Global Partners Title", localized: true },
      { key: "sectionCopy.partners.subtitle", label: "Our Global Partners Subtitle", localized: true },
      {
        key: "partners.__div_items",
        label: "Partner logos",
        type: "section-divider",
        helpText: "Add partner name and logo below. Only the logo strip shows on the home page.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Get In touch",
    description: "Home · Get In touch",
    group: "home",
    icon: Contact,
    fields: [
      {
        key: "inquiryForm",
        label: "Contact Form Fields (labels, placeholders, options, required)",
        type: "inquiry-form",
      },
      { key: "sectionCopy.contact.title", label: "Get In touch Title", localized: true },
      { key: "sectionCopy.contact.subtitle", label: "Get In touch Subtitle", localized: true },
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
    ],
  },
  {
    id: "teamPage",
    title: "Our Team",
    description: "/team · Our Team",
    group: "pages",
    icon: BriefcaseBusiness,
    stackFields: true,
    fields: [
      {
        key: "teamPage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Top banner on /team — same order as the live page.",
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
        helpText: "Headings above each team grid, then the member photos — same as live /team.",
      },
      { key: "teamPage.designTitle", label: "Design team title", localized: true },
      { key: "teamPage.designEyebrow", label: "Design team eyebrow", localized: true },
      { key: "teamPage.designBody", label: "Design team intro", localized: true, type: "textarea" },
      { key: "teamPage.architectTitle", label: "Architect team title", localized: true },
      { key: "teamPage.architectEyebrow", label: "Architect team eyebrow", localized: true },
      { key: "teamPage.architectBody", label: "Architect team intro", localized: true, type: "textarea" },
      {
        key: "teamPage.__embed_members",
        label: "Team members",
        type: "embedded-resource",
        itemKey: "teamPage",
        helpText: "Photos and roles on the Design / Architect grids.",
      },
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
      { key: "teamPage.indexable", label: "Show in Google sitemap (Indexable)", type: "boolean", helpText: "OFF = /team is noindex and omitted from the sitemap. ON = listed for Google." },
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
      { key: "qualitySale.indexable", label: "Show in Google sitemap (Indexable)", type: "boolean", helpText: "OFF = /quality-sale is noindex and omitted from the sitemap. ON = listed for Google." },
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
    title: "Showcase",
    description: "/projects · listing + mega-menu — edit on Showcase",
    group: "pages",
    icon: FolderKanban,
    stackFields: true,
    fields: [
      {
        key: "projectsPage.__div_hero",
        label: "1 · Page hero",
        type: "section-divider",
        helpText:
          "Listing headline, mega-menu copy, and sub-page taglines are on Admin → Showcase. Google fields below still apply to /projects.",
      },
      {
        key: "projectsPage.heroTitle",
        label: "Big headline on page",
        localized: true,
        helpText: "Main headline visitors see at the top of /projects (All tab).",
      },
      {
        key: "projectsPage.heroSubtitle",
        label: "Intro line under headline",
        localized: true,
        type: "textarea",
        helpText: "One short sentence under the headline.",
      },
      {
        key: "projectsPage.__div_items",
        label: "2 · Showcase projects",
        type: "section-divider",
        helpText: "Project cards on /projects — same order as the live listing.",
      },
      {
        key: "projectsPage.__embed_items",
        label: "Showcase items",
        type: "embedded-resource",
        itemKey: "projectsPage",
      },
      {
        key: "projectsPage.__div_seo",
        label: "3 · Google / SEO",
        type: "section-divider",
      },
      {
        key: "projectsPage.indexable",
        label: "Show in Google sitemap (Indexable)",
        type: "boolean",
        helpText: "Leave OFF until real photos and final copy are approved. When ON, /projects and each project detail can appear in the sitemap.",
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
    ],
  },
  {
    id: "faqPage",
    title: "FAQ",
    description: "/faq · Hero → topics & Q&A",
    group: "pages",
    icon: MessageSquareQuote,
    stackFields: true,
    fields: [
      {
        key: "faqPage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Title and subtitle at the top of /faq — same as the live page.",
      },
      { key: "faqPage.heroTitle", label: "Hero title", localized: true },
      { key: "faqPage.heroSubtitle", label: "Hero subtitle", localized: true, type: "textarea" },
      {
        key: "faqPage.__div_qa",
        label: "2 · Topics & questions",
        type: "section-divider",
        helpText:
          "Left: topic list. Right: questions and answers. Same layout as live /faq.",
      },
      {
        key: "faqPage.__embed_faqs",
        label: "Questions and answers",
        type: "embedded-resource",
        itemKey: "faqPage",
      },
      {
        key: "faqPage.__div_seo",
        label: "3 · Google / SEO",
        type: "section-divider",
      },
      ...pageSeoFields("faqPage"),
    ],
  },
  {
    id: "cataloguePage",
    title: "Free Catalogue",
    description: "/catalogue · Free Catalogue",
    group: "pages",
    icon: FileDown,
    fields: [
      {
        key: "cataloguePage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText: "Headline on /catalogue. Brochure files are edited under Home → 5. Free Catalogue.",
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
    title: "Contact",
    description: "/contact · Contact / Get in Touch",
    group: "pages",
    icon: MapPin,
    fields: [
      {
        key: "contactPage.__div_hero",
        label: "1 · Hero",
        type: "section-divider",
        helpText:
          "Overrides Home → Get In touch title/subtitle on /contact when set. Form images still come from Home → 10. Get In touch.",
      },
      { key: "contactPage.heroTitle", label: "Hero title", localized: true },
      {
        key: "contactPage.heroSubtitle",
        label: "Hero subtitle",
        localized: true,
        type: "textarea",
      },
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
      {
        key: "contactPage.__div_seo",
        label: "4 · Google / SEO",
        type: "section-divider",
        helpText: "Browser tab and Google listing for /contact.",
      },
      ...pageSeoFields("contactPage"),
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
    id: "navigation",
    title: "Navigation",
    description: "Header menu & search pages",
    group: "chrome",
    icon: Navigation,
    fields: [
      { key: "mainNavigation", label: "Main Navigation", type: "main-nav" },
      { key: "searchPages", label: "Search Result Pages", type: "search-page-list" },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    description: "Footer bio, offices & social links",
    group: "chrome",
    icon: Share2,
    fields: [
      { key: "footerBio", label: "Footer Description", localized: true, type: "textarea" },
      { key: "email", label: "Email" },
      { key: "contactPhone", label: "Contact phone" },
      { key: "mobileWhatsapp", label: "Mobile / WhatsApp number" },
      { key: "whatsappUrl", label: "WhatsApp URL" },
      { key: "facebookUrl", label: "Facebook URL" },
      { key: "instagramUrl", label: "Instagram URL" },
      { key: "xUrl", label: "X (Twitter) URL" },
      { key: "footerOffices", label: "Footer Offices", type: "office-list" },
      { key: "footerNavigation", label: "Footer Navigation", type: "footer-nav" },
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
      "Horizontal story blocks — each has heading, text, and photo.",
    ),
    {
      key: `${prefix}.sections`,
      label: "Content blocks",
      type: "content-sections",
      helpText:
        "Add / reorder blocks. Each block has heading, text, and photo. Live page updates after Save.",
    },
  ];

  if (withChildren || hubKey === "interiorDesign") {
    fields.push(
      divider(
        "div_explore",
          hubKey === "locations"
            ? "4 · Explore (city cards)"
            : hubKey === "interiorDesign"
          ? "4 · Explore (project catalogue)"
          : "4 · Explore (sub-pages list)",
        hubKey === "interiorDesign"
          ? "Heading above the project grid on /interior-design."
          : hubKey === "locations"
            ? "Heading above city cards on /locations."
          : "Heading + cards linking to each child URL under this hub.",
      ),
      {
        key: `${prefix}.exploreTitle`,
        label: "Explore section title",
        localized: true,
        helpText:
          hubKey === "interiorDesign"
            ? 'Default "Explore". Shown above the project catalogue.'
            : hubKey === "locations"
              ? 'Shown above city cards. Default "Our locations".'
            : 'Default "Explore". Shown above the sub-page cards.',
      },
      {
        key: `${prefix}.exploreSubtitle`,
        label: "Explore section subtitle",
        localized: true,
        helpText:
          hubKey === "interiorDesign"
            ? "Short line under the Explore heading, above the project grid."
            : hubKey === "locations"
              ? 'Default "Choose a city to see services and local projects."'
            : 'Default "Choose a focus area to continue."',
      },
    );
  }

  if (withChildren) {
    fields.push(
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
      withChildren || hubKey === "locations"
        ? "6 · Google / SEO"
        : hubKey === "interiorDesign"
          ? "5 · Google / SEO"
          : "4 · Google / SEO",
      "Search listing only — keep Indexable OFF until photo + copy are final.",
    ),
    {
      key: `${prefix}.indexable`,
      label: "Show in Google sitemap (Indexable)",
      type: "boolean",
      helpText: "OFF until final. ON = this hub/page and its indexable children can appear in the sitemap.",
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
    "Interior",
    "/interior-design · banner → intro → blocks → project catalogue",
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
    "/locations · banner → intro → blocks → city cards · each city has services + projects",
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
  journalSiteSection(),
  iaHubSection(
    "iaAboutBrand",
    "About",
    "/about · hero → story → explore brands (Livo, Oppolia) · /about/[brand] pages",
    "aboutBrand",
    BookOpen,
    true,
  ),
];

/** Journal /journal — same top-to-bottom order as the live page. */
function journalSiteSection(): SiteSection {
  const section = iaHubSection(
    "iaJournal",
    "Journal",
    "/journal · Hero → Intro → Stories → Explore topics → All articles",
    "journal",
    Newspaper,
    true,
  );

  const relabel: Record<string, { label: string; helpText: string }> = {
    "pages.journal.__div_hero": {
      label: "1 · Hero",
      helpText:
        "Live /journal top banner: background photo, JOURNAL headline, subtitle, consultation button.",
    },
    "pages.journal.__div_intro": {
      label: "2 · Intro paragraph",
      helpText:
        "Centered intro under breadcrumbs — e.g. “Our journal collects practical design notes…”",
    },
    "pages.journal.__div_sections": {
      label: "3 · Stories (content blocks)",
      helpText:
        "Story blocks on /journal (e.g. “Stories from real projects”). Heading + text + optional image.",
    },
    "pages.journal.__div_explore": {
      label: "4 · Explore topics",
      helpText:
        "EXPLORE strip + topic cards (Kitchens, Furniture, Materials…). Each card is a /journal/topic/… page.",
    },
    "pages.journal.__div_seo": {
      label: "6 · Google / SEO",
      helpText: "Search listing for /journal. Keep Indexable OFF until copy is final.",
    },
  };

  const fields = section.fields.map((field) => {
    const meta = relabel[field.key];
    if (!meta) return field;
    return { ...field, label: meta.label, helpText: meta.helpText };
  });

  const seoIdx = fields.findIndex((f) => f.key === "pages.journal.__div_seo");
  const articlesDivider: Field = {
    key: "pages.journal.__div_articles",
    label: "5 · All articles",
    type: "section-divider",
    helpText:
      "Article cards on /journal (“All articles”). Cover, date, read time, title — same list as the live page.",
  };
  const articlesEmbed: Field = {
    key: "pages.journal.__embed_articles",
    label: "All articles",
    type: "embedded-resource",
    itemKey: "iaJournal",
  };

  if (seoIdx >= 0) {
    fields.splice(seoIdx, 0, articlesDivider, articlesEmbed);
  } else {
    fields.push(articlesDivider, articlesEmbed);
  }

  // Hero field labels match live banner
  for (const field of fields) {
    if (field.key === "pages.journal.hero.title") {
      field.label = "Headline (H1) — e.g. JOURNAL";
      field.helpText = "Large title on the banner (live default: Journal).";
    }
    if (field.key === "pages.journal.hero.subtitle") {
      field.label = "Subtitle under headline";
      field.helpText =
        "e.g. Ideas on kitchens, materials, villas, and living in Thailand.";
    }
    if (field.key === "pages.journal.hero.ctaLabel") {
      field.label = "Button text";
      field.helpText = 'Live default: "Get a consultation".';
    }
    if (field.key === "pages.journal.exploreTitle") {
      field.label = "Explore title";
      field.helpText = 'Live default: "Explore".';
    }
    if (field.key === "pages.journal.exploreSubtitle") {
      field.label = "Explore subtitle";
      field.helpText = 'Live default: "Choose a focus area to continue."';
    }
  }

  return { ...section, fields };
}

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

export type SiteSectionTab = {
  id: string;
  tag: string;
  label: string;
  hint: string;
  fields: Field[];
};

/** Parse "1 · Top banner (Hero)" → tag + clean label for Thailand-style tab cards. */
function parseDividerTabMeta(label: string): { tag: string; label: string } {
  const raw = String(label || "").trim();
  const numbered = raw.match(/^(\d+)\s*[·.\-–—:]\s*(.+)$/);
  if (numbered) {
    return { tag: numbered[1], label: numbered[2].trim() };
  }
  const words = raw.split(/\s+/).filter(Boolean);
  const tag = (words[0] || "Section").replace(/[^A-Za-z0-9]/g, "").slice(0, 10);
  return { tag: tag.toUpperCase() || "TAB", label: raw || "Section" };
}

/**
 * Split a site section's fields into tabs using `section-divider` markers.
 * Returns [] when there are fewer than 2 dividers (caller keeps flat layout).
 */
export function splitFieldsIntoTabs(fields: Field[]): SiteSectionTab[] {
  const list = Array.isArray(fields) ? fields : [];
  const dividerCount = list.filter((f) => f.type === "section-divider").length;
  if (dividerCount < 2) return [];

  const tabs: SiteSectionTab[] = [];
  let pendingBefore: Field[] = [];

  for (const field of list) {
    if (field.type === "section-divider") {
      const meta = parseDividerTabMeta(field.label);
      tabs.push({
        id: field.key,
        tag: meta.tag,
        label: meta.label,
        hint: String(field.helpText || "").trim(),
        fields: [],
      });
      if (pendingBefore.length && tabs.length === 1) {
        tabs[0].fields.push(...pendingBefore);
        pendingBefore = [];
      }
      continue;
    }
    if (tabs.length === 0) {
      pendingBefore.push(field);
    } else {
      tabs[tabs.length - 1].fields.push(field);
    }
  }

  if (pendingBefore.length && tabs.length === 0) {
    return [];
  }
  if (pendingBefore.length) {
    const meta = parseDividerTabMeta("Overview");
    tabs.unshift({
      id: "__overview",
      tag: meta.tag,
      label: meta.label,
      hint: "",
      fields: pendingBefore,
    });
  }

  const usable = tabs.filter((tab) => tab.fields.length > 0);
  return usable.length >= 2 ? usable : [];
}
