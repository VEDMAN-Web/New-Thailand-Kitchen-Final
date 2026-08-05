import axios from "axios";

const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000/api";
const baseURL = raw.replace(/\/+$/, "") || "http://localhost:5000/api";

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
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

adminApi.interceptors.request.use((config) => {
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

export type CategoryItem = {
  _id: string;
  title: string;
  description: string;
  image: string;
  icon?: string;
};

export async function listCategories(siteId: SiteId) {
  const { data } = await adminApi.get(`/cms/${siteId}/categories`);
  return data as { success: boolean; items: CategoryItem[] };
}

export async function createCategory(
  siteId: SiteId,
  body: { title: string; description?: string; image?: string }
) {
  const { data } = await adminApi.post(`/cms/${siteId}/categories`, body);
  return data;
}

export async function updateCategory(
  siteId: SiteId,
  id: string,
  body: { title: string; description?: string; image?: string }
) {
  const { data } = await adminApi.put(`/cms/${siteId}/categories/${id}`, body);
  return data;
}

export async function deleteCategory(siteId: SiteId, id: string) {
  const { data } = await adminApi.delete(`/cms/${siteId}/categories/${id}`);
  return data;
}

export type ProductItem = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  productType?: string;
  sectionTag?: string;
  description: string;
  image: string;
  icon?: string;
  gallery?: string[];
  pdfUrl?: string;
  featureHighlights?: { title: string; description: string }[];
  category: string;
  featured: boolean;
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
  title: string;
  body: string;
};

export type LegalPage = {
  _id: string;
  title: string;
  subtitle?: string;
  updatedLabel?: string;
  content: string;
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
    title: string;
    subtitle?: string;
    updatedLabel?: string;
    content?: string;
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

export type GalleryCmsItem = {
  _id: string;
  title: string;
  image: string;
  filter: string;
  tall?: boolean;
  wide?: boolean;
  sortOrder?: number;
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
  question: string;
  answer: string;
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
