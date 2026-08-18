"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CloudUpload,
  Contact,
  FileDown,
  FolderKanban,
  Globe2,
  Handshake,
  Image as ImageIcon,
  ImagePlus,
  Images,
  LayoutGrid,
  Loader2,
  MessageSquareQuote,
  Navigation,
  Package,
  Pencil,
  Plus,
  Save,
  Search,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import MediaUpload from "@/components/MediaUpload";
import { mergeVarsoviaSiteDefaults, VARSOVIA_SITE_DEFAULTS } from "./siteDefaults";
import IaChildrenListEditor from "./IaChildrenListEditor";
import {
  generateBlogImageWithAI,
  generateBlogWithAI,
} from "@/services/adminAPI";
import { toPublicMediaUrl } from "@/lib/publicMediaUrl";
import {
  padShowcaseGallery,
  SHOWCASE_CATEGORY_OPTIONS,
  SHOWCASE_GALLERY_LABELS,
  SHOWCASE_GALLERY_SLOTS,
} from "@/lib/showcaseGallery";
import { resolveAdminMediaPreviewUrl, resolveAdminMediaPreviewFallbacks } from "@/lib/adminMediaPreview";
import {
  ADMIN_SECTION_EVENT,
  CMS_SYNCED_EVENT,
  VARSOVIA_NAV_EVENT,
  readAdminSectionFromUrl,
  readVarsoviaNavFromUrl,
  writeVarsoviaNav,
  type VarsoviaNavDetail,
} from "@/lib/adminSectionNav";
import {
  localeFieldPlaceholder,
} from "@/lib/localized";
import {
  createVarsoviaRecord,
  deleteVarsoviaRecord,
  getVarsoviaSite,
  hydrateVarsoviaSiteDocument,
  listVarsoviaRecords,
  localizedValue,
  pickVarsoviaSiteUpdate,
  updateVarsoviaRecord,
  updateVarsoviaSite,
  varsoviaErrorMessage,
  uploadVarsoviaMedia,
  type LocaleCode,
  type VarsoviaRecord,
  type VarsoviaResource,
} from "@/services/varsoviaAPI";
import {
  SITE_SECTIONS,
  isSiteSectionId,
  splitFieldsIntoTabs,
  type SiteSection,
} from "./siteSections";

type MediaKind = "image" | "icon" | "pdf";
type FieldType =
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
  | "embedded-resource";
type Field = {
  key: string;
  label: string;
  type?: FieldType;
  localized?: boolean;
  required?: boolean;
  /** Shows an Upload button next to the URL input (image / logo / PDF). */
  media?: MediaKind;
  /** For localized-string-list: stores each entry as `{ [itemKey]: localizedMap }`. */
  itemKey?: string;
  /** Options for `select` fields. */
  options?: { value: string; label: string }[];
  /** Hard character limit for text/textarea (hub meta 60/160). */
  maxLength?: number;
  /** Fixed slot labels for string-list galleries (Image 1, Kitchen Image 2…). */
  listLabels?: string[];
  /** Pad list to at least this many slots so every site image has an admin row. */
  minItems?: number;
  /** Fixed live slots — no add / reorder (Showcase Kitchen+Bathroom gallery). */
  fixedList?: boolean;
  iaHubKey?: string;
  /** Short help under the label for non-technical editors. */
  helpText?: string;
};
/** Gallery-style listing (image cards + search + category filter). */
type CardListConfig = {
  imageKey: string;
  subtitleKey?: string;
  subtitleSuffix?: string;
  descriptionKey: string;
  searchPlaceholder: string;
  createLabel: string;
  emptyLabel: string;
  fallbackBadge: string;
};

type ResourceConfig = {
  label: string;
  singular: string;
  titleKey: string;
  fields: Field[];
  card?: CardListConfig;
};

const LOCALES: { id: LocaleCode; label: string }[] = [
  { id: "en", label: "English" },
  { id: "th", label: "Thai" },
  { id: "pl", label: "Polish" },
];

type SectionSaveHandler = (opts?: { quiet?: boolean }) => Promise<void>;

const VarsoviaSectionSaveContext = createContext<{
  register: (id: string, handler: SectionSaveHandler | null) => void;
} | null>(null);

function useRegisterSectionSave(
  id: string,
  handler: SectionSaveHandler,
  enabled: boolean
) {
  const ctx = useContext(VarsoviaSectionSaveContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!ctx || !enabled) return;
    const wrapped: SectionSaveHandler = (opts) => handlerRef.current(opts);
    ctx.register(id, wrapped);
    return () => ctx.register(id, null);
  }, [ctx, id, enabled]);
}

const VISIBLE_FIELD: Field = {
  key: "visible",
  label: "Visible on website",
  type: "boolean",
};

const PROJECT_CATEGORY_OPTIONS = [
  { value: "Kitchen", label: "Kitchen" },
  { value: "Bedroom", label: "Bedroom" },
  { value: "Bathroom", label: "Bathroom" },
  { value: "Door & Windows", label: "Door & Windows" },
  { value: "Whole House Solutions", label: "Whole House Solutions" },
  { value: "Furniture", label: "Furniture" },
];

/** Home Featured Projects carousel only shows image + overlay text. */
const FEATURED_HOME_FIELDS: Field[] = [
  { key: "title", label: "Title", localized: true, required: true },
  { key: "location", label: "Location", localized: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: PROJECT_CATEGORY_OPTIONS,
  },
  { key: "description", label: "Description", localized: true, type: "textarea" },
  { key: "coverImage", label: "Image", media: "image" },
  { key: "featured", label: "Show on homepage", type: "boolean" },
  VISIBLE_FIELD,
  { key: "order", label: "Order", type: "number" },
];

/** Home Our Products: 3 teasers. Extra rows are a library for swapping onto those slots. */
const HOME_PRODUCT_LIMIT = 3;
const PRODUCT_FILTER_HOME = "Homepage (3 cards)";
const PRODUCT_FILTER_LIBRARY = "Library (not on home)";

function homepageProductRanks(items: VarsoviaRecord[]): Map<string, number> {
  const visible = items.filter((item) => item.visible !== false);
  const featured = visible.filter((item) => item.featured === true);
  const source = featured.length > 0 ? featured : visible;
  const ranked = [...source]
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
    .slice(0, HOME_PRODUCT_LIMIT);
  return new Map(ranked.map((item, index) => [String(item._id), index + 1]));
}

const PRODUCTS_HOME_FIELDS: Field[] = [
  { key: "title", label: "Title", localized: true, required: true },
  { key: "description", label: "Description", localized: true, type: "textarea" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: PROJECT_CATEGORY_OPTIONS,
    helpText:
      "When a visitor clicks this home card, Interior Design opens filtered to this category.",
  },
  { key: "image", label: "Image", media: "image" },
  {
    key: "featured",
    label: "Show on homepage",
    type: "boolean",
    helpText:
      "Homepage shows only 3 cards. Turn this on and set Order 1, 2, or 3. Extra cards stay in this library until you swap them in.",
  },
  VISIBLE_FIELD,
  {
    key: "order",
    label: "Homepage order",
    type: "number",
    helpText: "1 = left/first card, 2 = middle, 3 = right. Only the three lowest orders with Show on homepage appear.",
  },
];

const CONFIGS: Record<VarsoviaResource, ResourceConfig> = {
  products: {
    label: "Our Products",
    singular: "Product",
    titleKey: "title",
    card: {
      imageKey: "image",
      subtitleSuffix: "layout",
      descriptionKey: "description",
      searchPlaceholder: "Search homepage product cards...",
      createLabel: "Add product card",
      emptyLabel: "No product cards found.",
      fallbackBadge: "Kitchen",
    },
    fields: PRODUCTS_HOME_FIELDS,
  },
  projects: {
    label: "Featured Projects",
    singular: "Featured project",
    titleKey: "title",
    card: {
      imageKey: "coverImage",
      subtitleKey: "location",
      descriptionKey: "description",
      searchPlaceholder: "Search interior projects...",
      createLabel: "Create Project",
      emptyLabel: "No interior projects found.",
      fallbackBadge: "Interior",
    },
    fields: [
      { key: "coverImage", label: "Card / listing photo", media: "image", helpText: "Catalogue card on /interior-design and the detail-page banner." },
      { key: "title", label: "Card title", localized: true, required: true, helpText: "Title on the catalogue card." },
      { key: "description", label: "Card description", localized: true, type: "textarea", helpText: "Short text on the catalogue card." },
      { key: "category", label: "Category", type: "select", options: PROJECT_CATEGORY_OPTIONS, helpText: "Filter tab on /interior-design (Kitchen, Bedroom, …)." },
      { key: "isNew", label: "New badge on card", type: "boolean" },
      { key: "interiorCatalog", label: "Show in Interior catalogue", type: "boolean" },
      { key: "order", label: "Catalogue order", type: "number" },
      VISIBLE_FIELD,
      { key: "detailTitle", label: "Detail heading (H1)", localized: true, helpText: "Heading on /interior-design/[slug]. Blank uses the card title. Shown exactly as typed." },
      { key: "detailDescription", label: "Detail intro", localized: true, type: "textarea", helpText: "Paragraph under the heading. Blank hides it — no placeholder copy is added." },
      {
        key: "gallery",
        label: "Detail gallery (slider)",
        type: "string-list",
        media: "image",
        minItems: 0,
        listLabels: [
          "Gallery Image 1",
          "Gallery Image 2",
          "Gallery Image 3",
          "Gallery Image 4",
          "Gallery Image 5",
        ],
        helpText: "Slider under the intro. Cover photo is included automatically. Empty slots are skipped.",
      },
      { key: "narrativeOne", label: "Detail body (first paragraph)", localized: true, type: "textarea", helpText: "First paragraph under the gallery. Blank hides it." },
      { key: "narrativeTwo", label: "Detail body (second paragraph)", localized: true, type: "textarea", helpText: "Second paragraph under the gallery. Blank hides it." },
      { key: "slug", label: "Slug (URL)", helpText: "Live path: /interior-design/your-slug" },
      { key: "location", label: "Location", localized: true, helpText: "Shown under the detail heading, and on homepage Featured cards." },
      { key: "subcategory", label: "Subcategory (filters)", helpText: "Filter chip on the catalogue (e.g. Island, Walk-in)." },
      { key: "shape", label: "Shape (filters)" },
      { key: "style", label: "Style (filters)" },
      { key: "color", label: "Color (filters)" },
      { key: "material", label: "Material (filters)" },
      { key: "finish", label: "Finish (filters)" },
      { key: "featured", label: "Show on homepage Featured", type: "boolean", helpText: "Also appears in Home → Featured Projects. Does not control the Interior catalogue." },
    ],
  },
  blogs: {
    label: "All articles",
    singular: "Journal article",
    titleKey: "title",
    card: {
      imageKey: "image",
      subtitleKey: "date",
      descriptionKey: "excerpt",
      searchPlaceholder: "Search journal articles...",
      createLabel: "Create article",
      emptyLabel: "No journal articles found.",
      fallbackBadge: "Journal",
    },
    fields: [
      { key: "image", label: "Cover Image — card + detail hero", media: "image" },
      { key: "date", label: "Date (card overlay)" },
      { key: "readTime", label: "Read time (card overlay)", localized: true },
      { key: "title", label: "Title", localized: true, required: true },
      { key: "excerpt", label: "Excerpt", localized: true, type: "textarea" },
      {
        key: "category",
        label: "Journal topic",
        type: "select",
        options: [
          { value: "kitchens", label: "Kitchens" },
          { value: "furniture", label: "Furniture" },
          { value: "materials", label: "Materials" },
          { value: "interior-design", label: "Interior Design" },
          { value: "villa-guides", label: "Villa Guides" },
          { value: "thailand-living", label: "Thailand Living" },
        ],
      },
      { key: "content", label: "Content", localized: true, type: "textarea" },
      {
        key: "sections",
        label: "Content Sections (detail body + section images)",
        type: "content-sections",
      },
      { key: "author.name", label: "Author Name", localized: true },
      { key: "author.avatar", label: "Author Avatar (1)", media: "image" },
      { key: "views", label: "Views", type: "number" },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  faqs: {
    label: "FAQs",
    singular: "FAQ",
    titleKey: "question",
    fields: [
      { key: "question", label: "Question", localized: true, required: true },
      { key: "answer", label: "Answer", localized: true, type: "textarea", required: true },
      { key: "category", label: "Category", localized: true },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  testimonials: {
    label: "Real Stories. Real Spaces.",
    singular: "Testimonial",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", localized: true, required: true },
      { key: "quote", label: "Quote", localized: true, type: "textarea", required: true },
      { key: "image", label: "Photo", media: "image" },
      { key: "rating", label: "Rating (1-5)", type: "number" },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  catalogues: {
    label: "Free Catalogue",
    singular: "Catalogue",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title", localized: true, required: true },
      { key: "coverImage", label: "Cover Image", media: "image" },
      { key: "downloadUrl", label: "PDF File", media: "pdf" },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  showcases: {
    label: "Showcase items",
    singular: "Showcase item",
    titleKey: "title",
    card: {
      imageKey: "image",
      subtitleKey: "location",
      descriptionKey: "supplyArea",
      searchPlaceholder: "Search showcase projects...",
      createLabel: "Add Showcase item",
      emptyLabel: "No showcase projects found.",
      fallbackBadge: "Showcase",
    },
    fields: [
      { key: "image", label: "Cover photo", media: "image", helpText: "Listing card on /projects and the detail-page banner." },
      { key: "title", label: "Title", localized: true, required: true, helpText: "Listing card and detail-page heading. Shown exactly as typed." },
      {
        key: "category",
        label: "Category (filter tab)",
        type: "select",
        options: [...SHOWCASE_CATEGORY_OPTIONS],
        helpText: "Which /projects tab this card appears under. Must be exactly one of the live tabs — All shows every tab.",
      },
      { key: "location", label: "Location", localized: true, helpText: "Value under Location on the detail spec card." },
      { key: "typeLabel", label: "Type column label", localized: true, helpText: "Middle spec-card heading. Live default is Type (or Quantity on some commercial projects)." },
      { key: "typeValue", label: "Type column value", localized: true, helpText: "Value under that middle heading, e.g. Villa(1 Floor)." },
      { key: "supplyArea", label: "Supply Area", localized: true, helpText: "Value under Supply Area on the detail spec card." },
      {
        key: "gallery",
        label: "Detail gallery (Kitchen 5 + Bathroom 5)",
        type: "string-list",
        media: "image",
        minItems: SHOWCASE_GALLERY_SLOTS,
        fixedList: true,
        listLabels: [...SHOWCASE_GALLERY_LABELS],
        helpText:
          "Same 10 photos as live /projects/[id]: Kitchen hero + 4 bento, then Bathroom hero + 4 bento. Change a slot here and that exact photo updates on the live page.",
      },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  "team-members": {
    label: "Team",
    singular: "Team Member",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", localized: true, required: true },
      { key: "role", label: "Role", localized: true },
      { key: "image", label: "Image URL", media: "image" },
      { key: "teamType", label: "Team Type (Italian / Headquarter)" },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  partners: {
    label: "Our Global Partners",
    singular: "Partner",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", localized: true, required: true },
      { key: "logo", label: "Logo", media: "icon" },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  showrooms: {
    label: "Showrooms",
    singular: "Showroom",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name", localized: true, required: true },
      { key: "location", label: "Location", localized: true },
      { key: "address", label: "Address", localized: true, type: "textarea" },
      { key: "image", label: "Image URL", media: "image" },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
  "core-strengths": {
    label: "Core Strengths",
    singular: "Core Strength",
    titleKey: "title",
    card: {
      imageKey: "image",
      descriptionKey: "description",
      searchPlaceholder: "Search core strengths...",
      createLabel: "Create Core Strength",
      emptyLabel: "No core strengths found.",
      fallbackBadge: "Strength",
    },
    fields: [
      { key: "title", label: "Title", localized: true, required: true },
      {
        key: "description",
        label: "Description",
        localized: true,
        type: "textarea",
      },
      { key: "image", label: "Image", media: "image" },
      {
        key: "iconKey",
        label: "Icon",
        type: "select",
        options: [
          { value: "eye", label: "Eye" },
          { value: "ruler", label: "Ruler" },
          { value: "users", label: "Users" },
          { value: "box", label: "Box" },
          { value: "shield", label: "Shield" },
          { value: "pen", label: "Pen" },
        ],
      },
      VISIBLE_FIELD,
      { key: "order", label: "Order", type: "number" },
    ],
  },
};

const RESOURCE_IDS = Object.keys(CONFIGS) as VarsoviaResource[];

function getAtPath(source: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function setAtPath(
  source: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const keys = path.split(".");
  const copy = structuredClone(source);
  let current = copy;
  keys.slice(0, -1).forEach((key) => {
    const next = current[key];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  });
  current[keys[keys.length - 1]] = value;
  return copy;
}

function normalizeRecord(record?: VarsoviaRecord) {
  if (!record) return {} as Record<string, unknown>;
  const copy = structuredClone(record) as Record<string, unknown>;
  delete copy._id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

/** Rewrite admin-origin /uploads URLs so the public Varsovia site can load them. */
function sanitizeRecordMediaUrls(form: Record<string, unknown>) {
  const next = { ...form };
  for (const key of ["image", "coverImage", "avatar", "logo", "pdfUrl"] as const) {
    if (typeof next[key] === "string") {
      next[key] = toPublicMediaUrl(next[key] as string);
    }
  }
  if (Array.isArray(next.gallery)) {
    next.gallery = next.gallery.map((item) =>
      typeof item === "string" ? toPublicMediaUrl(item) : item
    );
  }
  if (Array.isArray(next.sections)) {
    next.sections = next.sections.map((section) => {
      if (!section || typeof section !== "object") return section;
      const row = { ...(section as Record<string, unknown>) };
      if (typeof row.image === "string") row.image = toPublicMediaUrl(row.image);
      return row;
    });
  }
  // Always persist an explicit boolean so uncheck → visible:false reaches Mongo.
  next.visible = next.visible !== false;
  if (typeof next.order === "string") {
    const parsed = Number.parseInt(next.order, 10);
    next.order = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } else if (next.order === "" || next.order == null) {
    next.order = 0;
  }
  if (typeof next.featured !== "undefined") next.featured = next.featured === true;
  if (typeof next.interiorCatalog !== "undefined") {
    next.interiorCatalog = next.interiorCatalog === true;
  }
  if (typeof next.isNew !== "undefined") next.isNew = next.isNew === true;
  return next;
}

function errorMessage(error: unknown) {
  return varsoviaErrorMessage(error);
}

export default function VarsoviaManagerPage() {
  return (
    <Suspense fallback={null}>
      <VarsoviaManagerContent />
    </Suspense>
  );
}

const VARSOVIA_RESOURCE_ALIASES: Record<string, string> = {
  faqs: "faqPage",
  showcases: "projectsPage",
  "team-members": "teamPage",
  blogs: "iaJournal",
};

function aliasVarsoviaNav(detail: VarsoviaNavDetail): VarsoviaNavDetail {
  const section = VARSOVIA_RESOURCE_ALIASES[detail.resource];
  if (!section) return detail;
  return { resource: "site", section };
}

function VarsoviaManagerContent() {
  const search = useSearchParams();
  const [nav, setNav] = useState<VarsoviaNavDetail>(() =>
    aliasVarsoviaNav({
      resource: search.get("resource") || "site",
      section: search.get("section"),
    })
  );

  useEffect(() => {
    setNav(aliasVarsoviaNav(readVarsoviaNavFromUrl()));
    const onNav = (event: Event) => {
      const detail = (event as CustomEvent<VarsoviaNavDetail>).detail;
      if (detail?.resource) setNav(aliasVarsoviaNav(detail));
    };
    const onPop = () => setNav(aliasVarsoviaNav(readVarsoviaNavFromUrl()));
    window.addEventListener(VARSOVIA_NAV_EVENT, onNav);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(VARSOVIA_NAV_EVENT, onNav);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    const fromUrl = readVarsoviaNavFromUrl();
    const section = VARSOVIA_RESOURCE_ALIASES[fromUrl.resource];
    if (!section) return;
    writeVarsoviaNav("site", section);
  }, [nav.resource, nav.section]);

  const requested = nav.resource || "site";
  const active =
    requested === "site" || RESOURCE_IDS.includes(requested as VarsoviaResource)
      ? requested
      : "site";

  return (
    <div key={active} className="tk-admin-panel-swap h-full min-h-0">
      {active === "site" ? (
        <SiteSettings />
      ) : active === "testimonials" ? (
        <TestimonialsInlineEditor />
      ) : active === "faqs" ? (
        <FaqsInlineEditor />
      ) : active === "catalogues" ? (
        <CataloguesInlineEditor />
      ) : active === "showcases" ? (
        <ShowcasesInlineEditor />
      ) : active === "team-members" ? (
        <TeamInlineEditor />
      ) : active === "partners" ? (
        <PartnersInlineEditor />
      ) : (
        <ResourceManager resource={active as VarsoviaResource} />
      )}
    </div>
  );
}

/** Home / page Site Settings: inline editors for section item data. */
function HomeSectionItemsPanel({ sectionId }: { sectionId: string }) {
  switch (sectionId) {
    case "featured":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <ResourceManager
            resource="projects"
            embedded
            fields={FEATURED_HOME_FIELDS}
          />
        </div>
      );
    case "catalogue":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <CataloguesInlineEditor embedded />
        </div>
      );
    case "products":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <ResourceManager
            resource="products"
            embedded
            fields={PRODUCTS_HOME_FIELDS}
          />
        </div>
      );
    case "testimonials":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <TestimonialsInlineEditor embedded />
        </div>
      );
    case "coreStrengths":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <ResourceManager resource="core-strengths" embedded />
        </div>
      );
    case "partners":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <PartnersInlineEditor embedded />
        </div>
      );
    case "contactPage":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <ResourceManager resource="showrooms" embedded />
        </div>
      );
    case "iaJournal":
      return (
        <div className="mt-8 border-t border-[#E8EAED] pt-8">
          <p className="mb-4 text-sm font-semibold text-[#1A2332]">
            All articles — same cards as live /journal
          </p>
          <ResourceManager resource="blogs" embedded />
        </div>
      );
    case "faqPage":
      return (
        <div className="mt-2">
          <FaqsInlineEditor embedded />
        </div>
      );
    case "projectsPage":
      return (
        <div className="mt-2">
          <ShowcasesInlineEditor embedded />
        </div>
      );
    case "teamPage":
      return (
        <div className="mt-2">
          <TeamInlineEditor embedded />
        </div>
      );
    default:
      return null;
  }
}

function isVarsoviaSectionComplete(
  section: SiteSection,
  content: Record<string, unknown>,
  locale: LocaleCode
): boolean {
  if (!section.fields.length) return false;
  return section.fields.some((field) => {
    if (field.type === "section-divider") return false;
    if (field.type === "embedded-resource") return false;
    const raw = getAtPath(content, field.key);
    if (field.type === "boolean") return typeof raw === "boolean";
    if (field.localized) {
      return Boolean(localizedValue(raw, locale, { strict: true }).trim());
    }
    if (Array.isArray(raw)) return raw.length > 0;
    if (raw && typeof raw === "object") return Object.keys(raw as object).length > 0;
    return Boolean(String(raw ?? "").trim());
  });
}

function SiteSettings() {
  const search = useSearchParams();
  const sectionParam = search.get("section");
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [active, setActive] = useState(() =>
    isSiteSectionId(sectionParam) ? String(sectionParam) : SITE_SECTIONS[0]?.id || "hero"
  );
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [pageTab, setPageTab] = useState(0);
  const savedPayloadRef = useRef("");
  const contentRef = useRef<Record<string, unknown>>({});
  const loadSeqRef = useRef(0);
  const sectionSavesRef = useRef(new Map<string, SectionSaveHandler>());

  const registerSectionSave = useCallback(
    (id: string, handler: SectionSaveHandler | null) => {
      if (handler) sectionSavesRef.current.set(id, handler);
      else sectionSavesRef.current.delete(id);
    },
    []
  );

  const sectionSaveApi = useMemo(
    () => ({ register: registerSectionSave }),
    [registerSectionSave]
  );

  // Deep-link once + sidebar/rail picks via soft nav (no Next router flicker).
  useEffect(() => {
    const fromUrl = readAdminSectionFromUrl();
    if (isSiteSectionId(fromUrl)) setActive(String(fromUrl));
    else if (!fromUrl) setActive("hero");

    const onSection = (event: Event) => {
      const key = (event as CustomEvent<string>).detail;
      if (isSiteSectionId(key)) {
        setActive(String(key));
        setPageTab(0);
      } else if (!key || key === "hero") {
        setActive("hero");
        setPageTab(0);
      }
    };
    window.addEventListener(ADMIN_SECTION_EVENT, onSection);
    return () => window.removeEventListener(ADMIN_SECTION_EVENT, onSection);
  }, []);

  const selectSection = (id: string) => {
    if (id === active) return;
    setActive(id);
    setPageTab(0);
    writeVarsoviaNav("site", id === "hero" ? null : id);
  };

  const loadContent = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setLoadingContent(true);
    try {
      const loaded = normalizeRecord(
        (await getVarsoviaSite()) as VarsoviaRecord
      );
      const { site: hydrated } = await hydrateVarsoviaSiteDocument(loaded);
      if (seq !== loadSeqRef.current) return;
      contentRef.current = hydrated;
      setContent(hydrated);
      savedPayloadRef.current = JSON.stringify(pickVarsoviaSiteUpdate(loaded));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      if (seq === loadSeqRef.current) setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  useEffect(() => {
    const onSynced = () => {
      void loadContent();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [loadContent]);

  const updateContentField = (field: Field, value: unknown) => {
    setContent((prev) => {
      const base = Object.keys(prev).length ? prev : contentRef.current;
      let next: Record<string, unknown>;
      if (field.localized) {
        const existing = getAtPath(base, field.key);
        const localized: Record<string, unknown> =
          existing && typeof existing === "object" && !Array.isArray(existing)
            ? { ...(existing as Record<string, unknown>) }
            : { en: typeof existing === "string" ? existing : "" };
        localized[locale] = value;
        next = setAtPath(base, field.key, localized);
      } else {
        next = setAtPath(base, field.key, value);
      }
      contentRef.current = next;
      return next;
    });
  };

  const saveContent = async (opts?: { quiet?: boolean }) => {
    const current = contentRef.current;
    const nextPayload = pickVarsoviaSiteUpdate(current);
    const nextSerialized = JSON.stringify(nextPayload);
    const siteDirty = nextSerialized !== savedPayloadRef.current;
    const embeddedHandlers = [...sectionSavesRef.current.values()];

    setSavingContent(true);
    try {
      const statsInvalid = [current.stats, (current.teamPage as { stats?: unknown } | undefined)?.stats]
        .filter(Array.isArray)
        .some((list) =>
          (list as { value?: unknown }[]).some((row) => {
            const raw = localizedValue(row?.value, "en").trim();
            return raw !== "" && /[A-Za-z]/.test(raw);
          })
        );
      if (statsInvalid) {
        toast.error("Statistics values must be numbers only.");
        setSavingContent(false);
        return;
      }

      await updateVarsoviaSite(current);
      savedPayloadRef.current = nextSerialized;
      contentRef.current = current;
      setContent(current);
      for (const handler of embeddedHandlers) {
        await handler({ quiet: true });
      }
      if (!opts?.quiet) {
        toast.success(siteDirty ? "Saved — live site updated" : "Saved");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (!/validation failed/i.test(msg)) {
        toast.error(errorMessage(error));
      }
    } finally {
      setSavingContent(false);
    }
  };

  const onResetPage = async () => {
    if (
      !confirm(
        "Reload from the server and discard unsaved changes on this page?"
      )
    ) {
      return;
    }
    await loadContent();
    toast.message("Reloaded from server");
  };

  const homeSections = useMemo(
    () => SITE_SECTIONS.filter((section) => section.group === "home"),
    []
  );
  const showHomeRail = homeSections.some((section) => section.id === active);

  const homeDoneCount = useMemo(
    () =>
      homeSections.filter((section) =>
        isVarsoviaSectionComplete(section, content, locale)
      ).length,
    [content, homeSections, locale]
  );

  const activeSection =
    SITE_SECTIONS.find((section) => section.id === active) || SITE_SECTIONS[0];
  const complete = activeSection
    ? isVarsoviaSectionComplete(activeSection, content, locale)
    : false;

  const sectionTabs = useMemo(
    () => splitFieldsIntoTabs(activeSection?.fields || []),
    [activeSection]
  );
  const useSectionTabs =
    !activeSection.stackFields && sectionTabs.length >= 2;
  const activeTabFields = useSectionTabs
    ? sectionTabs[Math.min(pageTab, sectionTabs.length - 1)]?.fields || []
    : activeSection.fields;

  useEffect(() => {
    setPageTab(0);
  }, [active]);

  useEffect(() => {
    if (pageTab >= sectionTabs.length && sectionTabs.length > 0) {
      setPageTab(0);
    }
  }, [pageTab, sectionTabs.length]);

  return (
    <VarsoviaSectionSaveContext.Provider value={sectionSaveApi}>
    <section className="flex h-full min-h-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showHomeRail ? (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#5C6370]">
                Home Management
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
                <Check className="h-3.5 w-3.5" />
                {homeDoneCount} of {homeSections.length} Sections Ready
              </span>
            </>
          ) : (
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#5C6370]">
              {activeSection.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void saveContent()}
            disabled={savingContent || loadingContent}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243044] disabled:opacity-60"
          >
            <CloudUpload className="h-4 w-4" />
            Save
          </button>
          {showHomeRail ? (
            <button
              type="button"
              onClick={() => void onResetPage()}
              disabled={savingContent || loadingContent}
              className="text-sm font-medium text-[#6B7280] underline-offset-2 hover:text-[#DC2626] hover:underline disabled:opacity-60"
            >
              Reset to defaults
            </button>
          ) : null}
        </div>
      </div>

      {loadingContent ? (
        <p className="text-sm text-[#6B7280]">Loading sections…</p>
      ) : (
        <div
          className={clsx(
            "grid min-h-0 flex-1 items-stretch gap-5",
            showHomeRail
              ? "grid-cols-1 xl:grid-cols-[340px_1fr]"
              : "grid-cols-1"
          )}
        >
          {showHomeRail ? (
          <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#E8EAED] bg-white">
            <div className="flex items-center justify-between border-b border-[#E8EAED] px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5C6370]">
                Same order as website
              </span>
              <span className="text-xs font-semibold text-[#16A34A]">
                {homeDoneCount}/{homeSections.length} Done
              </span>
            </div>
            <ul className="min-h-0 flex-1 divide-y divide-[#F0F1F3] overflow-y-auto">
              <li className="list-none">
                <p className="bg-[#F8F9FB] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Home page (site order)
                </p>
              </li>
              {homeSections.map((section) => {
                const selected = active === section.id;
                const ok = isVarsoviaSectionComplete(section, content, locale);
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => selectSection(section.id)}
                      className={clsx(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-l-[3px] border-l-[#1A2332] bg-[#F3F4F6]"
                          : "border-l-[3px] border-l-transparent hover:bg-[#F9FAFB]"
                      )}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF0F3]">
                        <Icon className="h-4 w-4 text-[#1A2332]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#1A2332]">
                          {section.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                          {section.description}
                        </p>
                      </div>
                      {ok ? (
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22C55E]">
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          ) : null}

          <div
            className={clsx(
              "flex min-h-0 flex-col overflow-hidden rounded-xl border border-[#E8EAED] bg-white",
              activeSection?.group === "chrome" ? "w-full max-w-3xl" : ""
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-5 lg:p-6">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#1A2332]">
                    {activeSection.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6B7280]">
                    {useSectionTabs
                      ? "Edit one section at a time — same pattern as Thailand Kitchen hubs."
                      : activeSection.description}
                  </p>
                  {activeSection.livePath ? (
                    <div className="mt-2 rounded-lg border border-[#E2E5EA] bg-[#F8FAFC] px-3.5 py-2">
                      <p className="text-[11px] font-semibold text-[#5C6370]">
                        Live URL preview
                      </p>
                      <p className="mt-0.5 font-mono text-sm text-[#1A2332]">
                        {activeSection.livePath}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {LOCALES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLocale(item.id)}
                      className={clsx(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold",
                        locale === item.id
                          ? "bg-[#1A2332] text-white"
                          : "bg-[#F0F2F5] text-[#5C6370]"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                  {complete ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
                      <Check className="h-3.5 w-3.5" />
                      Complete
                    </span>
                  ) : null}
                </div>
              </div>

              {useSectionTabs ? (
                <div
                  className={clsx(
                    "mb-6 grid gap-2",
                    sectionTabs.length <= 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : sectionTabs.length === 3
                        ? "grid-cols-1 sm:grid-cols-3"
                        : sectionTabs.length === 4
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                  )}
                >
                  {sectionTabs.map((tab, index) => {
                    const selected = pageTab === index;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPageTab(index)}
                        className={clsx(
                          "rounded-xl border px-3 py-3 text-left transition",
                          selected
                            ? "border-[#1A2332] bg-[#1A2332] text-white"
                            : "border-[#E8EDF2] bg-[#F8FAFC] text-[#1A2332] hover:border-[#D8D2C8]"
                        )}
                      >
                        <p
                          className={clsx(
                            "text-[10px] font-semibold uppercase tracking-[0.16em]",
                            selected ? "text-white/70" : "text-[#6B7280]"
                          )}
                        >
                          {tab.tag}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-snug">
                          {tab.label}
                        </p>
                        {tab.hint ? (
                          <p
                            className={clsx(
                              "mt-0.5 line-clamp-2 text-[10px] leading-snug",
                              selected ? "text-white/55" : "text-[#9CA3AF]"
                            )}
                          >
                            {tab.hint}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeTabFields.map((field) => {
                  if (field.type === "embedded-resource") {
                    if (useSectionTabs) return null;
                    return (
                      <div key={field.key} className="md:col-span-2">
                        <HomeSectionItemsPanel
                          sectionId={field.itemKey || active}
                        />
                      </div>
                    );
                  }
                  if (field.type === "section-divider") {
                    if (useSectionTabs) return null;
                    return (
                      <FieldControl
                        key={field.key}
                        field={field}
                        value={null}
                        locale={locale}
                        onChange={() => undefined}
                      />
                    );
                  }
                  const raw = getAtPath(content, field.key);
                  const structured =
                    field.type === "string-list" ||
                    field.type === "localized-string-list" ||
                    field.type === "stats-list" ||
                    field.type === "process-list" ||
                    field.type === "faq-list" ||
                    field.type === "showcase-meta-list" ||
                    field.type === "tool-list" ||
                    field.type === "spec-list" ||
                    field.type === "content-sections" ||
                    field.type === "strength-list" ||
                    field.type === "office-list" ||
                    field.type === "search-page-list" ||
                    field.type === "footer-nav" ||
                    field.type === "main-nav" ||
                    field.type === "inquiry-form" ||
                    field.type === "ia-children-list";
                  const value = field.localized
                    ? localizedValue(raw, locale, { strict: true })
                    : structured
                      ? raw
                      : field.type === "json"
                        ? raw === undefined
                          ? ""
                          : typeof raw === "string"
                            ? raw
                            : JSON.stringify(raw, null, 2)
                        : raw;

                  return (
                    <FieldControl
                      key={`${field.key}-${field.localized ? locale : "shared"}`}
                      field={field}
                      value={value}
                      locale={locale}
                      onChange={(next) => {
                        if (field.type !== "json") {
                          updateContentField(field, next);
                          return;
                        }
                        try {
                          updateContentField(
                            field,
                            String(next).trim() ? JSON.parse(String(next)) : []
                          );
                        } catch {
                          updateContentField(field, next);
                        }
                      }}
                    />
                  );
                })}
              </div>

              {useSectionTabs
                ? (activeSection.fields || [])
                    .filter((field) => field.type === "embedded-resource")
                    .map((field) => {
                      const onThisTab = activeTabFields.some(
                        (item) => item.key === field.key
                      );
                      return (
                        <div
                          key={field.key}
                          className={onThisTab ? "mt-4" : "hidden"}
                        >
                          <HomeSectionItemsPanel
                            sectionId={field.itemKey || active}
                          />
                        </div>
                      );
                    })
                : null}

              {(activeSection.fields || []).some(
                (field) => field.type === "embedded-resource"
              ) ? null : (
                <HomeSectionItemsPanel sectionId={active} />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
    </VarsoviaSectionSaveContext.Provider>
  );
}

type CatalogueDraft = {
  clientKey: string;
  _id?: string;
  title: unknown;
  category: unknown;
  coverImage: string;
  downloadUrl: string;
  fileName: string;
  downloadName: string;
  visible: boolean;
  order: number;
};

function toCatalogueDraft(item?: VarsoviaRecord, index = 0): CatalogueDraft {
  return {
    clientKey: item?._id || `catalogue-new-${index}-${Date.now()}`,
    _id: item?._id,
    title: item?.title ?? emptyLocalized(),
    category: item?.category ?? emptyLocalized(),
    coverImage: String(item?.coverImage ?? item?.image ?? ""),
    downloadUrl: String(item?.downloadUrl ?? item?.pdfUrl ?? ""),
    fileName: String(item?.fileName ?? ""),
    downloadName: String(item?.downloadName ?? ""),
    visible: item?.visible !== false,
    order: Number(item?.order ?? index) || index,
  };
}

function CataloguesInlineEditor({ embedded = false }: { embedded?: boolean }) {
  const [drafts, setDrafts] = useState<CatalogueDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listVarsoviaRecords("catalogues");
      setDrafts(rows.map((item, index) => toCatalogueDraft(item, index)));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const complete = drafts.length >= 1;

  const updateDraft = (clientKey: string, patch: Partial<CatalogueDraft>) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.clientKey === clientKey ? { ...item, ...patch } : item
      )
    );
  };

  const addDraft = () => {
    setDrafts((prev) => [...prev, toCatalogueDraft(undefined, prev.length)]);
  };

  const removeDraft = async (draft: CatalogueDraft) => {
    if (draft._id) {
      if (
        !confirm(
          `Remove "${localizedValue(draft.title, locale) || "catalogue"}"?`
        )
      ) {
        return;
      }
      try {
        await deleteVarsoviaRecord("catalogues", draft._id);
        toast.success("Catalogue deleted");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      }
    }
    setDrafts((prev) => prev.filter((item) => item.clientKey !== draft.clientKey));
  };

  const saveAll = async (opts?: { quiet?: boolean }) => {
    const invalid = drafts.some(
      (draft) => !localizedValue(draft.title, "en").trim()
    );
    if (invalid) {
      toast.error("Each catalogue needs an English title");
      setLocale("en");
      throw new Error("Catalogue validation failed");
    }

    try {
      setSaving(true);
      for (let index = 0; index < drafts.length; index += 1) {
        const draft = drafts[index];
        const payload = {
          title: draft.title,
          category: draft.category,
          coverImage: draft.coverImage,
          downloadUrl: draft.downloadUrl,
          fileName: draft.fileName,
          downloadName: draft.downloadName,
          visible: draft.visible !== false,
          order: index,
        };
        if (draft._id) {
          await updateVarsoviaRecord("catalogues", draft._id, payload);
        } else {
          await createVarsoviaRecord("catalogues", payload);
        }
      }
      if (!opts?.quiet) toast.success("Catalogues saved");
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useRegisterSectionSave("catalogues", saveAll, embedded);

  const fieldClass =
    "w-full rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]";

  return (
    <section className={embedded ? "space-y-4" : "space-y-5"}>
      <div className={embedded ? "" : "rounded-xl border border-[#E8EAED] bg-white p-5 lg:p-6"}>
        {!embedded ? (
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1A2332]">Free Catalogue</h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              3 downloadable PDF catalogs
            </p>
          </div>
          {complete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
              <Check className="h-3.5 w-3.5" />
              Complete
            </span>
          ) : null}
        </div>
        ) : (
          <p className="mb-4 text-sm font-semibold text-[#1A2332]">Catalogue brochures</p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {(["en", "th", "pl"] as LocaleCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                locale === code
                  ? "bg-[#1A2332] text-white"
                  : "bg-[#F3F4F6] text-[#5C6370]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft, index) => (
              <div
                key={draft.clientKey}
                className="space-y-3 rounded-xl border border-[#E8EAED] p-4"
              >
                <div className="flex justify-between">
                  <span className="text-xs font-bold uppercase text-[#5C6370]">
                    Catalogue #{index + 1}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => void removeDraft(draft)}
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                    Title
                  </label>
                  <input
                    type="text"
                    value={localizedValue(draft.title, locale)}
                    onChange={(event) =>
                      updateDraft(draft.clientKey, {
                        title: writeLocalizedField(
                          draft.title,
                          locale,
                          event.target.value
                        ),
                      })
                    }
                    className={fieldClass}
                  />
                </div>

                <MediaUpload
                  label="Cover Image"
                  kind="image"
                  value={draft.coverImage}
                  onChange={(value) =>
                    updateDraft(draft.clientKey, { coverImage: value })
                  }
                  uploadFile={uploadVarsoviaMedia}
                />

                <MediaUpload
                  label="PDF File"
                  kind="pdf"
                  value={draft.downloadUrl}
                  onChange={(value) =>
                    updateDraft(draft.clientKey, { downloadUrl: value })
                  }
                  uploadFile={uploadVarsoviaMedia}
                />

                <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                  <input
                    type="checkbox"
                    checked={draft.visible}
                    onChange={(event) =>
                      updateDraft(draft.clientKey, {
                        visible: event.target.checked,
                      })
                    }
                  />
                  Visible on website
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addDraft}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add catalogue
            </button>
          </div>
        )}

        {!embedded ? (
        <div className="mt-8 flex items-center gap-2 border-t border-[#E8EAED] pt-5">
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243044] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save catalogues"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={saving || loading}
            className="text-sm font-medium text-[#6B7280] underline-offset-2 hover:text-[#DC2626] hover:underline disabled:opacity-60"
          >
            Reload
          </button>
        </div>
        ) : (
          <p className="mt-3 text-[11px] text-[#9CA3AF]">
            Use the top Save button to save catalogue brochures with this section.
          </p>
        )}
      </div>
    </section>
  );
}

type TeamDraft = {
  clientKey: string;
  _id?: string;
  name: unknown;
  role: unknown;
  image: string;
  teamType: "Italian" | "Headquarter";
  visible: boolean;
  order: number;
};

function toTeamDraft(item?: VarsoviaRecord, index = 0): TeamDraft {
  const teamType =
    item?.teamType === "Headquarter" ? "Headquarter" : "Italian";
  return {
    clientKey: item?._id || `team-new-${index}-${Date.now()}`,
    _id: item?._id,
    name: item?.name ?? emptyLocalized(),
    role: item?.role ?? emptyLocalized(),
    image: String(item?.image ?? ""),
    teamType,
    visible: item?.visible !== false,
    order: Number(item?.order ?? index) || index,
  };
}

function TeamInlineEditor({ embedded = false }: { embedded?: boolean }) {
  const [drafts, setDrafts] = useState<TeamDraft[]>([]);
  const [pageTitle, setPageTitle] = useState("Our Team");
  const [subtitle, setSubtitle] = useState(
    "The creative minds behind every beautiful space"
  );
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [siteSnapshot, setSiteSnapshot] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rows, site] = await Promise.all([
        listVarsoviaRecords("team-members"),
        getVarsoviaSite(),
      ]);
      const normalized = mergeVarsoviaSiteDefaults(
        normalizeRecord(site as VarsoviaRecord)
      );
      setSiteSnapshot(normalized);
      const teamPage =
        normalized.teamPage && typeof normalized.teamPage === "object"
          ? (normalized.teamPage as Record<string, unknown>)
          : {};
      setPageTitle(localizedValue(teamPage.heroTitle, locale) || "Our Team");
      setSubtitle(
        localizedValue(teamPage.heroSubtitle, locale) ||
          "THE CREATIVE MINDS BEHIND EVERY BEAUTIFUL SPACE"
      );
      setUpdatedLabel(String(normalized.teamUpdatedLabel ?? ""));
      setDrafts(rows.map((item, index) => toTeamDraft(item, index)));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const updateDraft = (clientKey: string, patch: Partial<TeamDraft>) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.clientKey === clientKey ? { ...item, ...patch } : item
      )
    );
  };

  const addDraft = () => {
    setDrafts((prev) => [...prev, toTeamDraft(undefined, prev.length)]);
  };

  const removeDraft = async (draft: TeamDraft) => {
    if (draft._id) {
      if (
        !confirm(
          `Remove "${localizedValue(draft.name, locale) || "team member"}"?`
        )
      ) {
        return;
      }
      try {
        await deleteVarsoviaRecord("team-members", draft._id);
        toast.success("Team member deleted");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      }
    }
    setDrafts((prev) =>
      prev.filter((item) => item.clientKey !== draft.clientKey)
    );
  };

  const saveAll = async (opts?: { quiet?: boolean }) => {
    if (!embedded && !pageTitle.trim()) {
      toast.error("Page title is required");
      throw new Error("validation failed");
    }
    const invalid = drafts.some(
      (draft) => !localizedValue(draft.name, "en").trim()
    );
    if (invalid) {
      toast.error("Each section needs an English name");
      setLocale("en");
      throw new Error("validation failed");
    }

    try {
      setSaving(true);
      if (!embedded) {
        const existingTeamPage =
          siteSnapshot.teamPage && typeof siteSnapshot.teamPage === "object"
            ? (siteSnapshot.teamPage as Record<string, unknown>)
            : {};

        await updateVarsoviaSite({
          ...siteSnapshot,
          teamUpdatedLabel: updatedLabel,
          teamPage: {
            ...existingTeamPage,
            heroTitle: writeLocalizedField(
              existingTeamPage.heroTitle,
              locale,
              pageTitle.trim()
            ),
            heroSubtitle: writeLocalizedField(
              existingTeamPage.heroSubtitle,
              locale,
              subtitle.trim()
            ),
          },
        });
      } else if (updatedLabel.trim()) {
        const latest = mergeVarsoviaSiteDefaults(
          normalizeRecord((await getVarsoviaSite()) as VarsoviaRecord)
        );
        await updateVarsoviaSite({
          ...latest,
          teamUpdatedLabel: updatedLabel,
        });
      }

      for (let index = 0; index < drafts.length; index += 1) {
        const draft = drafts[index];
        const payload = {
          name: draft.name,
          role: draft.role,
          image: draft.image,
          teamType: draft.teamType,
          visible: draft.visible !== false,
          order: index,
        };
        if (draft._id) {
          await updateVarsoviaRecord("team-members", draft._id, payload);
        } else {
          await createVarsoviaRecord("team-members", payload);
        }
      }
      if (!opts?.quiet) toast.success("Team saved");
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useRegisterSectionSave("team-members", saveAll, embedded);

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal";

  return (
    <section className={embedded ? "space-y-4" : "max-w-5xl space-y-5"}>
      {!embedded ? (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8EAED] bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A2332] text-white">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1A2332]">
              Team Management
            </h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Manage team page sections and member profiles
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void saveAll()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Team"}
        </button>
      </div>
      ) : (
        <p className="text-sm font-semibold text-[#1A2332]">
          Team members — same photos as live /team
        </p>
      )}

      <div className={embedded ? "space-y-4" : "space-y-4 rounded-xl border border-[#E8EAED] bg-white p-5"}>
        <div className="mb-1 flex flex-wrap gap-2">
          {(["en", "th", "pl"] as LocaleCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                locale === code
                  ? "bg-[#1A2332] text-white"
                  : "bg-[#F3F4F6] text-[#5C6370]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {!embedded ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-semibold text-[#5C6370]">
            Page Title
            <input
              required
              value={pageTitle}
              onChange={(event) => setPageTitle(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold text-[#5C6370]">
            Subheading
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        ) : null}

        <div className="pt-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A2332]">
                Team members
              </h3>
              <p className="mt-1 text-xs text-[#6B7280]">
                Add headings and details for each team member.
              </p>
            </div>
            <button
              type="button"
              onClick={addDraft}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-3.5 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Section Block
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#6B7280]">Loading…</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div
                  key={draft.clientKey}
                  className="space-y-3 rounded-xl border border-[#E8EAED] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold tracking-wide text-[#334155]">
                      SECTION #{index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => void removeDraft(draft)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Section
                    </button>
                  </div>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Name
                    <input
                      value={localizedValue(draft.name, locale)}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          name: writeLocalizedField(
                            draft.name,
                            locale,
                            event.target.value
                          ),
                        })
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Role
                    <input
                      value={localizedValue(draft.role, locale)}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          role: writeLocalizedField(
                            draft.role,
                            locale,
                            event.target.value
                          ),
                        })
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Team Type
                    <select
                      value={draft.teamType}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          teamType:
                            event.target.value === "Headquarter"
                              ? "Headquarter"
                              : "Italian",
                        })
                      }
                      className={fieldClass}
                    >
                      <option value="Italian">Italian (Design Team)</option>
                      <option value="Headquarter">
                        Headquarter (Architect / Engineers)
                      </option>
                    </select>
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                    <input
                      type="checkbox"
                      checked={draft.visible}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          visible: event.target.checked,
                        })
                      }
                    />
                    Visible on website
                  </label>

                  <MediaUpload
                    label="Photo"
                    kind="image"
                    value={draft.image}
                    onChange={(value) =>
                      updateDraft(draft.clientKey, { image: value })
                    }
                    uploadFile={uploadVarsoviaMedia}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type PartnerDraft = {
  clientKey: string;
  _id?: string;
  name: unknown;
  logo: string;
  website: string;
  visible: boolean;
  order: number;
};

function toPartnerDraft(item?: VarsoviaRecord, index = 0): PartnerDraft {
  return {
    clientKey: item?._id || `partner-new-${index}-${Date.now()}`,
    _id: item?._id,
    name: item?.name ?? emptyLocalized(),
    logo: String(item?.logo ?? ""),
    website: String(item?.website ?? ""),
    visible: item?.visible !== false,
    order: Number(item?.order ?? index) || index,
  };
}

function PartnersInlineEditor({ embedded = false }: { embedded?: boolean }) {
  const [drafts, setDrafts] = useState<PartnerDraft[]>([]);
  const [pageTitle, setPageTitle] = useState("Our Global Partners");
  const [subtitle, setSubtitle] = useState(
    "Powered by trusted brands from around the world"
  );
  const [updatedLabel, setUpdatedLabel] = useState("");
  const [siteSnapshot, setSiteSnapshot] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rows, site] = await Promise.all([
        listVarsoviaRecords("partners"),
        getVarsoviaSite(),
      ]);
      const normalized = mergeVarsoviaSiteDefaults(
        normalizeRecord(site as VarsoviaRecord)
      );
      setSiteSnapshot(normalized);
      const partnersCopy =
        normalized.sectionCopy &&
        typeof normalized.sectionCopy === "object" &&
        (normalized.sectionCopy as Record<string, unknown>).partners &&
        typeof (normalized.sectionCopy as Record<string, unknown>).partners ===
          "object"
          ? ((normalized.sectionCopy as Record<string, unknown>)
              .partners as Record<string, unknown>)
          : {};
      setPageTitle(
        localizedValue(partnersCopy.title, locale) || "Our Global Partners"
      );
      setSubtitle(
        localizedValue(partnersCopy.subtitle, locale) ||
          "Powered by trusted brands from around the world"
      );
      setUpdatedLabel(String(normalized.partnersUpdatedLabel ?? ""));
      setDrafts(rows.map((item, index) => toPartnerDraft(item, index)));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const updateDraft = (clientKey: string, patch: Partial<PartnerDraft>) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.clientKey === clientKey ? { ...item, ...patch } : item
      )
    );
  };

  const addDraft = () => {
    setDrafts((prev) => [...prev, toPartnerDraft(undefined, prev.length)]);
  };

  const removeDraft = async (draft: PartnerDraft) => {
    if (draft._id) {
      if (
        !confirm(
          `Remove "${localizedValue(draft.name, locale) || "partner"}"?`
        )
      ) {
        return;
      }
      try {
        await deleteVarsoviaRecord("partners", draft._id);
        toast.success("Partner deleted");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      }
    }
    setDrafts((prev) =>
      prev.filter((item) => item.clientKey !== draft.clientKey)
    );
  };

  const saveAll = async (opts?: { quiet?: boolean }) => {
    if (!embedded && !pageTitle.trim()) {
      toast.error("Page title is required");
      throw new Error("Partners validation failed");
    }
    const invalid = drafts.some(
      (draft) => !localizedValue(draft.name, "en").trim()
    );
    if (invalid) {
      toast.error("Each section needs an English name");
      setLocale("en");
      throw new Error("Partners validation failed");
    }

    try {
      setSaving(true);
      if (!embedded) {
        const existingSectionCopy =
          siteSnapshot.sectionCopy && typeof siteSnapshot.sectionCopy === "object"
            ? { ...(siteSnapshot.sectionCopy as Record<string, unknown>) }
            : {};
        const existingPartners =
          existingSectionCopy.partners &&
          typeof existingSectionCopy.partners === "object"
            ? { ...(existingSectionCopy.partners as Record<string, unknown>) }
            : {};

        await updateVarsoviaSite({
          ...siteSnapshot,
          sectionCopy: {
            ...existingSectionCopy,
            partners: {
              ...existingPartners,
              title: writeLocalizedField(
                existingPartners.title,
                locale,
                pageTitle.trim()
              ),
              subtitle: writeLocalizedField(
                existingPartners.subtitle,
                locale,
                subtitle.trim()
              ),
            },
          },
        });
      }

      for (let index = 0; index < drafts.length; index += 1) {
        const draft = drafts[index];
        const payload = {
          name: draft.name,
          logo: draft.logo,
          website: draft.website,
          visible: draft.visible !== false,
          order: index,
        };
        if (draft._id) {
          await updateVarsoviaRecord("partners", draft._id, payload);
        } else {
          await createVarsoviaRecord("partners", payload);
        }
      }
      if (!opts?.quiet) toast.success("Partners saved");
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useRegisterSectionSave("partners", saveAll, embedded);

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal";

  return (
    <section className={embedded ? "space-y-4" : "max-w-5xl space-y-5"}>
      {!embedded ? (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8EAED] bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A2332] text-white">
            <Handshake className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1A2332]">
              Our Global Partners
            </h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Manage partners section and brand logos
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void saveAll()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Partners"}
        </button>
      </div>
      ) : (
        <p className="text-sm font-semibold text-[#1A2332]">Partner logos</p>
      )}

      <div className={embedded ? "space-y-4" : "space-y-4 rounded-xl border border-[#E8EAED] bg-white p-5"}>
        <div className="mb-1 flex flex-wrap gap-2">
          {(["en", "th", "pl"] as LocaleCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                locale === code
                  ? "bg-[#1A2332] text-white"
                  : "bg-[#F3F4F6] text-[#5C6370]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {!embedded ? (
        <>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-xs font-semibold text-[#5C6370]">
            Page Title
            <input
              required
              value={pageTitle}
              onChange={(event) => setPageTitle(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-xs font-semibold text-[#5C6370]">
            Subheading
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        </>
        ) : null}

        <div className="pt-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A2332]">
                Partner logos
              </h3>
              <p className="mt-1 text-xs text-[#6B7280]">
                Name and logo for each brand in the homepage strip.
              </p>
            </div>
            <button
              type="button"
              onClick={addDraft}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-3.5 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Section Block
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#6B7280]">Loading…</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div
                  key={draft.clientKey}
                  className="space-y-3 rounded-xl border border-[#E8EAED] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold tracking-wide text-[#334155]">
                      SECTION #{index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => void removeDraft(draft)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Section
                    </button>
                  </div>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Name
                    <input
                      value={localizedValue(draft.name, locale)}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          name: writeLocalizedField(
                            draft.name,
                            locale,
                            event.target.value
                          ),
                        })
                      }
                      className={fieldClass}
                    />
                  </label>

                  <MediaUpload
                    label="Logo"
                    kind="icon"
                    previewSize="md"
                    value={draft.logo}
                    onChange={(value) =>
                      updateDraft(draft.clientKey, { logo: value })
                    }
                    uploadFile={uploadVarsoviaMedia}
                    hint="Brand logo shown in the homepage partners strip."
                  />

                  <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                    <input
                      type="checkbox"
                      checked={draft.visible}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          visible: event.target.checked,
                        })
                      }
                    />
                    Visible on website
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {embedded ? (
          <p className="mt-3 text-[11px] text-[#9CA3AF]">
            Use the top Save button to save partner logos with this section.
          </p>
        ) : null}
      </div>
    </section>
  );
}

type ShowcaseDraft = {
  clientKey: string;
  _id?: string;
  title: unknown;
  category: unknown;
  location: unknown;
  typeLabel: unknown;
  typeValue: unknown;
  supplyArea: unknown;
  image: string;
  gallery: string[];
  visible: boolean;
  order: number;
};

function toShowcaseDraft(item?: VarsoviaRecord, index = 0): ShowcaseDraft {
  const image = String(item?.image ?? "");
  return {
    clientKey: item?._id || `showcase-new-${index}-${Date.now()}`,
    _id: item?._id,
    title: item?.title ?? emptyLocalized(),
    category: item?.category ?? emptyLocalized(),
    location: item?.location ?? emptyLocalized(),
    typeLabel: item?.typeLabel ?? emptyLocalized(),
    typeValue: item?.typeValue ?? emptyLocalized(),
    supplyArea: item?.supplyArea ?? emptyLocalized(),
    image,
    gallery: padShowcaseGallery(item?.gallery, image),
    visible: item?.visible !== false,
    order: Number(item?.order ?? index) || index,
  };
}

function ShowcasesInlineEditor({ embedded = false }: { embedded?: boolean }) {
  const [drafts, setDrafts] = useState<ShowcaseDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listVarsoviaRecords("showcases");
      setDrafts(rows.map((item, index) => toShowcaseDraft(item, index)));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const updateDraft = (clientKey: string, patch: Partial<ShowcaseDraft>) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.clientKey === clientKey ? { ...item, ...patch } : item
      )
    );
  };

  const addDraft = () => {
    setDrafts((prev) => [...prev, toShowcaseDraft(undefined, prev.length)]);
  };

  const removeDraft = async (draft: ShowcaseDraft) => {
    if (draft._id) {
      if (
        !confirm(
          `Remove "${localizedValue(draft.title, locale) || "showcase"}"?`
        )
      ) {
        return;
      }
      try {
        await deleteVarsoviaRecord("showcases", draft._id);
        toast.success("Showcase deleted");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      }
    }
    setDrafts((prev) =>
      prev.filter((item) => item.clientKey !== draft.clientKey)
    );
  };

  const saveAll = async (opts?: { quiet?: boolean }) => {
    const invalid = drafts.some(
      (draft) => !localizedValue(draft.title, "en").trim()
    );
    if (invalid) {
      toast.error("Each project needs an English title");
      setLocale("en");
      throw new Error("validation failed");
    }

    try {
      setSaving(true);

      for (let index = 0; index < drafts.length; index += 1) {
        const draft = drafts[index];
        const payload = {
          title: draft.title,
          category: draft.category,
          location: draft.location,
          typeLabel: draft.typeLabel,
          typeValue: draft.typeValue,
          supplyArea: draft.supplyArea,
          image: toPublicMediaUrl(draft.image),
          gallery: padShowcaseGallery(draft.gallery, draft.image).map((url) =>
            toPublicMediaUrl(url)
          ),
          visible: draft.visible !== false,
          order: index,
        };
        if (draft._id) {
          await updateVarsoviaRecord("showcases", draft._id, payload);
        } else {
          await createVarsoviaRecord("showcases", payload);
        }
      }
      if (!opts?.quiet) toast.success("Showcases saved");
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useRegisterSectionSave("showcases", saveAll, embedded);

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal";

  return (
    <section className={embedded ? "space-y-4" : "space-y-5 max-w-5xl"}>
      {!embedded ? (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8EAED] bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1A2332] text-white">
            <Images className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#1A2332]">
              Showcases Management
            </h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              Manage project page headings (drives /projects) and project cards
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void saveAll()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Showcases"}
        </button>
      </div>
      ) : (
        <p className="text-sm font-semibold text-[#1A2332]">
          Showcase projects — same cards as live /projects
        </p>
      )}

      <div className={embedded ? "space-y-4" : "space-y-4 rounded-xl border border-[#E8EAED] bg-white p-5"}>
        <div className="mb-1 flex flex-wrap gap-2">
          {(["en", "th", "pl"] as LocaleCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                locale === code
                  ? "bg-[#1A2332] text-white"
                  : "bg-[#F3F4F6] text-[#5C6370]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold text-[#5C6370]">
          Showcase tab headings moved
        </label>
        <p className="text-xs text-[#6B7280]">
          Listing headline, mega-menu EXPLORE, and region/type taglines are on Admin →
          Showcase (same fields as live /projects).
        </p>

        <div className="pt-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1A2332]">
                Showcase Content Sections
              </h3>
              <p className="mt-1 text-xs text-[#6B7280]">
                Add headings and details for each showcase project.
              </p>
            </div>
            <button
              type="button"
              onClick={addDraft}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-3.5 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Section Block
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#6B7280]">Loading…</p>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft, index) => (
                <div
                  key={draft.clientKey}
                  className="space-y-3 rounded-xl border border-[#E8EAED] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold tracking-wide text-[#334155]">
                      SECTION #{index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => void removeDraft(draft)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Section
                    </button>
                  </div>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Section Heading
                    <input
                      value={localizedValue(draft.title, locale)}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          title: writeLocalizedField(
                            draft.title,
                            locale,
                            event.target.value
                          ),
                        })
                      }
                      className={fieldClass}
                    />
                  </label>

                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Section Content
                    <textarea
                      rows={4}
                      value={localizedValue(draft.supplyArea, locale)}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          supplyArea: writeLocalizedField(
                            draft.supplyArea,
                            locale,
                            event.target.value
                          ),
                        })
                      }
                      className={`${fieldClass} resize-y`}
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Category
                      <input
                        value={localizedValue(draft.category, locale)}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            category: writeLocalizedField(
                              draft.category,
                              locale,
                              event.target.value
                            ),
                          })
                        }
                        placeholder="Home case"
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Location
                      <input
                        value={localizedValue(draft.location, locale)}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            location: writeLocalizedField(
                              draft.location,
                              locale,
                              event.target.value
                            ),
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Type Label
                      <input
                        value={localizedValue(draft.typeLabel, locale)}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            typeLabel: writeLocalizedField(
                              draft.typeLabel,
                              locale,
                              event.target.value
                            ),
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Type Value
                      <input
                        value={localizedValue(draft.typeValue, locale)}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            typeValue: writeLocalizedField(
                              draft.typeValue,
                              locale,
                              event.target.value
                            ),
                          })
                        }
                        className={fieldClass}
                      />
                    </label>
                  </div>

                  <MediaUpload
                    label="Cover Image (1) — detail hero"
                    kind="image"
                    value={draft.image}
                    onChange={(value) =>
                      updateDraft(draft.clientKey, { image: value })
                    }
                    uploadFile={uploadVarsoviaMedia}
                  />

                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-[#5C6370]">
                      Detail gallery — same 10 photos as live /projects/[id]
                    </p>
                    <div className="space-y-2">
                      {draft.gallery.map((url, galleryIndex) => {
                        const slotLabel =
                          SHOWCASE_GALLERY_LABELS[galleryIndex] ||
                          `Gallery image ${galleryIndex + 1}`;
                        return (
                        <div key={`${draft.clientKey}-g-${galleryIndex}`} className="space-y-1">
                          <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                            {slotLabel}
                          </span>
                          <div className="flex gap-2">
                          <input
                            value={url}
                            onChange={(event) => {
                              const next = [...draft.gallery];
                              next[galleryIndex] = event.target.value;
                              updateDraft(draft.clientKey, { gallery: next });
                            }}
                            placeholder="Image URL or upload…"
                            className="min-w-0 flex-1 rounded-lg border border-[#E2E5EA] px-3 py-2 text-sm"
                          />
                          <InlineUploadButton
                            kind="image"
                            onUploaded={(uploaded) => {
                              const next = [...draft.gallery];
                              next[galleryIndex] = uploaded;
                              updateDraft(draft.clientKey, { gallery: next });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...draft.gallery];
                              next[galleryIndex] = "";
                              updateDraft(draft.clientKey, { gallery: next });
                            }}
                            className="rounded-lg px-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50"
                          >
                            Clear
                          </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                    <input
                      type="checkbox"
                      checked={draft.visible}
                      onChange={(event) =>
                        updateDraft(draft.clientKey, {
                          visible: event.target.checked,
                        })
                      }
                    />
                    Visible on website
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const FAQ_TOPICS = [
  "Kitchen Interior",
  "Bedroom Interior",
  "Living Room",
  "Bathroom Interior",
  "Doors & Windows",
  "Furniture",
  "Whole Home",
] as const;

type FaqTopic = (typeof FAQ_TOPICS)[number];

type FaqDraft = {
  clientKey: string;
  _id?: string;
  question: unknown;
  answer: unknown;
  category: unknown;
  visible: boolean;
  order: number;
};

function faqCategoryLabel(category: unknown, locale: LocaleCode = "en"): string {
  const value = localizedValue(category, locale).trim();
  if (value) return value;
  const en = localizedValue(category, "en").trim();
  return en;
}

function resolveFaqTopic(
  category: unknown,
  fallback: FaqTopic = FAQ_TOPICS[0]
): FaqTopic {
  const label = faqCategoryLabel(category, "en");
  if (FAQ_TOPICS.includes(label as FaqTopic)) return label as FaqTopic;
  const match = FAQ_TOPICS.find(
    (topic) => topic.toLowerCase() === label.toLowerCase()
  );
  return match || fallback;
}

function toFaqDraft(
  item?: VarsoviaRecord,
  index = 0,
  fallbackCategory: FaqTopic = FAQ_TOPICS[0]
): FaqDraft {
  if (!item) {
    return {
      clientKey: `faq-new-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      question: emptyLocalized(),
      answer: emptyLocalized(),
      category: emptyLocalized(fallbackCategory),
      visible: true,
      order: index,
    };
  }

  const category = resolveFaqTopic(item.category, fallbackCategory);
  const hasCategoryValue = Boolean(faqCategoryLabel(item.category, "en"));

  return {
    clientKey: item._id || `faq-new-${index}-${Date.now()}`,
    _id: item._id,
    question: item.question ?? emptyLocalized(),
    answer: item.answer ?? emptyLocalized(),
    category: hasCategoryValue
      ? item.category ?? emptyLocalized(category)
      : emptyLocalized(category),
    visible: item.visible !== false,
    order: Number(item.order ?? index) || index,
  };
}

function FaqsInlineEditor({ embedded = false }: { embedded?: boolean }) {
  const [drafts, setDrafts] = useState<FaqDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [activeTopic, setActiveTopic] = useState<FaqTopic>(FAQ_TOPICS[0]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listVarsoviaRecords("faqs");
      setDrafts(rows.map((item, index) => toFaqDraft(item, index)));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const topic of FAQ_TOPICS) counts[topic] = 0;
    for (const draft of drafts) {
      const topic = resolveFaqTopic(draft.category);
      counts[topic] = (counts[topic] || 0) + 1;
    }
    return counts;
  }, [drafts]);

  const topicDrafts = useMemo(
    () =>
      drafts.filter(
        (draft) => resolveFaqTopic(draft.category) === activeTopic
      ),
    [drafts, activeTopic]
  );

  const complete = drafts.length >= 1;

  const updateDraft = (clientKey: string, patch: Partial<FaqDraft>) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.clientKey === clientKey ? { ...item, ...patch } : item
      )
    );
  };

  const addDraft = () => {
    const topic = activeTopic;
    setDrafts((prev) => [
      ...prev,
      {
        clientKey: `faq-new-${topic}-${prev.length}-${Date.now()}`,
        question: emptyLocalized(),
        answer: emptyLocalized(),
        category: emptyLocalized(topic),
        visible: true,
        order: prev.length,
      },
    ]);
  };

  const isFaqBlank = (draft: FaqDraft) =>
    !localizedValue(draft.question, "en").trim() &&
    !localizedValue(draft.answer, "en").trim() &&
    !localizedValue(draft.question, locale).trim() &&
    !localizedValue(draft.answer, locale).trim();

  const ensureEnglishCopy = (value: unknown) => {
    if (localizedValue(value, "en").trim()) return value;
    const fromLocale = localizedValue(value, locale).trim();
    if (!fromLocale) return value;
    return writeLocalizedField(value, "en", fromLocale);
  };

  const selectTopic = (topic: FaqTopic) => {
    // Drop unfinished blank FAQs when leaving a topic so they don't block later saves
    setDrafts((prev) =>
      prev.filter(
        (draft) =>
          draft._id ||
          resolveFaqTopic(draft.category) === topic ||
          !isFaqBlank(draft)
      )
    );
    setActiveTopic(topic);
  };

  const removeDraft = async (draft: FaqDraft) => {
    if (draft._id) {
      if (
        !confirm(
          `Remove "${localizedValue(draft.question, locale) || "FAQ"}"?`
        )
      ) {
        return;
      }
      try {
        await deleteVarsoviaRecord("faqs", draft._id);
        toast.success("FAQ deleted");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      }
    }
    setDrafts((prev) => prev.filter((item) => item.clientKey !== draft.clientKey));
  };

  const saveAll = async (opts?: { quiet?: boolean }) => {
    // Save only the active topic — same pattern as other CMS sections
    const currentDrafts = drafts.filter(
      (draft) => resolveFaqTopic(draft.category) === activeTopic
    );

    // Ignore brand-new blank rows; require Q&A for anything being saved
    const toSave = currentDrafts.filter((draft) => !isFaqBlank(draft) || Boolean(draft._id));

    const invalid = toSave.find((draft) => {
      const question = ensureEnglishCopy(draft.question);
      const answer = ensureEnglishCopy(draft.answer);
      return (
        !localizedValue(question, "en").trim() ||
        !localizedValue(answer, "en").trim()
      );
    });
    if (invalid) {
      toast.error(
        `Fill in question and answer for ${activeTopic} (English required — use the EN tab)`
      );
      setLocale("en");
      throw new Error("validation failed");
    }

    if (toSave.length === 0 && currentDrafts.length === 0) {
      if (!opts?.quiet) toast.message(`No FAQs to save for ${activeTopic}`);
      return;
    }

    try {
      setSaving(true);
      // Keep topic blocks ordered: Kitchen 0–99, Bedroom 100–199, …
      let order = FAQ_TOPICS.indexOf(activeTopic) * 100;

      for (const draft of toSave) {
        const payload = {
          question: ensureEnglishCopy(draft.question),
          answer: ensureEnglishCopy(draft.answer),
          category: activeTopic,
          visible: draft.visible !== false,
          order,
        };
        order += 1;
        if (draft._id) {
          await updateVarsoviaRecord("faqs", draft._id, payload);
        } else {
          await createVarsoviaRecord("faqs", payload);
        }
      }

      // Remove blank new drafts for this topic from local state
      setDrafts((prev) =>
        prev.filter(
          (draft) =>
            !(
              !draft._id &&
              resolveFaqTopic(draft.category) === activeTopic &&
              isFaqBlank(draft)
            )
        )
      );

      if (!opts?.quiet) toast.success(`${activeTopic} FAQs saved`);
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useRegisterSectionSave("faqs", saveAll, embedded);

  const fieldClass =
    "w-full rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]";

  return (
    <section className={embedded ? "space-y-4" : "space-y-5"}>
      <div className={embedded ? "" : "rounded-xl border border-[#E8EAED] bg-white p-5 lg:p-6"}>
        {!embedded ? (
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1A2332]">FAQ Section</h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Frequently asked questions by topic
            </p>
          </div>
          {complete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
              <Check className="h-3.5 w-3.5" />
              Complete
            </span>
          ) : null}
        </div>
        ) : (
          <p className="mb-4 text-sm font-semibold text-[#1A2332]">
            Topics and questions — same as live /faq
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {(["en", "th", "pl"] as LocaleCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                locale === code
                  ? "bg-[#1A2332] text-white"
                  : "bg-[#F3F4F6] text-[#5C6370]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
            <div className="overflow-hidden rounded-xl border border-[#E8EAED]">
              <div className="border-b border-[#E8EAED] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5C6370]">
                  Topic
                </p>
              </div>
              <ul className="divide-y divide-[#F0F1F3]">
                {FAQ_TOPICS.map((topic) => {
                  const selected = activeTopic === topic;
                  const count = topicCounts[topic] || 0;
                  return (
                    <li key={topic}>
                      <button
                        type="button"
                        onClick={() => selectTopic(topic)}
                        className={clsx(
                          "flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors",
                          selected
                            ? "border-l-[3px] border-l-[#1A2332] bg-[#F3F4F6] font-semibold text-[#1A2332]"
                            : "border-l-[3px] border-l-transparent font-medium text-[#5C6370] hover:bg-[#F9FAFB]"
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{topic}</span>
                        <span className="rounded-full bg-[#EEF0F3] px-2 py-0.5 text-[11px] font-semibold text-[#5C6370]">
                          {count}
                        </span>
                        <span className="text-[#9CA3AF]">›</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1A2332]">
                    Questions & Answer
                  </h3>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Editing FAQs for {activeTopic}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add FAQ
                </button>
              </div>

              {topicDrafts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#E2E5EA] px-4 py-8 text-center text-sm text-[#6B7280]">
                  No FAQs in this topic yet. Click Add FAQ to create one.
                </div>
              ) : (
                topicDrafts.map((draft, index) => (
                  <div
                    key={draft.clientKey}
                    className="space-y-3 rounded-xl border border-[#E8EAED] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold tracking-wide text-[#334155]">
                        Question #{index + 1}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-red-600"
                        onClick={() => void removeDraft(draft)}
                      >
                        Remove
                      </button>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                        Question
                      </label>
                      <input
                        type="text"
                        value={localizedValue(draft.question, locale)}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            question: writeLocalizedField(
                              draft.question,
                              locale,
                              event.target.value
                            ),
                          })
                        }
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                        Answer
                      </label>
                      <textarea
                        rows={4}
                        value={localizedValue(draft.answer, locale)}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            answer: writeLocalizedField(
                              draft.answer,
                              locale,
                              event.target.value
                            ),
                          })
                        }
                        className={`${fieldClass} resize-y`}
                      />
                    </div>

                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Category
                      <select
                        value={resolveFaqTopic(draft.category)}
                        onChange={(event) => {
                          const nextTopic = event.target.value as FaqTopic;
                          updateDraft(draft.clientKey, {
                            category: emptyLocalized(nextTopic),
                          });
                          selectTopic(nextTopic);
                        }}
                        className={`${fieldClass} mt-1.5`}
                      >
                        {FAQ_TOPICS.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                      <input
                        type="checkbox"
                        checked={draft.visible}
                        onChange={(event) =>
                          updateDraft(draft.clientKey, {
                            visible: event.target.checked,
                          })
                        }
                      />
                      Visible on website
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!embedded ? (
        <div className="mt-8 flex items-center gap-2 border-t border-[#E8EAED] pt-5">
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243044] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : `Save ${activeTopic}`}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Reload
          </button>
        </div>
        ) : (
          <p className="mt-3 text-[11px] text-[#9CA3AF]">
            Use the top Save button to save questions with this page.
          </p>
        )}
      </div>
    </section>
  );
}

type TestimonialDraft = {
  clientKey: string;
  _id?: string;
  name: unknown;
  role: unknown;
  quote: unknown;
  image: string;
  /** Empty string while the admin clears the field to type a new rating. */
  rating: number | "";
  visible: boolean;
  order: number;
};

function clampTestimonialRating(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

function emptyLocalized(value = "") {
  return { en: value, th: "", pl: "" };
}

function toTestimonialDraft(item?: VarsoviaRecord, index = 0): TestimonialDraft {
  return {
    clientKey: item?._id || `new-${index}-${Date.now()}`,
    _id: item?._id,
    name: item?.name ?? emptyLocalized(),
    role: item?.role ?? emptyLocalized(),
    quote: item?.quote ?? emptyLocalized(),
    image: String(item?.image ?? ""),
    rating: clampTestimonialRating(item?.rating ?? 5),
    visible: item?.visible !== false,
    order: Number(item?.order ?? index) || index,
  };
}

function writeLocalizedField(
  current: unknown,
  locale: LocaleCode,
  value: string
) {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, string>) }
      : {
          en: typeof current === "string" ? current : "",
          th: "",
          pl: "",
        };
  base[locale] = value;
  return base;
}

function TestimonialsInlineEditor({ embedded = false }: { embedded?: boolean }) {
  const [drafts, setDrafts] = useState<TestimonialDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locale, setLocale] = useState<LocaleCode>("en");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listVarsoviaRecords("testimonials");
      setDrafts(rows.map((item, index) => toTestimonialDraft(item, index)));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const complete = drafts.length >= 1;

  const updateDraft = (clientKey: string, patch: Partial<TestimonialDraft>) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.clientKey === clientKey ? { ...item, ...patch } : item
      )
    );
  };

  const addDraft = () => {
    setDrafts((prev) => [
      ...prev,
      toTestimonialDraft(undefined, prev.length),
    ]);
  };

  const removeDraft = async (draft: TestimonialDraft) => {
    if (draft._id) {
      if (!confirm(`Remove "${localizedValue(draft.name, locale) || "testimonial"}"?`)) {
        return;
      }
      try {
        await deleteVarsoviaRecord("testimonials", draft._id);
        toast.success("Testimonial deleted");
      } catch (error) {
        toast.error(errorMessage(error));
        return;
      }
    }
    setDrafts((prev) => prev.filter((item) => item.clientKey !== draft.clientKey));
  };

  const saveAll = async (opts?: { quiet?: boolean }) => {
    const invalid = drafts.some(
      (draft) =>
        !localizedValue(draft.name, "en").trim() ||
        !localizedValue(draft.quote, "en").trim()
    );
    if (invalid) {
      toast.error("Each testimonial needs an English name and quote");
      setLocale("en");
      throw new Error("Testimonials validation failed");
    }

    try {
      setSaving(true);
      for (let index = 0; index < drafts.length; index += 1) {
        const draft = drafts[index];
        const payload = {
          name: draft.name,
          role: draft.role,
          quote: draft.quote,
          image: draft.image,
          rating: clampTestimonialRating(draft.rating),
          visible: draft.visible !== false,
          order: index,
        };
        if (draft._id) {
          await updateVarsoviaRecord("testimonials", draft._id, payload);
        } else {
          await createVarsoviaRecord("testimonials", payload);
        }
      }
      if (!opts?.quiet) toast.success("Testimonials saved");
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  useRegisterSectionSave("testimonials", saveAll, embedded);

  const fieldClass =
    "w-full rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]";

  return (
    <section className={embedded ? "space-y-4" : "space-y-5"}>
      <div className={embedded ? "" : "rounded-xl border border-[#E8EAED] bg-white p-5 lg:p-6"}>
        {!embedded ? (
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1A2332]">Real Stories. Real Spaces.</h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Customer reviews & ratings
            </p>
          </div>
          {complete ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#166534]">
              <Check className="h-3.5 w-3.5" />
              Complete
            </span>
          ) : null}
        </div>
        ) : (
          <p className="mb-4 text-sm font-semibold text-[#1A2332]">Customer reviews</p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {(["en", "th", "pl"] as LocaleCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase ${
                locale === code
                  ? "bg-[#1A2332] text-white"
                  : "bg-[#F3F4F6] text-[#5C6370]"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.clientKey}
                className="space-y-3 rounded-xl border border-[#E8EAED] p-4"
              >
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => void removeDraft(draft)}
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={localizedValue(draft.name, locale)}
                    onChange={(event) =>
                      updateDraft(draft.clientKey, {
                        name: writeLocalizedField(
                          draft.name,
                          locale,
                          event.target.value
                        ),
                      })
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                    Quote
                  </label>
                  <textarea
                    rows={4}
                    value={localizedValue(draft.quote, locale)}
                    onChange={(event) =>
                      updateDraft(draft.clientKey, {
                        quote: writeLocalizedField(
                          draft.quote,
                          locale,
                          event.target.value
                        ),
                      })
                    }
                    className={`${fieldClass} resize-y`}
                  />
                </div>

                <MediaUpload
                  label="Photo"
                  kind="image"
                  value={draft.image}
                  onChange={(value) =>
                    updateDraft(draft.clientKey, { image: value })
                  }
                  uploadFile={uploadVarsoviaMedia}
                />

                <div className="max-w-[140px]">
                  <label className="mb-1.5 block text-xs font-semibold text-[#5C6370]">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    inputMode="numeric"
                    value={
                      typeof draft.rating === "number" && draft.rating >= 1
                        ? draft.rating
                        : ""
                    }
                    onChange={(event) => {
                      const raw = event.target.value;
                      if (raw === "") {
                        updateDraft(draft.clientKey, { rating: "" });
                        return;
                      }
                      const n = Number(raw);
                      if (!Number.isFinite(n)) return;
                      updateDraft(draft.clientKey, {
                        rating: Math.min(5, Math.max(1, Math.round(n))),
                      });
                    }}
                    onBlur={() => {
                      const rating = clampTestimonialRating(draft.rating);
                      if (draft.rating === rating) return;
                      updateDraft(draft.clientKey, { rating });
                    }}
                    className={fieldClass}
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                  <input
                    type="checkbox"
                    checked={draft.visible}
                    onChange={(event) =>
                      updateDraft(draft.clientKey, {
                        visible: event.target.checked,
                      })
                    }
                  />
                  Visible on website
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addDraft}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add testimonial
            </button>
          </div>
        )}

        {!embedded ? (
        <div className="mt-8 flex items-center gap-2 border-t border-[#E8EAED] pt-5">
          <button
            type="button"
            onClick={() => void saveAll()}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243044] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save testimonials"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={saving || loading}
            className="text-sm font-medium text-[#6B7280] underline-offset-2 hover:text-[#DC2626] hover:underline disabled:opacity-60"
          >
            Reload
          </button>
        </div>
        ) : (
          <p className="mt-3 text-[11px] text-[#9CA3AF]">
            Use the top Save button to save testimonials with this section.
          </p>
        )}
      </div>
    </section>
  );
}

export function ResourceManager({
  resource,
  embedded = false,
  fields: fieldsOverride,
}: {
  resource: VarsoviaResource;
  embedded?: boolean;
  fields?: Field[];
}) {
  const config = CONFIGS[resource];
  const fields = fieldsOverride ?? config.fields;
  const [items, setItems] = useState<VarsoviaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VarsoviaRecord | null | undefined>();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [saving, setSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCoverImage, setAiCoverImage] = useState("");
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const card = config.card;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listVarsoviaRecords(resource));
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    setEditing(undefined);
    setQuery("");
    setCategoryFilter("All categories");
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const homeProductRanks = useMemo(
    () => (resource === "products" ? homepageProductRanks(items) : new Map<string, number>()),
    [items, resource]
  );

  const cardCategories = useMemo(() => {
    if (!card) return ["All categories"];
    const set = new Set<string>();
    for (const item of items) {
      const category = localizedValue(getAtPath(item, "category")).trim();
      if (category) set.add(category);
    }
    if (resource === "products") {
      return [
        "All categories",
        PRODUCT_FILTER_HOME,
        PRODUCT_FILTER_LIBRARY,
        ...Array.from(set),
      ];
    }
    return ["All categories", ...Array.from(set)];
  }, [card, items, resource]);

  const cardItems = useMemo(() => {
    if (!card) return items;
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const title = localizedValue(getAtPath(item, config.titleKey)).toLowerCase();
      const description = localizedValue(
        getAtPath(item, card.descriptionKey)
      ).toLowerCase();
      const slug = String(item.slug ?? "").toLowerCase();
      const category = localizedValue(getAtPath(item, "category")).trim();
      const matchesQuery =
        !q ||
        title.includes(q) ||
        description.includes(q) ||
        slug.includes(q) ||
        category.toLowerCase().includes(q);
      const onHome = homeProductRanks.has(String(item._id));
      const matchesCategory =
        categoryFilter === "All categories" ||
        (categoryFilter === PRODUCT_FILTER_HOME && onHome) ||
        (categoryFilter === PRODUCT_FILTER_LIBRARY && !onHome) ||
        category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [card, config.titleKey, items, query, categoryFilter, homeProductRanks]);

  const open = (item?: VarsoviaRecord) => {
    setEditing(item || null);
    if (!item) {
      const homeCount = items.filter(
        (row) => row.visible !== false && row.featured === true
      ).length;
      setForm({
        visible: true,
        ...(resource === "products"
          ? {
              featured: homeCount < HOME_PRODUCT_LIMIT,
              order: Math.min(homeCount + 1, HOME_PRODUCT_LIMIT),
            }
          : resource === "showcases"
            ? {
                category: "Home case",
                typeLabel: { en: "Type", th: "", pl: "" },
                gallery: Array.from({ length: SHOWCASE_GALLERY_SLOTS }, () => ""),
              }
          : fieldsOverride
            ? { featured: true }
            : {}),
      });
    } else {
      const next = normalizeRecord(item);
      // Existing docs may omit `visible` (treated as public). Keep checkbox truthful.
      if (next.visible === undefined) next.visible = true;
      if (resource === "core-strengths" && !next.iconKey) next.iconKey = "eye";
      if (resource === "showcases") {
        const image = String(next.image || "").trim();
        if (!localizedValue(next.typeLabel)) {
          next.typeLabel = { en: "Type", th: "", pl: "" };
        }
        const category = localizedValue(next.category).trim();
        next.category =
          SHOWCASE_CATEGORY_OPTIONS.some((option) => option.value === category)
            ? category
            : "Home case";
        next.gallery = padShowcaseGallery(next.gallery, image);
      }
      setForm(next);
    }
    setLocale("en");
  };

  const updateField = (field: Field, value: unknown) => {
    if (field.localized) {
      const existing = getAtPath(form, field.key);
      const localized: Record<string, unknown> =
        existing && typeof existing === "object" && !Array.isArray(existing)
          ? { ...(existing as Record<string, unknown>) }
          : { en: typeof existing === "string" ? existing : "" };
      localized[locale] = value;
      setForm(setAtPath(form, field.key, localized));
      return;
    }
    setForm(setAtPath(form, field.key, value));
  };

  const save = async () => {
    const requiredMissing = fields.some(
      (field) =>
        field.required &&
        !localizedValue(getAtPath(form, field.key), "en").trim()
    );
    if (requiredMissing) {
      toast.error("Complete all required English fields");
      setLocale("en");
      return;
    }

    const payload = sanitizeRecordMediaUrls(form);
    if (resource === "showcases") {
      payload.gallery = padShowcaseGallery(payload.gallery, payload.image).map((url) =>
        toPublicMediaUrl(url)
      );
      payload.category = localizedValue(payload.category).trim() || "Home case";
    }

    try {
      setSaving(true);
      if (editing?._id) {
        await updateVarsoviaRecord(resource, editing._id, payload);
        toast.success(`${config.singular} updated`);
      } else {
        await createVarsoviaRecord(resource, payload);
        toast.success(`${config.singular} created`);
      }
      setEditing(undefined);
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: VarsoviaRecord) => {
    const title = localizedValue(getAtPath(item, config.titleKey));
    if (!confirm(`Delete "${title || config.singular}"?`)) return;
    try {
      await deleteVarsoviaRecord(resource, item._id);
      toast.success(`${config.singular} deleted`);
      await load();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const generateCoverImage = async () => {
    const topic = aiTopic.trim();
    if (!topic) {
      toast.error("Enter an article topic before generating an image");
      return;
    }

    setAiImageLoading(true);
    try {
      const res = await generateBlogImageWithAI("varsovia-kitchen", { topic });
      if (!res?.success || !res?.image) {
        throw new Error(res?.message || "No image returned from OpenAI");
      }
      setAiCoverImage(res.image);
      toast.success("Cover image generated with AI");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAiImageLoading(false);
    }
  };

  const generateBlogDraft = async () => {
    const topic = aiTopic.trim();
    if (!topic) {
      toast.error("Enter an article topic");
      return;
    }

    setAiLoading(true);
    try {
      const { article } = await generateBlogWithAI("varsovia-kitchen", {
        topic,
      });
      const sections = (article.bodySections || []).map((section) => ({
        heading: { en: section.title || "" },
        text: { en: section.content || "" },
        image: section.image || "",
      }));
      const cover = aiCoverImage.trim() || article.image || "";

      setEditing(null);
      setLocale("en");
      setForm({
        title: { en: article.title || "" },
        excerpt: { en: article.excerpt || "" },
        content: {
          en: sections
            .map((section) => localizedValue(section.text, "en"))
            .filter(Boolean)
            .join("\n\n"),
        },
        category: { en: article.category || "" },
        sections,
        readTime: {
          en: article.readTime
            ? `${article.readTime} min read`
            : "",
        },
        author: {
          name: { en: article.author || "Varsovia Design" },
          avatar: "",
        },
        date: article.publishDate || new Date().toISOString().slice(0, 10),
        image: cover,
        views: 0,
        visible: true,
        order: 0,
      });
      setAiOpen(false);
      setAiTopic("");
      setAiCoverImage("");
      toast.success(
        cover
          ? "Varsovia journal article draft generated with cover image"
          : "Varsovia journal article draft generated"
      );
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <section className={embedded ? "space-y-3" : "space-y-5"}>
      {card ? (
        <>
          {resource === "products" ? (
            <div className="rounded-xl border border-[#C9D9EE] bg-[#F3F7FC] p-4 text-[#1A2332]">
              <p className="text-sm font-semibold">Where this shows on the live site</p>
              <p className="mt-1 text-[12px] text-[#5C6B7A]">
                {homeProductRanks.size} of {HOME_PRODUCT_LIMIT} homepage slots filled.
              </p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[13px] leading-snug text-[#334155]">
                <li>
                  <strong>Home → Our Products</strong> — exactly 3 cards (1 on phones, 2 on
                  tablets, 3 on desktop). Turn on “Show on homepage” and set order 1–3.
                </li>
                <li>
                  <strong>Card click</strong> — opens Interior Design filtered by that card’s
                  category (Kitchen, Bedroom, …).
                </li>
                <li>
                  <strong>Section button</strong> (Explore More) — opens the Interior Design
                  catalogue. Extra cards here are a swap library only; there is no separate
                  products listing page.
                </li>
              </ol>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-[270px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={card.searchPlaceholder}
                  className="h-11 w-full rounded-xl border border-[#E2E5EA] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#1A2332]/15"
                />
              </div>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 min-w-[170px] appearance-none rounded-xl border border-[#E2E5EA] bg-white px-4 pr-9 text-sm outline-none focus:ring-2 focus:ring-[#1A2332]/15"
                >
                  {cardCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {resource === "blogs" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAiCoverImage("");
                    setAiTopic("");
                    setAiOpen(true);
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DDE1E7] bg-white px-4 text-sm font-semibold text-[#1A2332] hover:bg-[#F7F8FA]"
                >
                  <Sparkles size={16} /> Generate with AI
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => open()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1A2332] px-4 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                {card.createLabel}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-[#6B7280]">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cardItems.length === 0 ? (
                <div className="col-span-full rounded-xl border border-[#E8EAED] bg-white p-10 text-center text-[#6B7280]">
                  {card.emptyLabel}
                </div>
              ) : (
                cardItems.map((item) => {
                  const title =
                    localizedValue(getAtPath(item, config.titleKey)) ||
                    `Untitled ${config.singular}`;
                  const description = localizedValue(
                    getAtPath(item, card.descriptionKey)
                  );
                  const category = localizedValue(
                    getAtPath(item, "category")
                  ).trim();
                  const subtitle = card.subtitleKey
                    ? localizedValue(getAtPath(item, card.subtitleKey)).trim()
                    : category
                      ? `${category} ${card.subtitleSuffix ?? ""}`.trim()
                      : "";
                  const image = String(
                    getAtPath(item, card.imageKey) ?? ""
                  ).trim();
                  const homeRank = homeProductRanks.get(String(item._id));
                  return (
                    <article
                      key={item._id}
                      className="overflow-hidden rounded-2xl border border-[#E8EAED] bg-white"
                    >
                      <div className="relative h-40 w-full bg-[#F3F4F6]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolveAdminMediaPreviewUrl(image || "/products/Kitchen1.png")}
                          alt={title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            const el = event.currentTarget;
                            const fallbacks = resolveAdminMediaPreviewFallbacks(
                              image || "/products/Kitchen1.png"
                            );
                            const idx = Number(el.dataset.fb || "0");
                            const next = fallbacks[idx + 1];
                            if (next) {
                              el.dataset.fb = String(idx + 1);
                              el.src = next;
                              return;
                            }
                            if (el.dataset.fallback === "1") return;
                            el.dataset.fallback = "1";
                            el.src = "/products/Kitchen1.png";
                          }}
                        />
                        <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[#475569]">
                          {category || card.fallbackBadge}
                        </span>
                      </div>
                      <div className="space-y-2 p-4">
                        <h3 className="line-clamp-2 text-base font-semibold text-[#1A2332]">
                          {title}
                        </h3>
                        <p className="line-clamp-1 text-sm text-[#64748B]">
                          {subtitle || "—"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#EEF2F7] px-2 py-0.5 text-xs text-[#475569]">
                            {category || "—"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              item.visible === false
                                ? "bg-gray-100 text-gray-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {item.visible === false ? "Hidden" : "Visible"}
                          </span>
                          {resource === "products" ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                homeRank
                                  ? "bg-[#1A2332] text-white"
                                  : item.featured === true
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              {homeRank
                                ? `Homepage ${homeRank}`
                                : item.featured === true
                                  ? "Queued — not in top 3"
                                  : "Library — not on home"}
                            </span>
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-xs text-[#475569]">
                          {description || "—"}
                        </p>
                        <div className="flex justify-end gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => open(item)}
                            className="inline-flex rounded-lg p-2 text-[#1A2332] hover:bg-[#F3F4F6]"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(item)}
                            className="inline-flex rounded-lg p-2 text-[#DC2626] hover:bg-red-50"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{config.label}</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Manage English, Thai and Polish content in Varsovia API.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {resource === "blogs" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAiCoverImage("");
                    setAiTopic("");
                    setAiOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DDE1E7] bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2332] hover:bg-[#F7F8FA]"
                >
                  <Sparkles size={16} /> Generate with AI
                </button>
              ) : null}
              <button
                onClick={() => open()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Add {config.singular}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E5EA] bg-white">
            {loading ? (
              <p className="p-8 text-sm text-[#6B7280]">Loading…</p>
            ) : items.length === 0 ? (
              <p className="p-8 text-sm text-[#6B7280]">
                No {config.label.toLowerCase()} found.
              </p>
            ) : (
              <div className="divide-y divide-[#E8EAED]">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {localizedValue(getAtPath(item, config.titleKey)) ||
                          `Untitled ${config.singular}`}
                      </p>
                      <p className="mt-1 text-xs text-[#8A9099]">
                        {localizedValue(getAtPath(item, "category")).trim() ||
                          localizedValue(getAtPath(item, "location")).trim() ||
                          config.singular}
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          item.visible === false
                            ? "bg-gray-100 text-gray-600"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.visible === false ? "Hidden" : "Visible"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => open(item)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-700"
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => void remove(item)}
                        className="rounded-lg bg-red-50 p-2 text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8EAED] bg-white px-6 py-4">
              <h3 className="font-bold">
                {editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
              </h3>
              <button
                onClick={() => setEditing(undefined)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex gap-2">
                {LOCALES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLocale(item.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      locale === item.id
                        ? "bg-[#1A2332] text-white"
                        : "bg-[#F0F2F5] text-[#5C6370]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => {
                  if (field.type === "section-divider") {
                    return (
                      <FieldControl
                        key={field.key}
                        field={field}
                        value={null}
                        locale={locale}
                        onChange={() => undefined}
                      />
                    );
                  }
                  if (field.localized === true) {
                    const value = localizedValue(
                      getAtPath(form, field.key),
                      locale,
                      { strict: true }
                    );
                    return (
                      <FieldControl
                        key={`${field.key}-${locale}`}
                        field={field}
                        value={value}
                        locale={locale}
                        onChange={(value) => updateField(field, value)}
                      />
                    );
                  }

                  const structured =
                    field.type === "string-list" ||
                    field.type === "localized-string-list" ||
                    field.type === "stats-list" ||
                    field.type === "process-list" ||
                    field.type === "faq-list" ||
                    field.type === "showcase-meta-list" ||
                    field.type === "tool-list" ||
                    field.type === "spec-list" ||
                    field.type === "content-sections" ||
                    field.type === "strength-list" ||
                    field.type === "office-list" ||
                    field.type === "search-page-list" ||
                    field.type === "footer-nav" ||
                    field.type === "main-nav" ||
                    field.type === "inquiry-form" ||
                    field.type === "ia-children-list";
                  const raw = getAtPath(form, field.key);
                  const value = structured
                    ? raw
                    : field.type === "json"
                      ? raw === undefined
                        ? ""
                        : typeof raw === "string"
                          ? raw
                          : JSON.stringify(raw, null, 2)
                      : raw;
                  return (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={value}
                      locale={locale}
                      onChange={(value) => {
                        if (field.type !== "json") {
                          updateField(field, value);
                          return;
                        }
                        try {
                          updateField(
                            field,
                            String(value).trim() ? JSON.parse(String(value)) : []
                          );
                        } catch {
                          updateField(field, value);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#E8EAED] bg-white px-6 py-4">
              <button
                onClick={() => setEditing(undefined)}
                className="rounded-lg border border-[#DDE1E7] px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => void save()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resource === "blogs" && aiOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg max-h-[90vh] space-y-4 overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#1A2332]">
                  Generate with AI
                </h3>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Enter a topic, optionally generate or upload a cover image,
                  then draft the full journal article.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (aiLoading || aiImageLoading) return;
                  setAiOpen(false);
                  setAiCoverImage("");
                }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-xs font-semibold text-[#5C6370]">
              Article topic
              <input
                value={aiTopic}
                onChange={(event) => setAiTopic(event.target.value)}
                placeholder="e.g. Timeless modular kitchens for luxury homes"
                disabled={aiLoading || aiImageLoading}
                autoFocus
                className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
              />
            </label>

            <div className="space-y-3 rounded-xl border border-[#E8EAED] bg-[#FAFBFC] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                  Cover image
                </p>
                <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                  Generate a widescreen cover with AI, or upload your own below.
                </p>
              </div>
              <button
                type="button"
                disabled={aiLoading || aiImageLoading || !aiTopic.trim()}
                onClick={() => void generateCoverImage()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {aiImageLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {aiImageLoading ? "Generating image…" : "Generate Image"}
              </button>
              {aiCoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aiCoverImage}
                  alt="AI cover preview"
                  className="h-36 w-full rounded-lg border border-[#E8EAED] object-cover bg-white"
                />
              ) : null}
              <p className="text-center text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">
                or upload manually
              </p>
              <MediaUpload
                label="Upload cover image"
                kind="image"
                value={aiCoverImage}
                onChange={setAiCoverImage}
                hint="PNG, JPG, JPEG, GIF, WEBP (Max 10MB)"
                uploadFile={uploadVarsoviaMedia}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={aiLoading || aiImageLoading}
                onClick={() => {
                  setAiOpen(false);
                  setAiCoverImage("");
                }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={aiLoading || aiImageLoading}
                onClick={() => void generateBlogDraft()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {aiLoading ? "Generating…" : "Generate article"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FieldControl({
  field,
  value,
  locale = "en",
  onChange,
}: {
  field: Field;
  value: unknown;
  locale?: LocaleCode;
  onChange: (value: unknown) => void;
}) {
  if (field.type === "section-divider") {
    return (
      <div className="md:col-span-2 mt-2 rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] px-4 py-3">
        <p className="text-sm font-semibold text-[#1A2332]">{field.label}</p>
        {field.helpText ? (
          <p className="mt-1 text-[11px] leading-snug text-[#6B7280]">{field.helpText}</p>
        ) : null}
      </div>
    );
  }

  if (field.type === "embedded-resource") {
    return null;
  }

  if (field.type === "ia-children-list") {
    return (
      <IaChildrenListEditor
        value={value}
        onChange={onChange}
        locale={locale}
        hubKey={field.iaHubKey || "furniture"}
      />
    );
  }

  const items = Array.isArray(value) ? value : [];
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const setEntryLocalized = (
    entry: Record<string, unknown>,
    key: string,
    nextValue: string
  ) => {
    const existing = entry[key];
    const localized: Record<string, unknown> =
      existing && typeof existing === "object" && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>) }
        : { en: typeof existing === "string" ? existing : "" };
    localized[locale] = nextValue;
    return { ...entry, [key]: localized };
  };

  if (field.type === "string-list") {
    const labels = field.listLabels || [];
    const minItems = field.minItems ?? labels.length;
    const strings = items.map((item) => String(item ?? ""));
    while (strings.length < minItems) strings.push("");
    const fixedList = field.fixedList === true;
    const canRemove = (index: number) =>
      !fixedList && (minItems > 0 ? strings.length > minItems : true);
    const moveString = (index: number, direction: -1 | 1) => {
      if (fixedList) return;
      const target = index + direction;
      if (target < 0 || target >= strings.length) return;
      const next = [...strings];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    };

    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-2">
          {strings.map((item, index) => (
            <div key={index} className="space-y-1">
              {field.media === "image" || field.media === "icon" ? (
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <MediaUpload
                      label={labels[index] || `Image ${index + 1}`}
                      kind={field.media}
                      value={item}
                      onChange={(url) =>
                        onChange(
                          strings.map((current, itemIndex) =>
                            itemIndex === index ? url : current
                          )
                        )
                      }
                      uploadFile={uploadVarsoviaMedia}
                      previewSize="md"
                      clearable
                    />
                  </div>
                  {fixedList ? null : (
                  <div className="pt-7">
                    <ListButtons
                      index={index}
                      length={strings.length}
                      onMove={moveString}
                      onRemove={() => {
                        if (!canRemove(index)) {
                          onChange(
                            strings.map((current, itemIndex) =>
                              itemIndex === index ? "" : current
                            )
                          );
                          return;
                        }
                        onChange(strings.filter((_, i) => i !== index));
                      }}
                    />
                  </div>
                  )}
                </div>
              ) : (
                <>
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                    {labels[index] || `Image ${index + 1}`}
                  </span>
                  <div className="flex gap-2">
                    <input
                      value={item}
                      onChange={(event) =>
                        onChange(
                          strings.map((current, itemIndex) =>
                            itemIndex === index ? event.target.value : current
                          )
                        )
                      }
                      placeholder={
                        field.media === "pdf"
                          ? "PDF URL or upload…"
                          : "Image URL or upload…"
                      }
                      className="min-w-0 flex-1 rounded-lg border border-[#DDE1E7] px-3.5 py-2.5 text-sm outline-none focus:border-[#1A2332]"
                    />
                    {field.media ? (
                      <InlineUploadButton
                        kind={field.media}
                        onUploaded={(url) =>
                          onChange(
                            strings.map((current, itemIndex) =>
                              itemIndex === index ? url : current
                            )
                          )
                        }
                      />
                    ) : null}
                    {fixedList ? null : (
                    <ListButtons
                      index={index}
                      length={strings.length}
                      onMove={moveString}
                      onRemove={() => {
                        if (!canRemove(index)) {
                          onChange(
                            strings.map((current, itemIndex) =>
                              itemIndex === index ? "" : current
                            )
                          );
                          return;
                        }
                        onChange(strings.filter((_, i) => i !== index));
                      }}
                    />
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          {fixedList ? null : (
          <button
            type="button"
            onClick={() => onChange([...strings, ""])}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add item
          </button>
          )}
        </div>
      </div>
    );
  }

  if (field.type === "localized-string-list") {
    const itemKey = field.itemKey;
    const unwrap = (item: unknown) =>
      itemKey && item && typeof item === "object" && !Array.isArray(item)
        ? (item as Record<string, unknown>)[itemKey]
        : item;
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={localizedValue(unwrap(item), locale)}
                onChange={(event) => {
                  const inner = unwrap(item);
                  const current: Record<string, unknown> =
                    inner && typeof inner === "object" && !Array.isArray(inner)
                      ? { ...(inner as Record<string, unknown>) }
                      : { en: typeof inner === "string" ? inner : "" };
                  current[locale] = event.target.value;
                  const next = itemKey ? { [itemKey]: current } : current;
                  onChange(
                    items.map((entry, itemIndex) =>
                      itemIndex === index ? next : entry
                    )
                  );
                }}
                placeholder={`Feature (${locale.toUpperCase()})`}
                className="min-w-0 flex-1 rounded-lg border border-[#DDE1E7] px-3.5 py-2.5 text-sm outline-none focus:border-[#1A2332]"
              />
              <ListButtons
                index={index}
                length={items.length}
                onMove={move}
                onRemove={() => onChange(items.filter((_, i) => i !== index))}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([...items, itemKey ? { [itemKey]: { en: "" } } : { en: "" }])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add feature
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "spec-list") {
    const specs = items.map((item) =>
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {specs.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">
                  Specification {index + 1}
                </span>
                <ListButtons
                  index={index}
                  length={specs.length}
                  onMove={move}
                  onRemove={() => onChange(specs.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Label"
                  value={localizedValue(entry.label, locale)}
                  onChange={(next) =>
                    onChange(
                      specs.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "label", next)
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Value"
                  value={localizedValue(entry.value, locale)}
                  onChange={(next) =>
                    onChange(
                      specs.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "value", next)
                          : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([...specs, { label: { en: "" }, value: { en: "" } }])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add specification
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "content-sections") {
    const sections = items.map((item) =>
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {sections.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">
                  Section {index + 1}
                </span>
                <ListButtons
                  index={index}
                  length={sections.length}
                  onMove={move}
                  onRemove={() =>
                    onChange(sections.filter((_, i) => i !== index))
                  }
                />
              </div>
              <div className="grid gap-3">
                <SmallInput
                  label="Heading"
                  value={localizedValue(entry.heading, locale)}
                  onChange={(next) =>
                    onChange(
                      sections.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "heading", next)
                          : current
                      )
                    )
                  }
                />
                <label>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
                    Text
                  </span>
                  <textarea
                    rows={4}
                    value={localizedValue(entry.text, locale)}
                    onChange={(event) =>
                      onChange(
                        sections.map((current, i) =>
                          i === index
                            ? setEntryLocalized(current, "text", event.target.value)
                            : current
                        )
                      )
                    }
                    className="w-full rounded-lg border border-[#DDE1E7] px-3 py-2 text-sm outline-none focus:border-[#1A2332]"
                  />
                </label>
                <SmallInput
                  label={`Section ${index + 1} — Image`}
                  value={String(entry.image ?? "")}
                  media="image"
                  onChange={(next) =>
                    onChange(
                      sections.map((current, i) =>
                        i === index ? { ...current, image: next } : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...sections,
                {
                  heading: { en: "" },
                  text: { en: "" },
                  image: "",
                  imagePosition: sections.length % 2 === 0 ? "left" : "right",
                },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add content section
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "strength-list") {
    const strengths = items.map((item) =>
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {strengths.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">
                  Strength {index + 1}
                </span>
                <ListButtons
                  index={index}
                  length={strengths.length}
                  onMove={move}
                  onRemove={() =>
                    onChange(strengths.filter((_, i) => i !== index))
                  }
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Title"
                  value={localizedValue(entry.title, locale)}
                  onChange={(next) =>
                    onChange(
                      strengths.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "title", next)
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Icon (eye, ruler, users, box, shield, pen)"
                  value={String(entry.icon ?? "")}
                  onChange={(next) =>
                    onChange(
                      strengths.map((current, i) =>
                        i === index ? { ...current, icon: next } : current
                      )
                    )
                  }
                />
                <label className="md:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
                    Description
                  </span>
                  <textarea
                    rows={3}
                    value={localizedValue(entry.description, locale)}
                    onChange={(event) =>
                      onChange(
                        strengths.map((current, i) =>
                          i === index
                            ? setEntryLocalized(
                                current,
                                "description",
                                event.target.value
                              )
                            : current
                        )
                      )
                    }
                    className="w-full rounded-lg border border-[#DDE1E7] px-3 py-2 text-sm outline-none focus:border-[#1A2332]"
                  />
                </label>
                <div className="md:col-span-2">
                  <SmallInput
                    label="Image URL"
                    value={String(entry.image ?? "")}
                    media="image"
                    onChange={(next) =>
                      onChange(
                        strengths.map((current, i) =>
                          i === index ? { ...current, image: next } : current
                        )
                      )
                    }
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...strengths,
                {
                  title: { en: "" },
                  description: { en: "" },
                  image: "",
                  icon: "eye",
                },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add strength
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "stats-list") {
    const stats = items.map((item) =>
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {stats.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">Statistic {index + 1}</span>
                <ListButtons
                  index={index}
                  length={stats.length}
                  onMove={move}
                  onRemove={() => onChange(stats.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <SmallInput
                  label="Value"
                  numeric
                  hint="Numbers only (e.g. 12). Put + in Suffix."
                  value={localizedValue(entry.value, locale).replace(/[^\d]/g, "")}
                  onChange={(next) =>
                    onChange(
                      stats.map((current, i) => {
                        if (i !== index) return current;
                        const suffix = localizedValue(current.value, locale).replace(/\d/g, "");
                        return setEntryLocalized(current, "value", `${suffix}${next}`);
                      })
                    )
                  }
                />
                <SmallInput
                  label="Suffix"
                  hint="Optional. e.g. +"
                  value={localizedValue(entry.value, locale).replace(/\d/g, "")}
                  onChange={(next) =>
                    onChange(
                      stats.map((current, i) => {
                        if (i !== index) return current;
                        const digits = localizedValue(current.value, locale).replace(/[^\d]/g, "");
                        return setEntryLocalized(current, "value", `${next}${digits}`);
                      })
                    )
                  }
                />
                <SmallInput
                  label="Label"
                  value={localizedValue(entry.label, locale)}
                  onChange={(next) =>
                    onChange(
                      stats.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "label", next)
                          : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([...stats, { value: { en: "" }, label: { en: "" } }])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add statistic
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "process-list") {
    const steps = items.map((item) =>
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {steps.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">Step {index + 1}</span>
                <ListButtons
                  index={index}
                  length={steps.length}
                  onMove={move}
                  onRemove={() => onChange(steps.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Step Number"
                  value={String(entry.step ?? "")}
                  onChange={(next) =>
                    onChange(
                      steps.map((current, i) =>
                        i === index ? { ...current, step: next } : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Title"
                  value={localizedValue(entry.title, locale)}
                  onChange={(next) =>
                    onChange(
                      steps.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "title", next)
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Icon / image URL"
                  value={String(entry.icon ?? entry.image ?? "")}
                  media="image"
                  onChange={(next) =>
                    onChange(
                      steps.map((current, i) =>
                        i === index ? { ...current, icon: next, image: undefined } : current
                      )
                    )
                  }
                />
                <label className="md:col-span-2">
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
                    Text
                  </span>
                  <textarea
                    rows={3}
                    value={localizedValue(entry.text, locale)}
                    onChange={(event) =>
                      onChange(
                        steps.map((current, i) =>
                          i === index
                            ? setEntryLocalized(current, "text", event.target.value)
                            : current
                        )
                      )
                    }
                    className="w-full rounded-lg border border-[#DDE1E7] px-3 py-2 text-sm outline-none focus:border-[#1A2332]"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...steps,
                { step: "", title: { en: "" }, text: { en: "" }, icon: "" },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add process step
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "faq-list") {
    const faqs = items.map((item) =>
      item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {faqs.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">FAQ {index + 1}</span>
                <ListButtons
                  index={index}
                  length={faqs.length}
                  onMove={move}
                  onRemove={() => onChange(faqs.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3">
                <SmallInput
                  label="Question"
                  value={localizedValue(entry.question, locale)}
                  onChange={(next) =>
                    onChange(
                      faqs.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "question", next)
                          : current
                      )
                    )
                  }
                />
                <label>
                  <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
                    Answer
                  </span>
                  <textarea
                    rows={3}
                    value={localizedValue(entry.answer, locale)}
                    onChange={(event) =>
                      onChange(
                        faqs.map((current, i) =>
                          i === index
                            ? setEntryLocalized(current, "answer", event.target.value)
                            : current
                        )
                      )
                    }
                    className="w-full rounded-lg border border-[#DDE1E7] px-3 py-2 text-sm outline-none focus:border-[#1A2332]"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([...faqs, { question: { en: "" }, answer: { en: "" } }])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add FAQ
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "showcase-meta-list") {
    const rows = items.map((item) =>
      item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {rows.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">Tab {index + 1}</span>
                <ListButtons
                  index={index}
                  length={rows.length}
                  onMove={move}
                  onRemove={() => onChange(rows.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Tab Key"
                  value={String(entry.tabKey ?? "")}
                  onChange={(next) =>
                    onChange(
                      rows.map((current, i) =>
                        i === index ? { ...current, tabKey: next } : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Order"
                  value={String(entry.order ?? index)}
                  onChange={(next) =>
                    onChange(
                      rows.map((current, i) =>
                        i === index
                          ? { ...current, order: Number(next) || 0 }
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Title"
                  value={localizedValue(entry.title, locale)}
                  onChange={(next) =>
                    onChange(
                      rows.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "title", next)
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Subtitle"
                  value={localizedValue(entry.subtitle, locale)}
                  onChange={(next) =>
                    onChange(
                      rows.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "subtitle", next)
                          : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...rows,
                {
                  tabKey: "",
                  title: { en: "" },
                  subtitle: { en: "" },
                  order: rows.length,
                },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add showcase tab
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "office-list") {
    const offices = items.map((item) =>
      item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {offices.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">Office {index + 1}</span>
                <ListButtons
                  index={index}
                  length={offices.length}
                  onMove={move}
                  onRemove={() => onChange(offices.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Label"
                  value={localizedValue(entry.label, locale)}
                  onChange={(next) =>
                    onChange(
                      offices.map((current, i) =>
                        i === index ? setEntryLocalized(current, "label", next) : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Address"
                  value={String(entry.address ?? "")}
                  onChange={(next) =>
                    onChange(
                      offices.map((current, i) =>
                        i === index ? { ...current, address: next } : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([...offices, { label: { en: "" }, address: "" }])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add office
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "search-page-list") {
    const pages = items.map((item) =>
      item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {pages.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">Page {index + 1}</span>
                <ListButtons
                  index={index}
                  length={pages.length}
                  onMove={move}
                  onRemove={() => onChange(pages.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Title"
                  value={localizedValue(entry.title, locale)}
                  onChange={(next) =>
                    onChange(
                      pages.map((current, i) =>
                        i === index ? setEntryLocalized(current, "title", next) : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Link"
                  value={String(entry.href ?? "")}
                  onChange={(next) =>
                    onChange(
                      pages.map((current, i) =>
                        i === index ? { ...current, href: next } : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Description"
                  value={localizedValue(entry.description, locale)}
                  onChange={(next) =>
                    onChange(
                      pages.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "description", next)
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Order"
                  value={String(entry.order ?? index)}
                  onChange={(next) =>
                    onChange(
                      pages.map((current, i) =>
                        i === index ? { ...current, order: Number(next) || 0 } : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...pages,
                { title: { en: "" }, description: { en: "" }, href: "", order: pages.length },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add search page
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "main-nav") {
    const nav =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : { version: 3, items: [] };
    const items = Array.isArray(nav.items)
      ? (nav.items as Record<string, unknown>[])
      : [];

    const patchNav = (partial: Record<string, unknown>) =>
      onChange({ version: nav.version ?? 3, ...nav, ...partial });

    const emptyItem = (): Record<string, unknown> => ({
      id: `item-${items.length + 1}-${Date.now()}`,
      label: { en: "" },
      href: "/",
      menuKind: "none",
      enabled: true,
      order: items.length + 1,
    });

    const updateItem = (
      index: number,
      updater: (current: Record<string, unknown>) => Record<string, unknown>
    ) =>
      patchNav({
        items: items.map((current, i) => (i === index ? updater(current) : current)),
      });

    const updateMenuLinks = (
      index: number,
      updater: (links: Record<string, unknown>[]) => Record<string, unknown>[]
    ) =>
      updateItem(index, (current) => {
        const curMenu =
          current.menu && typeof current.menu === "object"
            ? (current.menu as Record<string, unknown>)
            : {};
        const curLinks = Array.isArray(curMenu.links)
          ? (curMenu.links as Record<string, unknown>[])
          : [];
        return { ...current, menu: { ...curMenu, links: updater(curLinks) } };
      });

    return (
      <div className="md:col-span-2 space-y-4">
        <FieldLabel field={field} />
        <p className="mb-1 text-xs text-[#6B7280]">
          These are the top header buttons on the live Varsovia site. Add, remove,
          rename, or turn any button off here. If a button has its own dropdown
          menu, its sub-links are listed underneath it — edit those the same way.
          Changes here go live on varsovia.design as soon as you save.
        </p>

        {items.map((item, index) => {
          const menu =
            item.menu && typeof item.menu === "object"
              ? (item.menu as Record<string, unknown>)
              : null;
          const menuLinks =
            menu && Array.isArray(menu.links)
              ? (menu.links as Record<string, unknown>[])
              : [];
          const hasMenu = Boolean(item.menuKind) && item.menuKind !== "none";

          return (
            <div
              key={item.id ? String(item.id) : index}
              className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="grid flex-1 gap-3 md:grid-cols-3">
                  <SmallInput
                    label="Button label"
                    value={localizedValue(item.label, locale)}
                    onChange={(next) =>
                      updateItem(index, (current) =>
                        setEntryLocalized(current, "label", next)
                      )
                    }
                  />
                  <SmallInput
                    label="Link"
                    value={String(item.href ?? "")}
                    onChange={(next) =>
                      updateItem(index, (current) => ({ ...current, href: next }))
                    }
                  />
                  <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-[#5C6370]">
                    <input
                      type="checkbox"
                      checked={item.enabled !== false}
                      onChange={(event) =>
                        updateItem(index, (current) => ({
                          ...current,
                          enabled: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-[#1A2332]"
                    />
                    Shown
                  </label>
                </div>
                <ListButtons
                  index={index}
                  length={items.length}
                  onMove={(from, direction) => {
                    const target = from + direction;
                    if (target < 0 || target >= items.length) return;
                    const next = [...items];
                    [next[from], next[target]] = [next[target], next[from]];
                    patchNav({
                      items: next.map((entry, i) => ({ ...entry, order: i + 1 })),
                    });
                  }}
                  onRemove={() =>
                    patchNav({
                      items: items
                        .filter((_, i) => i !== index)
                        .map((entry, i) => ({ ...entry, order: i + 1 })),
                    })
                  }
                />
              </div>

              {hasMenu ? (
                <div className="ml-1 space-y-2 border-l-2 border-[#E2E5EA] pl-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Dropdown links under &quot;{localizedValue(item.label, "en") || "this button"}&quot;
                  </p>
                  {menuLinks.map((link, linkIndex) => (
                    <div
                      key={linkIndex}
                      className="grid gap-2 rounded-lg border border-[#E8EAED] bg-white p-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <SmallInput
                        label="Title"
                        value={localizedValue(link.title, locale)}
                        onChange={(next) =>
                          updateMenuLinks(index, (links) =>
                            links.map((l, li) =>
                              li === linkIndex ? setEntryLocalized(l, "title", next) : l
                            )
                          )
                        }
                      />
                      <SmallInput
                        label="Link"
                        value={String(link.href ?? "")}
                        onChange={(next) =>
                          updateMenuLinks(index, (links) =>
                            links.map((l, li) =>
                              li === linkIndex ? { ...l, href: next } : l
                            )
                          )
                        }
                      />
                      <div className="flex items-end pb-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateMenuLinks(index, (links) =>
                              links.filter((_, li) => li !== linkIndex)
                            )
                          }
                          className="text-xs text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateMenuLinks(index, (links) => [
                        ...links,
                        { title: { en: "" }, subtitle: { en: "" }, href: "" },
                      ])
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
                  >
                    <Plus size={14} /> Add dropdown link
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => patchNav({ items: [...items, emptyItem()] })}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
        >
          <Plus size={14} /> Add nav button
        </button>
      </div>
    );
  }

  if (field.type === "footer-nav") {
    const nav =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : { version: 1 };
    const linkColumns = Array.isArray(nav.linkColumns)
      ? (nav.linkColumns as Record<string, unknown>[])
      : [];
    const legalLinks = Array.isArray(nav.legalLinks)
      ? (nav.legalLinks as Record<string, unknown>[])
      : [];
    const contactLabels =
      nav.contactLabels && typeof nav.contactLabels === "object"
        ? (nav.contactLabels as Record<string, unknown>)
        : {};
    const socialLabels =
      nav.socialLabels && typeof nav.socialLabels === "object"
        ? (nav.socialLabels as Record<string, unknown>)
        : {};

    const patchNav = (partial: Record<string, unknown>) =>
      onChange({ version: 1, ...nav, ...partial });

    const emptyLink = () => ({
      label: { en: "" },
      href: "",
      enabled: true,
    });

    const renderLinkEditor = (
      links: Record<string, unknown>[],
      onLinksChange: (next: Record<string, unknown>[]) => void,
      addLabel: string
    ) => (
      <div className="space-y-2">
        {links.map((link, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-lg border border-[#E8EAED] bg-white p-3 md:grid-cols-[1fr_1fr_auto_auto]"
          >
            <SmallInput
              label="Label"
              value={localizedValue(link.label, locale)}
              onChange={(next) =>
                onLinksChange(
                  links.map((current, i) =>
                    i === index ? setEntryLocalized(current, "label", next) : current
                  )
                )
              }
            />
            <SmallInput
              label="Link"
              value={String(link.href ?? "")}
              onChange={(next) =>
                onLinksChange(
                  links.map((current, i) =>
                    i === index ? { ...current, href: next } : current
                  )
                )
              }
            />
            <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-[#5C6370]">
              <input
                type="checkbox"
                checked={link.enabled !== false}
                onChange={(event) =>
                  onLinksChange(
                    links.map((current, i) =>
                      i === index
                        ? { ...current, enabled: event.target.checked }
                        : current
                    )
                  )
                }
                className="h-4 w-4 accent-[#1A2332]"
              />
              On
            </label>
            <div className="flex items-end pb-1">
              <ListButtons
                index={index}
                length={links.length}
                onMove={(from, direction) => {
                  const target = from + direction;
                  if (target < 0 || target >= links.length) return;
                  const next = [...links];
                  [next[from], next[target]] = [next[target], next[from]];
                  onLinksChange(next);
                }}
                onRemove={() => onLinksChange(links.filter((_, i) => i !== index))}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onLinksChange([...links, emptyLink()])}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
        >
          <Plus size={14} /> {addLabel}
        </button>
      </div>
    );

    return (
      <div className="md:col-span-2 space-y-5">
        <FieldLabel field={field} />

        <div className="grid gap-3 md:grid-cols-2">
          <SmallInput
            label="Contact heading"
            value={localizedValue(nav.contactHeading, locale)}
            onChange={(next) =>
              patchNav(setEntryLocalized(nav, "contactHeading", next))
            }
          />
          <SmallInput
            label="Copyright (use {year} for current year)"
            value={localizedValue(nav.copyright, locale)}
            onChange={(next) => patchNav(setEntryLocalized(nav, "copyright", next))}
          />
          <SmallInput
            label="Email label"
            value={localizedValue(contactLabels.email, locale)}
            onChange={(next) =>
              patchNav({
                contactLabels: setEntryLocalized(contactLabels, "email", next),
              })
            }
          />
          <SmallInput
            label="Mobile / WhatsApp label"
            value={localizedValue(contactLabels.mobileWhatsapp, locale)}
            onChange={(next) =>
              patchNav({
                contactLabels: setEntryLocalized(
                  contactLabels,
                  "mobileWhatsapp",
                  next
                ),
              })
            }
          />
          <SmallInput
            label="Contact number label"
            value={localizedValue(contactLabels.contactNumber, locale)}
            onChange={(next) =>
              patchNav({
                contactLabels: setEntryLocalized(
                  contactLabels,
                  "contactNumber",
                  next
                ),
              })
            }
          />
          <SmallInput
            label="WhatsApp social label"
            value={localizedValue(socialLabels.whatsapp, locale)}
            onChange={(next) =>
              patchNav({
                socialLabels: setEntryLocalized(socialLabels, "whatsapp", next),
              })
            }
          />
          <SmallInput
            label="Facebook social label"
            value={localizedValue(socialLabels.facebook, locale)}
            onChange={(next) =>
              patchNav({
                socialLabels: setEntryLocalized(socialLabels, "facebook", next),
              })
            }
          />
          <SmallInput
            label="Instagram social label"
            value={localizedValue(socialLabels.instagram, locale)}
            onChange={(next) =>
              patchNav({
                socialLabels: setEntryLocalized(socialLabels, "instagram", next),
              })
            }
          />
          <SmallInput
            label="X (Twitter) social label"
            value={localizedValue(socialLabels.x, locale)}
            onChange={(next) =>
              patchNav({
                socialLabels: setEntryLocalized(socialLabels, "x", next),
              })
            }
          />
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5C6370]">
            Link columns
          </p>
          {linkColumns.map((column, columnIndex) => {
            const links = Array.isArray(column.links)
              ? (column.links as Record<string, unknown>[])
              : [];
            return (
              <div
                key={columnIndex}
                className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <SmallInput
                      label="Column ID"
                      value={String(column.id ?? "")}
                      onChange={(next) =>
                        patchNav({
                          linkColumns: linkColumns.map((current, i) =>
                            i === columnIndex ? { ...current, id: next } : current
                          ),
                        })
                      }
                    />
                    <SmallInput
                      label="Order"
                      value={String(column.order ?? columnIndex + 1)}
                      onChange={(next) =>
                        patchNav({
                          linkColumns: linkColumns.map((current, i) =>
                            i === columnIndex
                              ? { ...current, order: Number(next) || 0 }
                              : current
                          ),
                        })
                      }
                    />
                    <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-[#5C6370]">
                      <input
                        type="checkbox"
                        checked={column.enabled !== false}
                        onChange={(event) =>
                          patchNav({
                            linkColumns: linkColumns.map((current, i) =>
                              i === columnIndex
                                ? { ...current, enabled: event.target.checked }
                                : current
                            ),
                          })
                        }
                        className="h-4 w-4 accent-[#1A2332]"
                      />
                      Column enabled
                    </label>
                  </div>
                  <ListButtons
                    index={columnIndex}
                    length={linkColumns.length}
                    onMove={(from, direction) => {
                      const target = from + direction;
                      if (target < 0 || target >= linkColumns.length) return;
                      const next = [...linkColumns];
                      [next[from], next[target]] = [next[target], next[from]];
                      patchNav({ linkColumns: next });
                    }}
                    onRemove={() =>
                      patchNav({
                        linkColumns: linkColumns.filter((_, i) => i !== columnIndex),
                      })
                    }
                  />
                </div>
                {renderLinkEditor(
                  links,
                  (nextLinks) =>
                    patchNav({
                      linkColumns: linkColumns.map((current, i) =>
                        i === columnIndex ? { ...current, links: nextLinks } : current
                      ),
                    }),
                  "Add link"
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              patchNav({
                linkColumns: [
                  ...linkColumns,
                  {
                    id: `column-${linkColumns.length + 1}`,
                    order: linkColumns.length + 1,
                    enabled: true,
                    links: [emptyLink()],
                  },
                ],
              })
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add column
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5C6370]">
            Legal links
          </p>
          {renderLinkEditor(
            legalLinks,
            (nextLinks) => patchNav({ legalLinks: nextLinks }),
            "Add legal link"
          )}
        </div>
      </div>
    );
  }

  if (field.type === "inquiry-form") {
    const defaultForm =
      (VARSOVIA_SITE_DEFAULTS.inquiryForm as Record<string, unknown>) || {};
    const form: Record<string, unknown> =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : structuredClone(defaultForm);
    const formFields = (
      Array.isArray(form.fields) ? form.fields : []
    ).map((item) =>
      item && typeof item === "object"
        ? (item as Record<string, unknown>)
        : {}
    );
    const inquiryFieldTypes = [
      "name",
      "text",
      "email",
      "phone",
      "whatsapp",
      "textarea",
      "select",
      "place",
    ] as const;

    const patchForm = (next: Record<string, unknown>) => onChange(next);
    const patchFields = (nextFields: Record<string, unknown>[]) =>
      patchForm({
        ...form,
        version: form.version ?? 1,
        fields: nextFields.map((entry, index) => ({
          ...entry,
          order: index + 1,
        })),
      });
    const updateFieldAt = (
      index: number,
      updater: (current: Record<string, unknown>) => Record<string, unknown>
    ) =>
      patchFields(
        formFields.map((current, i) => (i === index ? updater(current) : current))
      );
    const moveField = (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= formFields.length) return;
      const next = [...formFields];
      [next[index], next[target]] = [next[target], next[index]];
      patchFields(next);
    };

    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <p className="mb-3 text-xs text-[#6B7280]">
          Labels and placeholders match the website contact / catalogue form.
          Switch language tabs above to edit Thai or Polish copy.
        </p>
        <div className="mb-4 rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
          <SmallInput
            label="Submit button label"
            value={localizedValue(form.submitLabel, locale)}
            onChange={(next) =>
              patchForm(setEntryLocalized(form, "submitLabel", next))
            }
          />
        </div>
        <div className="space-y-3">
          {formFields.map((entry, index) => {
            const options = Array.isArray(entry.options)
              ? entry.options.map((opt) =>
                  opt && typeof opt === "object"
                    ? (opt as Record<string, unknown>)
                    : {}
                )
              : [];
            const fieldType = String(entry.type ?? "text");
            return (
              <div
                key={`${String(entry.key || "field")}-${index}`}
                className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#5C6370]">
                    Field {index + 1}
                    {entry.key ? ` · ${String(entry.key)}` : ""}
                  </span>
                  <ListButtons
                    index={index}
                    length={formFields.length}
                    onMove={moveField}
                    onRemove={() =>
                      patchFields(formFields.filter((_, i) => i !== index))
                    }
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <SmallInput
                    label="Storage key"
                    value={String(entry.key ?? "")}
                    onChange={(next) =>
                      updateFieldAt(index, (current) => ({
                        ...current,
                        key: next.replace(/[^a-zA-Z0-9_]/g, ""),
                      }))
                    }
                  />
                  <label>
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
                      Field type
                    </span>
                    <select
                      value={fieldType}
                      onChange={(event) =>
                        updateFieldAt(index, (current) => ({
                          ...current,
                          type: event.target.value,
                          options:
                            event.target.value === "select"
                              ? Array.isArray(current.options)
                                ? current.options
                                : [
                                    {
                                      value: "option_1",
                                      label: { en: "Option 1" },
                                    },
                                  ]
                              : undefined,
                        }))
                      }
                      className="w-full rounded-lg border border-[#DDE1E7] px-3 py-2 text-sm outline-none focus:border-[#1A2332]"
                    >
                      {inquiryFieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <SmallInput
                    label="Label"
                    value={localizedValue(entry.label, locale)}
                    onChange={(next) =>
                      updateFieldAt(index, (current) =>
                        setEntryLocalized(current, "label", next)
                      )
                    }
                  />
                  <SmallInput
                    label="Placeholder"
                    value={localizedValue(entry.placeholder, locale)}
                    onChange={(next) =>
                      updateFieldAt(index, (current) =>
                        setEntryLocalized(current, "placeholder", next)
                      )
                    }
                  />
                  <label>
                    <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
                      Width
                    </span>
                    <select
                      value={entry.width === "half" ? "half" : "full"}
                      onChange={(event) =>
                        updateFieldAt(index, (current) => ({
                          ...current,
                          width: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#DDE1E7] px-3 py-2 text-sm outline-none focus:border-[#1A2332]"
                    >
                      <option value="full">Full width</option>
                      <option value="half">Half width</option>
                    </select>
                  </label>
                  {fieldType === "textarea" ? (
                    <SmallInput
                      label="Max length"
                      value={
                        entry.maxLength != null
                          ? String(entry.maxLength)
                          : "2000"
                      }
                      onChange={(next) =>
                        updateFieldAt(index, (current) => {
                          const parsed = Number.parseInt(next, 10);
                          return {
                            ...current,
                            maxLength:
                              Number.isFinite(parsed) && parsed > 0
                                ? parsed
                                : 2000,
                          };
                        })
                      }
                    />
                  ) : null}
                  <div className="flex flex-wrap items-end gap-4 pb-1">
                    <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                      <input
                        type="checkbox"
                        checked={entry.required === true}
                        onChange={(event) =>
                          updateFieldAt(index, (current) => ({
                            ...current,
                            required: event.target.checked,
                          }))
                        }
                      />
                      Required
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                      <input
                        type="checkbox"
                        checked={entry.enabled !== false}
                        onChange={(event) =>
                          updateFieldAt(index, (current) => ({
                            ...current,
                            enabled: event.target.checked,
                          }))
                        }
                      />
                      Visible on website
                    </label>
                    {fieldType === "phone" ? (
                      <label className="inline-flex items-center gap-2 text-sm text-[#374151]">
                        <input
                          type="checkbox"
                          checked={entry.useLocaleDialCode !== false}
                          onChange={(event) =>
                            updateFieldAt(index, (current) => ({
                              ...current,
                              useLocaleDialCode: event.target.checked,
                            }))
                          }
                        />
                        Locale dial code
                      </label>
                    ) : null}
                  </div>
                </div>
                {fieldType === "select" ? (
                  <div className="mt-4 space-y-2 border-t border-[#E8EAED] pt-3">
                    <p className="text-[11px] font-semibold uppercase text-[#6B7280]">
                      Dropdown options
                    </p>
                    {options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className="grid gap-2 rounded-lg border border-[#E8EAED] bg-white p-3 md:grid-cols-[1fr_1fr_auto]"
                      >
                        <SmallInput
                          label="Stored value"
                          value={String(opt.value ?? "")}
                          onChange={(next) =>
                            updateFieldAt(index, (current) => {
                              const nextOptions = [
                                ...(Array.isArray(current.options)
                                  ? (current.options as Record<string, unknown>[])
                                  : []),
                              ];
                              nextOptions[optIndex] = {
                                ...nextOptions[optIndex],
                                value: next,
                              };
                              return { ...current, options: nextOptions };
                            })
                          }
                        />
                        <SmallInput
                          label="Option label"
                          value={localizedValue(opt.label, locale)}
                          onChange={(next) =>
                            updateFieldAt(index, (current) => {
                              const nextOptions = [
                                ...(Array.isArray(current.options)
                                  ? (current.options as Record<string, unknown>[])
                                  : []),
                              ];
                              nextOptions[optIndex] = setEntryLocalized(
                                nextOptions[optIndex] || {},
                                "label",
                                next
                              );
                              return { ...current, options: nextOptions };
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateFieldAt(index, (current) => ({
                              ...current,
                              options: (
                                Array.isArray(current.options)
                                  ? (current.options as unknown[])
                                  : []
                              ).filter((_, i) => i !== optIndex),
                            }))
                          }
                          className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] text-[#B91C1C]"
                          aria-label="Remove option"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        updateFieldAt(index, (current) => ({
                          ...current,
                          options: [
                            ...(Array.isArray(current.options)
                              ? (current.options as unknown[])
                              : []),
                            {
                              value: `option_${options.length + 1}`,
                              label: { en: `Option ${options.length + 1}` },
                            },
                          ],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
                    >
                      <Plus size={14} /> Add option
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              patchFields([
                ...formFields,
                {
                  key: `field_${formFields.length + 1}`,
                  type: "text",
                  label: { en: "New Field" },
                  placeholder: { en: "" },
                  required: false,
                  width: "full",
                  enabled: true,
                },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add form field
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "tool-list") {
    const tools = items.map((item) =>
      item && typeof item === "object" ? (item as Record<string, unknown>) : {}
    );
    return (
      <div className="md:col-span-2">
        <FieldLabel field={field} />
        <div className="space-y-3">
          {tools.map((entry, index) => (
            <div key={index} className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] p-4">
              <div className="mb-3 flex justify-between gap-3">
                <span className="text-xs font-bold text-[#5C6370]">Tool {index + 1}</span>
                <ListButtons
                  index={index}
                  length={tools.length}
                  onMove={move}
                  onRemove={() => onChange(tools.filter((_, i) => i !== index))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallInput
                  label="Name"
                  value={localizedValue(entry.name, locale)}
                  onChange={(next) =>
                    onChange(
                      tools.map((current, i) =>
                        i === index
                          ? setEntryLocalized(current, "name", next)
                          : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Image URL"
                  value={String(entry.image ?? "")}
                  media="image"
                  onChange={(next) =>
                    onChange(
                      tools.map((current, i) =>
                        i === index ? { ...current, image: next } : current
                      )
                    )
                  }
                />
                <SmallInput
                  label="Order"
                  value={String(entry.order ?? index + 1)}
                  onChange={(next) =>
                    onChange(
                      tools.map((current, i) =>
                        i === index
                          ? { ...current, order: Number(next) || 0 }
                          : current
                      )
                    )
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...tools,
                { name: { en: "" }, image: "", order: tools.length + 1 },
              ])
            }
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#B9C0CA] px-3 py-2 text-xs font-semibold text-[#5C6370]"
          >
            <Plus size={14} /> Add tool
          </button>
        </div>
      </div>
    );
  }

  const wide = field.type === "textarea" || field.type === "json";

  if (field.media && field.type !== "boolean" && field.type !== "number") {
    return (
      <div className={wide ? "md:col-span-2" : ""}>
        <MediaUpload
          label={field.label}
          kind={field.media === "pdf" ? "pdf" : field.media === "icon" ? "icon" : "image"}
          value={String(value ?? "")}
          onChange={(url) => onChange(url)}
          hint={field.helpText}
          uploadFile={uploadVarsoviaMedia}
          previewSize="md"
        />
      </div>
    );
  }

  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <FieldLabel field={field} />
      {field.type === "boolean" ? (
        /\.indexable$/.test(field.key) || field.key === "indexable" ? (
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={`mt-1 inline-flex h-8 min-w-[3.25rem] items-center justify-center rounded-full px-3 text-[11px] font-bold tracking-wide ${
              value ? "bg-emerald-600 text-white" : "bg-[#E2E8F0] text-[#64748B]"
            }`}
          >
            {value ? "ON" : "OFF"}
          </button>
        ) : (
        <input
          type="checkbox"
          checked={
            field.key === "visible" || field.key === "enabled"
              ? value !== false
              : Boolean(value)
          }
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 accent-[#1A2332]"
        />
        )
      ) : field.type === "select" ? (
        <select
          value={
            value && typeof value === "object"
              ? localizedValue(value)
              : String(value ?? field.options?.[0]?.value ?? "")
          }
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-[#DDE1E7] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1A2332]"
        >
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" || field.type === "json" ? (
        <textarea
          value={String(value ?? "")}
          maxLength={field.maxLength}
          placeholder={
            field.localized ? localeFieldPlaceholder(locale) : undefined
          }
          onChange={(event) => {
            const next = event.target.value;
            onChange(
              field.maxLength != null ? next.slice(0, field.maxLength) : next,
            );
          }}
          rows={field.type === "json" ? 4 : 5}
          className="w-full rounded-lg border border-[#DDE1E7] px-3.5 py-2.5 text-sm outline-none focus:border-[#1A2332]"
        />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          maxLength={field.type === "number" ? undefined : field.maxLength}
          value={String(value ?? "")}
          placeholder={
            field.localized ? localeFieldPlaceholder(locale) : undefined
          }
          onChange={(event) =>
            onChange(
              field.type === "number"
                ? event.target.value === ""
                  ? ""
                  : Number(event.target.value)
                : field.maxLength != null
                  ? event.target.value.slice(0, field.maxLength)
                  : event.target.value
            )
          }
          className="w-full rounded-lg border border-[#DDE1E7] px-3.5 py-2.5 text-sm outline-none focus:border-[#1A2332]"
        />
      )}
    </label>
  );
}

function FieldLabel({ field }: { field: Field }) {
  return (
    <span className="mb-1.5 block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
        {field.label}
        {field.maxLength != null ? ` (max ${field.maxLength})` : ""}
        {field.required ? " *" : ""}
      </span>
      {field.helpText ? (
        <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-[#6B7280] leading-snug">
          {field.helpText}
        </span>
      ) : null}
    </span>
  );
}

function SmallInput({
  label,
  value,
  onChange,
  media,
  numeric,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  media?: MediaKind;
  numeric?: boolean;
  hint?: string;
}) {
  const [numericError, setNumericError] = useState("");

  if (media === "image" || media === "icon") {
    return (
      <MediaUpload
        label={label}
        kind={media}
        value={value}
        onChange={onChange}
        uploadFile={uploadVarsoviaMedia}
        previewSize="sm"
      />
    );
  }

  const display = numeric ? String(value || "").replace(/[^\d]/g, "") : value;

  return (
    <label>
      <span className="mb-1 block text-[11px] font-semibold uppercase text-[#6B7280]">
        {label}
      </span>
      <div className="flex gap-2">
        <input
          value={display}
          inputMode={numeric ? "numeric" : undefined}
          pattern={numeric ? "[0-9]*" : undefined}
          autoComplete={numeric ? "off" : undefined}
          onChange={(event) => {
            const raw = event.target.value;
            if (numeric) {
              if (/[^\d]/.test(raw)) {
                setNumericError("Numbers only — use Suffix for + or other text.");
              } else {
                setNumericError("");
              }
              onChange(raw.replace(/[^\d]/g, ""));
              return;
            }
            onChange(raw);
          }}
          placeholder={media === "pdf" ? "PDF URL or upload…" : undefined}
          className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#1A2332] ${
            numericError ? "border-red-400" : "border-[#DDE1E7]"
          }`}
        />
        {media ? (
          <InlineUploadButton kind={media} onUploaded={onChange} />
        ) : null}
      </div>
      {numericError ? (
        <p className="mt-1 text-[11px] font-medium leading-4 text-red-600">
          {numericError}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] leading-4 text-[#9CA3AF]">{hint}</p>
      ) : null}
      {media === "pdf" && value.trim() ? (
        <p className="mt-2 truncate text-xs text-[#64748B]">{value}</p>
      ) : null}
    </label>
  );
}

function InlineUploadButton({
  kind = "image",
  onUploaded,
}: {
  kind?: MediaKind;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const accept =
    kind === "pdf"
      ? "application/pdf,.pdf"
      : kind === "icon"
        ? "image/png,image/svg+xml,image/webp,image/jpeg"
        : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

  const onFile = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadVarsoviaMedia(file, kind);
      if (!res?.file?.url) throw new Error("No URL returned");
      onUploaded(res.file.url);
      toast.success("Uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F3F4F6] disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
    </>
  );
}

function ListButtons({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, -1)}
        className="rounded-md border border-[#DDE1E7] px-2 py-1 text-xs disabled:opacity-30"
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(index, 1)}
        className="rounded-md border border-[#DDE1E7] px-2 py-1 text-xs disabled:opacity-30"
        aria-label="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-md border border-red-200 p-1.5 text-red-600"
        aria-label="Remove"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
