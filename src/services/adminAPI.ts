import axios from "axios";

/**
 * Always use same-origin `/api` in the browser so Next rewrites proxy to BACKEND_URL.
 * Never point NEXT_PUBLIC_API_URL at Varsovia or http://localhost:5000 (causes CORS).
 */
function resolveApiBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "/api";
  const cleaned = raw.replace(/\/+$/, "") || "/api";
  // Guard: absolute URLs in the client cause CORS; force same-origin proxy instead.
  if (typeof window !== "undefined" && /^https?:\/\//i.test(cleaned)) {
    console.warn(
      `[adminAPI] Ignoring absolute NEXT_PUBLIC_API_URL (${cleaned}); using /api same-origin proxy.`,
    );
    return "/api";
  }
  return cleaned;
}

export type SiteId = "thailand-kitchen" | "varsovia-kitchen";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
};

export type SiteInfo = {
  id: SiteId;
  name: string;
  enabled: boolean;
};

const adminApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

adminApi.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseUrl();
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function adminLogin(email: string, password: string) {
  const { data } = await adminApi.post("/auth/login", { email, password });
  return data as { success: boolean; token: string; user: AdminUser };
}

export async function adminMe() {
  const { data } = await adminApi.get("/auth/me");
  return data as { success: boolean; user: AdminUser };
}

export async function listSites() {
  const { data } = await adminApi.get("/cms/sites");
  return data as { success: boolean; sites: SiteInfo[] };
}

export async function getHome(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/home`);
  return data as { success: boolean; home: { sections: Record<string, unknown> } };
}

export async function updateHome(siteId: SiteId, sections: Record<string, unknown>) {
  const { data } = await adminApi.put(`/cms/${siteId}/home`, { sections });
  return data;
}

export async function resetHome(siteId: SiteId) {
  const { data } = await adminApi.post(`/cms/${siteId}/home/reset`);
  return data;
}

export type SyncSiteReport = {
  database: string;
  host: string;
  siteId: string;
  before: Record<string, number | boolean>;
  after: Record<string, number | boolean>;
  added: Record<string, number>;
  taxonomy: { created: number; existing: number; total: number };
  homeUpdated: boolean;
  landingsSeeded?: number;
  repaired?: {
    homeHubsRepaired: number;
    categoriesRepaired: number;
    mediaUrlsNormalized: number;
  };
  nav?: {
    servicesMenu: number;
    materialsMenu: number;
    locationsMenu?: number;
    locationServices: number;
    galleryTotal?: number;
    guidesTotal?: number;
    productsTotal?: number;
    faqsTotal?: number;
    categoriesTotal: number;
  };
  gallerySync?: { created: number; existing: number; total: number };
  blogSync?: { created: number; existing: number; total: number };
  productSync?: { created: number; existing: number; total: number };
  faqSync?: { created: number; existing: number; total: number };
  localeRepair?: {
    home?: { repaired: number; total: number };
    products?: { repaired: number; total: number };
    categories?: { repaired: number; total: number };
    gallery?: { repaired: number; total: number };
    faqs?: { repaired: number; total: number };
    blogs?: { repaired: number; total: number };
    totalRepaired?: number;
  };
  preserved: boolean;
};

/** Safe sync from the MongoDB currently connected to the backend. Never wipes content. */
export async function syncSiteFromDb(siteId: SiteId) {
  const { data } = await adminApi.post(
    `/cms/${siteId}/sync`,
    {},
    { timeout: 60000 }
  );
  return data as {
    success: boolean;
    message: string;
    report: SyncSiteReport;
  };
}

export type CategoryItem = {
  _id: string;
  title: LocalizedCmsText;
  description: LocalizedCmsText;
  image: string;
  icon?: string;
  slug?: string;
  categoryType?: string;
  parentId?:
    | string
    | {
        _id?: string;
        slug?: string;
        categoryType?: string;
        title?: LocalizedCmsText;
      }
    | null;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  indexable?: boolean;
  eyebrow?: LocalizedCmsText;
  ctaLabel?: LocalizedCmsText;
  ctaHref?: string;
  footerCtaHeading?: LocalizedCmsText;
  footerCtaBody?: LocalizedCmsText;
  sections?: Array<{
    heading?: LocalizedCmsText;
    body?: LocalizedCmsText;
    image?: string;
    layout?: string;
  }>;
};

export async function listCategories(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/categories`);
  return data as { success: boolean; items: CategoryItem[] };
}

export async function createCategory(
  siteId: SiteId,
  body: Record<string, unknown>
) {
  const { data } = await adminApi.post(`/cms/${siteId}/categories`, body);
  return data;
}

export async function updateCategory(
  siteId: SiteId,
  id: string,
  body: Record<string, unknown>
) {
  const { data } = await adminApi.put(`/cms/${siteId}/categories/${id}`, body);
  return data;
}

export async function deleteCategory(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/categories/${id}`);
  return data;
}

export type LocalizedCmsText = string | Partial<Record<"en" | "th" | "pl", string>>;

export type ProductItem = {
  _id: string;
  title: LocalizedCmsText;
  slug: string;
  subtitle?: LocalizedCmsText;
  productType?: LocalizedCmsText;
  sectionTag?: LocalizedCmsText;
  description: LocalizedCmsText;
  image: string;
  icon?: string;
  gallery?: string[];
  pdfUrl?: string;
  featureHighlights?: {
    title: LocalizedCmsText;
    description: LocalizedCmsText;
  }[];
  category: LocalizedCmsText;
  featured: boolean;
  finish?: LocalizedCmsText;
  material?: LocalizedCmsText;
  style?: LocalizedCmsText;
  color?: LocalizedCmsText;
};

export async function listProducts(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/products`);
  return data as { success: boolean; items: ProductItem[] };
}

export async function createProduct(siteId: SiteId, body: Partial<ProductItem>) {
  const { data } = await adminApi.post(`/cms/${siteId}/products`, body);
  return data;
}

export async function updateProduct(
  siteId: SiteId,
  id: string,
  body: Partial<ProductItem>
) {
  const { data } = await adminApi.put(`/cms/${siteId}/products/${id}`, body);
  return data;
}

export async function deleteProduct(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/products/${id}`);
  return data;
}

export type BlogBodySection = {
  title: string;
  content: string;
  image?: string;
};

export type BlogLocale = "en" | "th" | "pl";

/** Per-locale blog copy. Blank fields fall back to the English base. */
export type BlogTranslation = {
  title: string;
  excerpt: string;
  category: string;
  bodySections: BlogBodySection[];
  highlightTitle: string;
  highlightText: string;
  quote: string;
  quoteAuthor: string;
};

export type BlogTranslations = {
  th: BlogTranslation;
  pl: BlogTranslation;
};

export type BlogItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  gallery?: string[];
  category?: string;
  author?: string;
  readTime?: string;
  publishDate?: string;
  bodySections?: BlogBodySection[];
  highlightTitle?: string;
  highlightText?: string;
  quote?: string;
  quoteAuthor?: string;
  translations?: Partial<Record<"th" | "pl", Partial<BlogTranslation>>>;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  primaryCommercialPage?: string;
  locationTag?: string;
  serviceTag?: string;
  materialTag?: string;
  metaDescription?: string;
  reviewer?: string;
};

export async function listBlogs(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/blogs`);
  return data as { success: boolean; items: BlogItem[] };
}

export async function createBlog(siteId: SiteId, body: Partial<BlogItem>) {
  const { data } = await adminApi.post(`/cms/${siteId}/blogs`, body);
  return data;
}

export async function generateBlogWithAI(
  siteId: SiteId,
  body: { topic?: string } = {}
) {
  const { data } = await adminApi.post(
    `/cms/${siteId}/blogs/generate-ai`,
    body,
    { timeout: 90000 }
  );
  return data as {
    success: boolean;
    source?: "openai" | "fallback";
    warning?: string;
    article: {
      title: string;
      category: string;
      readTime: string;
      author: string;
      excerpt: string;
      bodySections: BlogBodySection[];
      highlightTitle: string;
      highlightText: string;
      quote: string;
      quoteAuthor: string;
      publishDate: string;
      image: string;
      gallery1?: string;
      gallery2?: string;
      published: boolean;
    };
  };
}

export async function generateBlogImageWithAI(
  siteId: SiteId,
  body: { topic?: string; title?: string } = {}
) {
  const { data } = await adminApi.post(
    `/cms/${siteId}/blogs/generate-ai-image`,
    body,
    { timeout: 130000 }
  );
  return data as {
    success: boolean;
    source?: "openai" | "gemini";
    image: string;
    storage?: string;
    model?: string;
    prompt?: string;
    message?: string;
  };
}

export async function updateBlog(siteId: SiteId, id: string, body: Partial<BlogItem>) {
  const { data } = await adminApi.put(`/cms/${siteId}/blogs/${id}`, body);
  return data;
}

export async function deleteBlog(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/blogs/${id}`);
  return data;
}

export type LegalSection = {
  title: LocalizedCmsText;
  body: LocalizedCmsText;
};

export type LegalPage = {
  _id: string;
  title: LocalizedCmsText;
  subtitle?: LocalizedCmsText;
  updatedLabel?: LocalizedCmsText;
  content: LocalizedCmsText;
  sections?: LegalSection[];
  type: string;
};

export async function getLegal(siteId: SiteId, type: "privacy" | "terms") {
  const { data } = await adminApi.get(`/cms/${siteId}/legal/${type}`);
  return data as { success: boolean; page: LegalPage };
}

export async function updateLegal(
  siteId: SiteId,
  type: "privacy" | "terms",
  body: {
    title: LocalizedCmsText;
    subtitle?: LocalizedCmsText;
    updatedLabel?: LocalizedCmsText;
    content?: LocalizedCmsText;
    sections?: LegalSection[];
  }
) {
  const { data } = await adminApi.put(`/cms/${siteId}/legal/${type}`, body);
  return data;
}

export async function listUsers() {
  const { data } = await adminApi.get("/auth/users");
  return data as { success: boolean; users: AdminUser[] };
}

export async function createUser(body: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const { data } = await adminApi.post("/auth/users", body);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await adminApi.delete(`/auth/users/${id}`);
  return data;
}

export type ContactLead = {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  whatsappNumber: string;
  cityName: string;
  countryName: string;
  message: string;
  source?: string;
  projectType?: string;
  budget?: string;
  createdAt?: string;
};

export async function listContacts() {
  const { data } = await adminApi.get("/contact/get");
  return data as { success: boolean; count: number; data: ContactLead[] };
}

export async function deleteContact(id: string) {
  const { data } = await adminApi.delete(`/contact/delete/${id}`);
  return data;
}

/** Upload image, icon, PDF, or video for CMS fields */
export async function uploadMedia(
  file: File,
  kind: "image" | "icon" | "pdf" | "video" | "any" = "image"
) {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  try {
    const { data } = await adminApi.post("/upload", form, {
      params: { kind },
      // Let the browser set multipart boundary — never force Content-Type
      headers: { "Content-Type": undefined as unknown as string },
      timeout: 180000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      transformRequest: [
        (body, headers) => {
          if (headers && body instanceof FormData) {
            delete headers["Content-Type"];
          }
          return body;
        },
      ],
    });
    return data as {
      success: boolean;
      file: {
        url: string;
        publicId?: string;
        storage: string;
        kind: string;
        originalName: string;
      };
    };
  } catch (error: unknown) {
    const ax = error as {
      code?: string;
      message?: string;
      response?: { data?: { message?: string } };
    };
    if (ax.code === "ECONNABORTED" || /aborted|timeout/i.test(ax.message || "")) {
      throw new Error(
        "Upload was cancelled or timed out. Wait for the upload to finish before saving or switching sections."
      );
    }
    throw new Error(
      ax.response?.data?.message || ax.message || "Upload failed"
    );
  }
}

export type ResolvedMediaUrl = {
  success: boolean;
  url: string;
  kind: string;
  hint?: string;
  previewUrl?: string;
  resolvedUrl?: string;
  playable?: boolean;
  provider?: string;
};

/** Resolve gallery page links (Pexels etc.) to preview thumbnails for admin. */
export async function resolveMediaUrl(
  url: string,
  field: "image" | "video" = "image"
) {
  const { data } = await adminApi.get("/upload/resolve", {
    params: { url, field },
    timeout: 15000,
  });
  return data as ResolvedMediaUrl;
}

export type GalleryCmsItem = {
  _id: string;
  title: LocalizedCmsText;
  image: string;
  filter: string;
  tall?: boolean;
  wide?: boolean;
  sortOrder?: number;
  locationTag?: string;
  layoutTag?: string;
  styleTag?: string;
  materialTag?: string;
  propertyType?: string;
  projectTitle?: string;
  projectDesc?: string;
};

export async function listGallery(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/gallery`);
  return data as { success: boolean; items: GalleryCmsItem[] };
}

export async function createGalleryItem(
  siteId: SiteId,
  body: Partial<GalleryCmsItem>
) {
  const { data } = await adminApi.post(`/cms/${siteId}/gallery`, body);
  return data;
}

export async function updateGalleryItem(
  siteId: SiteId,
  id: string,
  body: Partial<GalleryCmsItem>
) {
  const { data } = await adminApi.put(`/cms/${siteId}/gallery/${id}`, body);
  return data;
}

export async function deleteGalleryItem(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/gallery/${id}`);
  return data;
}

export type CatalogueCmsItem = {
  _id: string;
  title: string;
  category: string;
  image: string;
  pdfUrl: string;
  fileName: string;
  downloadName: string;
  sortOrder?: number;
};

export async function listCatalogues(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/catalogues`);
  return data as { success: boolean; items: CatalogueCmsItem[] };
}

export async function createCatalogue(
  siteId: SiteId,
  body: Partial<CatalogueCmsItem>
) {
  const { data } = await adminApi.post(`/cms/${siteId}/catalogues`, body);
  return data;
}

export async function updateCatalogue(
  siteId: SiteId,
  id: string,
  body: Partial<CatalogueCmsItem>
) {
  const { data } = await adminApi.put(`/cms/${siteId}/catalogues/${id}`, body);
  return data;
}

export async function deleteCatalogue(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/catalogues/${id}`);
  return data;
}

export type FaqCmsItem = {
  _id: string;
  question: string | Record<string, string>;
  answer: string | Record<string, string>;
  sortOrder?: number;
};

export async function listFaqs(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/faqs`);
  return data as { success: boolean; items: FaqCmsItem[] };
}

export async function createFaq(siteId: SiteId, body: Partial<FaqCmsItem>) {
  const { data } = await adminApi.post(`/cms/${siteId}/faqs`, body);
  return data;
}

export async function updateFaq(
  siteId: SiteId,
  id: string,
  body: Partial<FaqCmsItem>
) {
  const { data } = await adminApi.put(`/cms/${siteId}/faqs/${id}`, body);
  return data;
}

export async function deleteFaq(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/faqs/${id}`);
  return data;
}

export default adminApi;
