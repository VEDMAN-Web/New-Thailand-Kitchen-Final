import axios from "axios";

export type LocaleCode = "en" | "th" | "pl";
export type LocalizedText =
  | string
  | Partial<Record<LocaleCode, string>>;

export type VarsoviaRecord = {
  _id: string;
  [key: string]: unknown;
};

export type VarsoviaResource =
  | "products"
  | "projects"
  | "blogs"
  | "faqs"
  | "testimonials"
  | "catalogues"
  | "showcases"
  | "team-members"
  | "partners"
  | "showrooms"
  | "core-strengths";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    locale?: string;
    message?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

/** Admin CMS lists need the full collection; backend default limit is 20. */
const ADMIN_LIST_LIMIT = 100;

// Served by the admin Next route handler outside /api so Thailand rewrites do not intercept it.
const varsoviaApi = axios.create({
  baseURL: "/varsovia-api",
  headers: { "Content-Type": "application/json" },
  timeout: 95000,
});

varsoviaApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function readPath(resource: VarsoviaResource) {
  return resource === "team-members" ? "team" : resource;
}

function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    typeof (body as ApiEnvelope<unknown>).success === "boolean"
  );
}

function readEnvelopeError(body: unknown, fallback = "Request failed") {
  if (!body || typeof body !== "object") return fallback;
  const record = body as Record<string, unknown>;
  if (record.error && typeof record.error === "object") {
    const message = (record.error as { message?: string }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }
  return fallback;
}

/** Unwrap `{ success, data }` from the Varsovia API envelope. */
function unwrapApiData<T>(body: unknown): T {
  if (isEnvelope(body)) {
    if (!body.success) {
      throw new Error(readEnvelopeError(body));
    }
    return body.data as T;
  }
  return body as T;
}

function unwrapApiList<T>(body: unknown): T[] {
  const data = unwrapApiData<unknown>(body);
  return Array.isArray(data) ? (data as T[]) : [];
}

export async function getVarsoviaSite() {
  const { data } = await varsoviaApi.get("/site", { params: { cms: 1 } });
  return unwrapApiData<Record<string, unknown>>(data);
}

/** Only keys accepted by Varsovia `siteUpdate` schema — drops dead admin-only fields. */
const SITE_UPDATE_KEYS = [
  "heroEyebrow",
  "heroHeadline",
  "heroSubtitle",
  "heroPrimaryCtaLabel",
  "heroSecondaryCtaLabel",
  "heroImage",
  "heroPrimaryCtaHref",
  "heroSecondaryCtaHref",
  "aboutTitle",
  "aboutText",
  "aboutIntro",
  "aboutStory",
  "aboutHeroTitle",
  "aboutHeroSubtitle",
  "aboutImages",
  "aboutStoryImages",
  "brandLogoMark",
  "brandLogoMarkOnDark",
  "brandLogoLockup",
  "brandLogoLockupOnDark",
  "brandWordmarkLine1",
  "brandWordmarkLine2",
  "stats",
  "statsImage",
  "vision",
  "mission",
  "values",
  "processSteps",
  "designTools",
  "teamPage",
  "localeFlags",
  "contactImages",
  "footerBio",
  "phone",
  "email",
  "address",
  "mobileWhatsapp",
  "contactPhone",
  "facebookUrl",
  "whatsappUrl",
  "instagramUrl",
  "xUrl",
  "footerOffices",
  "sectionCopy",
  "searchPages",
  "navMenus",
  "qualitySale",
  "showcaseMeta",
  "projectsPage",
  "aboutPageSettings",
  "homeSeo",
  "faqPage",
  "cataloguePage",
  "contactPage",
  "legalPages",
  "interiorCatalogMode",
  "inquiryForm",
  "mainNavigation",
  "footerNavigation",
  "pages",
] as const;

export function pickVarsoviaSiteUpdate(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of SITE_UPDATE_KEYS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  // Normalize process step icons (legacy admin used `image`)
  if (Array.isArray(out.processSteps)) {
    out.processSteps = (out.processSteps as Record<string, unknown>[]).map((step) => {
      const icon =
        typeof step.icon === "string" && step.icon
          ? step.icon
          : typeof step.image === "string"
            ? step.image
            : "";
      const { image: _image, ...rest } = step;
      return { ...rest, icon };
    });
  }
  // Empty email fails Zod .email() — omit blank
  if (typeof out.email === "string" && !out.email.trim()) {
    delete out.email;
  }
  return out;
}

export async function updateVarsoviaSite(body: Record<string, unknown>) {
  const { data } = await varsoviaApi.put("/site", pickVarsoviaSiteUpdate(body));
  return unwrapApiData<Record<string, unknown>>(data);
}

export type VarsoviaSyncReport = {
  database: string;
  host: string;
  siteId: "varsovia-kitchen";
  siteUpdated: boolean;
  preserved: boolean;
  resources: Record<string, number>;
  filledSiteKeys: number;
  journalSync?: {
    upserted: number;
    deleted: number;
    total: number;
  };
};

function loc(en: string) {
  return { en, th: en, pl: en };
}

function blogTitleEn(item: VarsoviaRecord): string {
  const title = item.title;
  if (typeof title === "string") return title.trim();
  if (title && typeof title === "object") {
    const map = title as Record<string, unknown>;
    return String(map.en || map.th || map.pl || "").trim();
  }
  return "";
}

/**
 * Mirror live /journal articles into Mongo: upsert canonical set, delete extras.
 */
async function syncJournalArticlesMirror(): Promise<{
  upserted: number;
  deleted: number;
  total: number;
}> {
  const { JOURNAL_ARTICLE_SEEDS } = await import(
    "@/app/varsovia/journalArticlesSeed"
  );

  const existing = await listVarsoviaRecords("blogs");
  const byTitle = new Map<string, VarsoviaRecord>();
  for (const row of existing) {
    const key = blogTitleEn(row).toLowerCase();
    if (key) byTitle.set(key, row);
  }

  const keepTitles = new Set<string>();
  let upserted = 0;

  for (const seed of JOURNAL_ARTICLE_SEEDS) {
    const titleKey = seed.title.trim().toLowerCase();
    keepTitles.add(titleKey);
    const payload = {
      title: loc(seed.title),
      excerpt: loc(seed.excerpt),
      content: loc(seed.excerpt),
      category: seed.category,
      date: seed.date,
      readTime: loc(seed.readTime),
      image: seed.image,
      author: { name: loc(seed.author), avatar: "" },
      sections: [
        {
          heading: loc(seed.title),
          text: loc(seed.excerpt),
          image: seed.image,
        },
      ],
      views: 0,
      order: seed.order,
      visible: true,
    };

    const match = byTitle.get(titleKey);
    if (match?._id) {
      await updateVarsoviaRecord("blogs", match._id, payload);
    } else {
      await createVarsoviaRecord("blogs", payload);
    }
    upserted += 1;
  }

  let deleted = 0;
  for (const row of existing) {
    const key = blogTitleEn(row).toLowerCase();
    if (!key || keepTitles.has(key)) continue;
    await deleteVarsoviaRecord("blogs", row._id);
    deleted += 1;
  }

  return {
    upserted,
    deleted,
    total: JOURNAL_ARTICLE_SEEDS.length,
  };
}

function isBlankValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>);
    return values.length === 0 || values.every(isBlankValue);
  }
  return false;
}

/** Fill blank Journal hub fields from live-page defaults (does not wipe edited copy). */
function mergeJournalHub(
  current: Record<string, unknown> | undefined,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const out = structuredClone(current && typeof current === "object" ? current : {});
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const cur = out[key];
    if (isBlankValue(cur)) {
      out[key] = structuredClone(defaultValue);
      continue;
    }
    if (
      cur &&
      defaultValue &&
      typeof cur === "object" &&
      typeof defaultValue === "object" &&
      !Array.isArray(cur) &&
      !Array.isArray(defaultValue)
    ) {
      out[key] = mergeJournalHub(
        cur as Record<string, unknown>,
        defaultValue as Record<string, unknown>
      );
    }
  }
  return out;
}

/**
 * Safe Varsovia sync against the API currently configured (VARSOVIA_API_URL).
 * Fills blank site fields from defaults; Journal articles are mirrored to the
 * live /journal set (upsert + delete extras).
 */
export async function syncVarsoviaFromDb(): Promise<{
  success: boolean;
  message: string;
  report: VarsoviaSyncReport;
}> {
  const { mergeVarsoviaSiteDefaults } = await import(
    "@/app/varsovia/siteDefaults"
  );
  const { DEFAULT_IA_PAGES } = await import("@/app/varsovia/iaPagesDefaults");

  const loaded = await getVarsoviaSite();
  const beforePayload = JSON.stringify(pickVarsoviaSiteUpdate(loaded));
  let merged = mergeVarsoviaSiteDefaults({ ...loaded });

  // Deep-fill Journal hub so admin matches live /journal sections
  const pages = {
    ...((merged.pages as Record<string, unknown>) || {}),
  };
  pages.journal = mergeJournalHub(
    pages.journal as Record<string, unknown> | undefined,
    DEFAULT_IA_PAGES.journal as unknown as Record<string, unknown>
  );
  merged = { ...merged, pages };

  const afterPayload = JSON.stringify(pickVarsoviaSiteUpdate(merged));

  let siteUpdated = false;
  let filledSiteKeys = 0;
  if (beforePayload !== afterPayload) {
    const before = pickVarsoviaSiteUpdate(loaded);
    const after = pickVarsoviaSiteUpdate(merged);
    for (const key of Object.keys(after)) {
      const b = before[key];
      const a = after[key];
      const blankBefore =
        b === undefined ||
        b === null ||
        (typeof b === "string" && !b.trim()) ||
        (Array.isArray(b) && b.length === 0);
      if (blankBefore && JSON.stringify(b) !== JSON.stringify(a)) {
        filledSiteKeys += 1;
      }
    }
    await updateVarsoviaSite(merged);
    siteUpdated = true;
  }

  let journalSync: VarsoviaSyncReport["journalSync"];
  try {
    journalSync = await syncJournalArticlesMirror();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Journal articles sync failed: ${error.message}`
        : "Journal articles sync failed"
    );
  }

  const resourceList: VarsoviaResource[] = [
    "products",
    "projects",
    "blogs",
    "faqs",
    "testimonials",
    "catalogues",
    "showcases",
    "team-members",
    "partners",
    "showrooms",
    "core-strengths",
  ];

  const resources: Record<string, number> = {};
  await Promise.all(
    resourceList.map(async (resource) => {
      try {
        const items = await listVarsoviaRecords(resource);
        resources[resource] = items.length;
      } catch {
        resources[resource] = -1;
      }
    })
  );

  let host = "varsovia-api";
  let database = "varsovia";
  try {
    const { data } = await varsoviaApi.get("/health");
    const health = (data && typeof data === "object" ? data : {}) as {
      brand?: string;
      status?: string;
      db?: string;
    };
    if (health.brand) database = health.brand;
    if (health.db) database = String(health.db);
  } catch {
    /* ignore */
  }

  return {
    success: true,
    message: `Synced from Varsovia DB. Journal articles: ${journalSync?.total ?? 0} live (${journalSync?.deleted ?? 0} extras removed).`,
    report: {
      database,
      host,
      siteId: "varsovia-kitchen",
      siteUpdated,
      preserved: true,
      resources,
      filledSiteKeys,
      journalSync,
    },
  };
}

export async function listVarsoviaRecords(resource: VarsoviaResource) {
  const { data } = await varsoviaApi.get(`/${readPath(resource)}`, {
    params: { page: 1, limit: ADMIN_LIST_LIMIT },
  });
  return unwrapApiList<VarsoviaRecord>(data);
}

export async function createVarsoviaRecord(
  resource: VarsoviaResource,
  body: Record<string, unknown>
) {
  const { data } = await varsoviaApi.post(`/${resource}`, body);
  return unwrapApiData<VarsoviaRecord>(data);
}

export async function updateVarsoviaRecord(
  resource: VarsoviaResource,
  id: string,
  body: Record<string, unknown>
) {
  const { data } = await varsoviaApi.put(`/${resource}/${id}`, body);
  return unwrapApiData<VarsoviaRecord>(data);
}

export async function deleteVarsoviaRecord(
  resource: VarsoviaResource,
  id: string
) {
  const { data } = await varsoviaApi.delete(`/${resource}/${id}`);
  return unwrapApiData<null>(data);
}

export async function listVarsoviaContacts() {
  const { data } = await varsoviaApi.get("/contacts", {
    params: { page: 1, limit: ADMIN_LIST_LIMIT },
  });
  return unwrapApiList<VarsoviaRecord>(data);
}

export async function updateVarsoviaContactStatus(id: string, status: string) {
  const { data } = await varsoviaApi.patch(`/contacts/${id}`, { status });
  return unwrapApiData<VarsoviaRecord>(data);
}

/** Upload image/PDF to Varsovia API (public /api/media/:id URL for the live site). */
export async function uploadVarsoviaMedia(
  file: File,
  kind: "image" | "icon" | "pdf" | "any" = "image"
) {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  const { data } = await varsoviaApi.post("/media", form, {
    params: { kind },
    timeout: 120000,
    transformRequest: [
      (body, headers) => {
        if (headers && body instanceof FormData) {
          delete headers["Content-Type"];
        }
        return body;
      },
    ],
  });
  const payload = unwrapApiData<{
    file?: {
      url: string;
      publicId?: string;
      storage?: string;
      kind?: string;
      originalName?: string;
    };
  }>(data);
  if (!payload?.file?.url) {
    throw new Error("No URL returned from Varsovia media upload");
  }
  return {
    success: true as const,
    file: payload.file,
  };
}

export function localizedValue(
  value: unknown,
  locale: LocaleCode = "en"
) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const localized = value as Partial<Record<LocaleCode, unknown>>;
    const resolved = localized[locale] ?? localized.en;
    return typeof resolved === "string" ? resolved : "";
  }
  return "";
}

/** Prefer envelope `error.message`, then legacy shapes. */
export function varsoviaErrorMessage(error: unknown, fallback = "Request failed") {
  const candidate = error as {
    response?: { data?: unknown };
    message?: string;
  };
  if (candidate.response?.data !== undefined) {
    return readEnvelopeError(candidate.response.data, candidate.message || fallback);
  }
  return candidate.message || fallback;
}

export default varsoviaApi;
