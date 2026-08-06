import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
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
  | "select";

export type Field = {
  key: string;
  label: string;
  type?: FieldType;
  localized?: boolean;
  required?: boolean;
  media?: MediaKind;
  itemKey?: string;
  options?: { value: string; label: string }[];
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

/**
 * Site Settings sections — ordered like the live Varsovia site.
 * Home block matches `/` section order exactly.
 */
export const SITE_SECTIONS: SiteSection[] = [
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
      { key: "heroImage", label: "Hero Image URL", media: "image" },
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
      { key: "aboutImages", label: "About Images", type: "string-list", media: "image" },
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
      { key: "statsImage", label: "Statistics Image URL", media: "image" },
    ],
  },
  {
    id: "featured",
    title: "4. Featured Projects",
    description: "Home · featured carousel",
    group: "home",
    icon: FolderKanban,
    fields: [
      { key: "sectionCopy.featured.title", label: "Featured Projects Title", localized: true },
      { key: "sectionCopy.featured.subtitle", label: "Featured Projects Subtitle", localized: true },
    ],
  },
  {
    id: "catalogue",
    title: "5. Free Catalogue",
    description: "Home · catalogue section",
    group: "home",
    icon: FileDown,
    fields: [
      { key: "sectionCopy.catalogue.title", label: "Catalogue Section Title", localized: true },
      { key: "sectionCopy.catalogue.subtitle", label: "Catalogue Section Subtitle", localized: true },
    ],
  },
  {
    id: "products",
    title: "6. Products",
    description: "Home · products grid headings",
    group: "home",
    icon: Package,
    fields: [
      { key: "sectionCopy.products.title", label: "Products Section Title", localized: true },
      { key: "sectionCopy.products.subtitle", label: "Products Section Subtitle", localized: true },
    ],
  },
  {
    id: "testimonials",
    title: "7. Testimonials",
    description: "Home · testimonials headings",
    group: "home",
    icon: MessageSquareQuote,
    fields: [
      { key: "sectionCopy.testimonials.title", label: "Testimonials Section Title", localized: true },
      { key: "sectionCopy.testimonials.subtitle", label: "Testimonials Section Subtitle", localized: true },
    ],
  },
  {
    id: "coreStrengths",
    title: "8. Core Strengths",
    description: "Home · strengths headings",
    group: "home",
    icon: Sparkles,
    fields: [
      { key: "sectionCopy.coreStrengths.title", label: "Core Strengths Title", localized: true },
      { key: "sectionCopy.coreStrengths.subtitle", label: "Core Strengths Subtitle", localized: true },
    ],
  },
  {
    id: "partners",
    title: "9. Partners",
    description: "Home · partners headings",
    group: "home",
    icon: Globe2,
    fields: [
      { key: "sectionCopy.partners.title", label: "Partners Section Title", localized: true },
      { key: "sectionCopy.partners.subtitle", label: "Partners Section Subtitle", localized: true },
    ],
  },
  {
    id: "contact",
    title: "10. Contact",
    description: "Home · contact strip & form",
    group: "home",
    icon: Contact,
    fields: [
      { key: "sectionCopy.contact.title", label: "Contact Section Title", localized: true },
      { key: "sectionCopy.contact.subtitle", label: "Contact Section Subtitle", localized: true },
      { key: "contactImages", label: "Contact Images", type: "string-list", media: "image" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", localized: true, type: "textarea" },
      { key: "contactPhone", label: "Footer Contact Phone" },
      { key: "mobileWhatsapp", label: "Footer Mobile / WhatsApp Number" },
      { key: "inquiryForm", label: "Contact Form Fields", type: "inquiry-form" },
    ],
  },
  {
    id: "aboutPage",
    title: "About Page",
    description: "/about · story, vision, mission, values & process",
    group: "pages",
    icon: BookOpen,
    fields: [
      { key: "aboutIntro", label: "About Intro", localized: true, type: "textarea" },
      { key: "aboutStory", label: "About Story", localized: true, type: "textarea" },
      { key: "aboutHeroSubtitle", label: "About Hero Subtitle", localized: true },
      {
        key: "aboutStoryImages",
        label: "About Story Gallery",
        type: "string-list",
        media: "image",
      },
      { key: "vision.title", label: "Vision Title", localized: true },
      { key: "vision.text", label: "Vision Text", localized: true, type: "textarea" },
      { key: "vision.icon", label: "Vision Icon URL", media: "image" },
      { key: "mission.title", label: "Mission Title", localized: true },
      { key: "mission.text", label: "Mission Text", localized: true, type: "textarea" },
      { key: "mission.icon", label: "Mission Icon URL", media: "image" },
      { key: "values.title", label: "Values Title", localized: true },
      { key: "values.text", label: "Values Text", localized: true, type: "textarea" },
      { key: "values.icon", label: "Values Icon URL", media: "image" },
      { key: "processSteps", label: "Process Steps", type: "process-list" },
    ],
  },
  {
    id: "teamPage",
    title: "Team Page",
    description: "/team · copy, stats & design tools",
    group: "pages",
    icon: BriefcaseBusiness,
    fields: [
      { key: "teamPage.heroTitle", label: "Hero Title", localized: true },
      { key: "teamPage.heroSubtitle", label: "Hero Subtitle", localized: true },
      { key: "teamPage.intro", label: "Intro", localized: true, type: "textarea" },
      { key: "teamPage.stats", label: "Team Stats", type: "stats-list" },
      { key: "teamPage.designTitle", label: "Design Team Title", localized: true },
      { key: "teamPage.designEyebrow", label: "Design Team Eyebrow", localized: true },
      { key: "teamPage.designBody", label: "Design Team Body", localized: true, type: "textarea" },
      { key: "teamPage.architectTitle", label: "Architect Team Title", localized: true },
      { key: "teamPage.architectEyebrow", label: "Architect Team Eyebrow", localized: true },
      { key: "teamPage.architectBody", label: "Architect Team Body", localized: true, type: "textarea" },
      { key: "teamPage.toolsTitle", label: "Design Tools Title", localized: true },
      { key: "teamPage.toolsBody", label: "Design Tools Body", localized: true, type: "textarea" },
      { key: "designTools", label: "Design Tools (logos)", type: "tool-list" },
    ],
  },
  {
    id: "qualitySale",
    title: "Quality After Sales",
    description: "/quality-sale · full page CMS",
    group: "pages",
    icon: Wrench,
    fields: [
      { key: "qualitySale.heroTitle", label: "Hero Title", localized: true },
      { key: "qualitySale.heroSubtitle", label: "Hero Subtitle", localized: true },
      { key: "qualitySale.heroBody", label: "Hero Body", localized: true, type: "textarea" },
      { key: "qualitySale.feature1Title", label: "Feature 1 Title", localized: true },
      { key: "qualitySale.feature2Title", label: "Feature 2 Title", localized: true },
      { key: "qualitySale.feature3Title", label: "Feature 3 Title", localized: true },
      { key: "qualitySale.feature4Title", label: "Feature 4 Title", localized: true },
      { key: "qualitySale.supportTitle", label: "Support Section Title", localized: true },
      { key: "qualitySale.supportSubtitle", label: "Support Section Subtitle", localized: true },
      { key: "qualitySale.step1Title", label: "Step 1 Title", localized: true },
      { key: "qualitySale.step1Desc", label: "Step 1 Description", localized: true, type: "textarea" },
      { key: "qualitySale.step2Title", label: "Step 2 Title", localized: true },
      { key: "qualitySale.step2Desc", label: "Step 2 Description", localized: true, type: "textarea" },
      { key: "qualitySale.step3Title", label: "Step 3 Title", localized: true },
      { key: "qualitySale.step3Desc", label: "Step 3 Description", localized: true, type: "textarea" },
      { key: "qualitySale.step4Title", label: "Step 4 Title", localized: true },
      { key: "qualitySale.step4Desc", label: "Step 4 Description", localized: true, type: "textarea" },
      { key: "qualitySale.faqTitle", label: "FAQ Title", localized: true },
      { key: "qualitySale.faqSubtitle", label: "FAQ Subtitle", localized: true },
      { key: "qualitySale.faq1Q", label: "FAQ 1 Question", localized: true },
      { key: "qualitySale.faq1A", label: "FAQ 1 Answer", localized: true, type: "textarea" },
      { key: "qualitySale.faq2Q", label: "FAQ 2 Question", localized: true },
      { key: "qualitySale.faq2A", label: "FAQ 2 Answer", localized: true, type: "textarea" },
      { key: "qualitySale.faq3Q", label: "FAQ 3 Question", localized: true },
      { key: "qualitySale.faq3A", label: "FAQ 3 Answer", localized: true, type: "textarea" },
      { key: "qualitySale.faq4Q", label: "FAQ 4 Question", localized: true },
      { key: "qualitySale.faq4A", label: "FAQ 4 Answer", localized: true, type: "textarea" },
      { key: "qualitySale.support1Image", label: "Support Illustration 1", media: "image" },
      { key: "qualitySale.support2Image", label: "Support Illustration 2", media: "image" },
      { key: "qualitySale.support3Image", label: "Support Illustration 3", media: "image" },
      { key: "qualitySale.support4Image", label: "Support Illustration 4", media: "image" },
      { key: "qualitySale.feature1Image", label: "Feature Image 1", media: "image" },
      { key: "qualitySale.feature1ImageAlt", label: "Feature 1 Alt Text", localized: true },
      { key: "qualitySale.feature2Image", label: "Feature Image 2", media: "image" },
      { key: "qualitySale.feature2ImageAlt", label: "Feature 2 Alt Text", localized: true },
      { key: "qualitySale.feature3Image", label: "Feature Image 3", media: "image" },
      { key: "qualitySale.feature3ImageAlt", label: "Feature 3 Alt Text", localized: true },
      { key: "qualitySale.feature4Image", label: "Feature Image 4", media: "image" },
      { key: "qualitySale.feature4ImageAlt", label: "Feature 4 Alt Text", localized: true },
    ],
  },
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
    description: "/interior · CMS vs hybrid source",
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

export const HOME_SECTION_IDS = new Set(
  SITE_SECTIONS.filter((s) => s.group === "home").map((s) => s.id)
);

export function isSiteSectionId(id: string | null | undefined): boolean {
  return Boolean(id && SITE_SECTIONS.some((section) => section.id === id));
}
