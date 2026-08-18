import axios from "axios";
import { padShowcaseGallery } from "@/lib/showcaseGallery";

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
  "aboutSubtitle",
  "aboutText",
  "aboutCtaLabel",
  "aboutCtaHref",
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

function unwrapToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Record<string, unknown>;
    const en = typeof map.en === "string" ? map.en.trim() : "";
    const th = typeof map.th === "string" ? map.th.trim() : "";
    const pl = typeof map.pl === "string" ? map.pl.trim() : "";
    return en || th || pl;
  }
  return "";
}

function unwrapStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.map((item) => unwrapToString(item));
}

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
  for (const key of ["aboutImages", "aboutStoryImages", "contactImages"] as const) {
    const list = unwrapStringList(out[key]);
    if (list) out[key] = list;
  }
  if (Array.isArray(out.footerOffices)) {
    out.footerOffices = (out.footerOffices as Record<string, unknown>[]).map((office) => ({
      ...office,
      address: unwrapToString(office.address),
    }));
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
  replacedHub?: string;
  journalSync?: {
    upserted: number;
    deleted: number;
    total: number;
  };
};

function loc(en: string, th = "", pl = "") {
  const english = String(en || "").trim();
  return {
    en: english,
    th: String(th || "").trim() || english,
    pl: String(pl || "").trim() || english,
  };
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

  const { journalLocalePack } = await import("@/app/varsovia/liveLocaleOverlay");

  const keepTitles = new Set<string>();
  let upserted = 0;

  for (const seed of JOURNAL_ARTICLE_SEEDS) {
    const titleKey = seed.title.trim().toLowerCase();
    keepTitles.add(titleKey);
    const pack = journalLocalePack(seed.seedKey);
    const payload = {
      title: loc(seed.title, String(pack.th?.title || ""), String(pack.pl?.title || "")),
      excerpt: loc(
        seed.excerpt,
        String(pack.th?.excerpt || ""),
        String(pack.pl?.excerpt || "")
      ),
      content: loc(
        seed.excerpt,
        String(pack.th?.excerpt || ""),
        String(pack.pl?.excerpt || "")
      ),
      category: loc(
        seed.category,
        String(pack.th?.category || ""),
        String(pack.pl?.category || "")
      ),
      date: seed.date,
      readTime: loc(seed.readTime),
      image: seed.image,
      author: { name: loc(seed.author), avatar: "" },
      sections: [
        {
          heading: loc(
            seed.title,
            String(pack.th?.title || ""),
            String(pack.pl?.title || "")
          ),
          text: loc(
            seed.excerpt,
            String(pack.th?.excerpt || ""),
            String(pack.pl?.excerpt || "")
          ),
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

export async function hydrateVarsoviaSiteDocument(
  site: Record<string, unknown>
): Promise<{
  site: Record<string, unknown>;
  filled: number;
}> {
  const { mergeVarsoviaSiteDefaults } = await import("@/app/varsovia/siteDefaults");
  const { mergeIaPagesFromLiveSite } = await import("@/app/varsovia/mergeIaPages");
  const { buildVarsoviaLiveOverlays } = await import("@/app/varsovia/liveLocaleOverlay");
  const { hydrateCmsFromLiveLocales, countFilledLocaleFields } = await import(
    "@/lib/hydrateLiveLocales"
  );

  let merged = mergeVarsoviaSiteDefaults({ ...site });
  merged = {
    ...merged,
    pages: mergeIaPagesFromLiveSite(merged.pages),
  };
  const overlays = buildVarsoviaLiveOverlays();
  const hydrated = hydrateCmsFromLiveLocales(merged, overlays, {
    fillFromEnglish: true,
  });
  return {
    site: hydrated,
    filled: countFilledLocaleFields(
      pickVarsoviaSiteUpdate(site),
      pickVarsoviaSiteUpdate(hydrated)
    ),
  };
}
function locText(value: unknown, fallback = ""): { en: string; th: string; pl: string } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const map = value as Record<string, unknown>;
    const en = String(map.en || "").trim() || fallback;
    return {
      en,
      th: String(map.th || "").trim() || en,
      pl: String(map.pl || "").trim() || en,
    };
  }
  const en = (typeof value === "string" ? value.trim() : "") || fallback;
  return { en, th: en, pl: en };
}

/** Fill every Showcase item field so admin tabs match the live /projects card + detail. */
function completeShowcaseRecord(item: VarsoviaRecord): VarsoviaRecord {
  const image = String(item.image || "").trim();
  const typeLabel = locText(item.typeLabel, "Type");
  return {
    ...item,
    title: locText(item.title),
    category: locText(item.category).en || "Home case",
    location: locText(item.location),
    typeLabel,
    typeValue: locText(item.typeValue),
    supplyArea: locText(item.supplyArea),
    image,
    gallery: padShowcaseGallery(item.gallery, image),
    visible: item.visible !== false,
    order: typeof item.order === "number" && Number.isFinite(item.order) ? item.order : 0,
  };
}

export async function syncVarsoviaFromDb(
  replaceHubKey?: string,
  opts?: { replaceShowcase?: boolean }
): Promise<{
  success: boolean;
  message: string;
  report: VarsoviaSyncReport;
}> {
  const { faqTranslatedRow, buildVarsoviaLiveOverlays } = await import(
    "@/app/varsovia/liveLocaleOverlay"
  );
  const { hydrateCmsFromLiveLocales, countFilledLocaleFields } = await import(
    "@/lib/hydrateLiveLocales"
  );
  const { replaceIaHubFromLiveSeed } = await import("@/app/varsovia/mergeIaPages");
  const { IA_HUB_PATHS, SHOWCASE_LIVE_PATH } = await import("@/app/varsovia/iaPagesDefaults");
  const { replaceShowcaseFromLiveSeed } = await import("@/app/varsovia/siteDefaults");

  const replaceShowcase = opts?.replaceShowcase === true;
  const loaded = await getVarsoviaSite();
  const { site: hydrated, filled: overlayFilled } = await hydrateVarsoviaSiteDocument(loaded);
  let merged: Record<string, unknown> = replaceHubKey
    ? {
        ...hydrated,
        pages: replaceIaHubFromLiveSeed(hydrated.pages, replaceHubKey),
      }
    : hydrated;

  if (replaceShowcase) {
    merged = replaceShowcaseFromLiveSeed(merged);
    merged = hydrateCmsFromLiveLocales(merged, buildVarsoviaLiveOverlays(), {
      fillFromEnglish: true,
    }) as Record<string, unknown>;
  }

  let siteUpdated = false;
  let filledSiteKeys = replaceShowcase
    ? countFilledLocaleFields(pickVarsoviaSiteUpdate(loaded), pickVarsoviaSiteUpdate(merged))
    : overlayFilled;
  await updateVarsoviaSite(merged);
  siteUpdated = true;

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
        await Promise.all(
          items.map(async (item, itemIndex) => {
            if (!item?._id) return;
            let next = hydrateCmsFromLiveLocales(item, {}, { fillFromEnglish: true });
            if (resource === "showcases") {
              next = completeShowcaseRecord(next as VarsoviaRecord);
            }
            if (resource === "faqs") {
              const category =
                typeof item.category === "object" && item.category
                  ? String((item.category as { en?: string }).en || "")
                  : String(item.category || "");
              const idx = items
                .slice(0, itemIndex)
                .filter((row) => {
                  const other =
                    typeof row.category === "object" && row.category
                      ? String((row.category as { en?: string }).en || "")
                      : String(row.category || "");
                  return other === category;
                }).length;
              const thFaq = faqTranslatedRow(category, idx, "th");
              const plFaq = faqTranslatedRow(category, idx, "pl");
              next = hydrateCmsFromLiveLocales(
                next,
                {
                  th: {
                    question: thFaq?.question,
                    answer: thFaq?.answer,
                  },
                  pl: {
                    question: plFaq?.question,
                    answer: plFaq?.answer,
                  },
                },
                { fillFromEnglish: true }
              );
            }
            const filled = countFilledLocaleFields(item, next);
            if (!filled && resource !== "showcases") return;
            if (resource === "showcases") {
              const title = (next as VarsoviaRecord).title as
                | { en?: string }
                | string
                | undefined;
              const titleEn =
                typeof title === "string"
                  ? title.trim()
                  : String(title?.en || "").trim();
              if (!titleEn) return;
            }
            const { _id, __v, createdAt, updatedAt, ...body } = next as Record<
              string, unknown
            >;
            await updateVarsoviaRecord(resource, String(item._id), body);
            filledSiteKeys += filled;
          })
        );
      } catch {
        resources[resource] = resources[resource] ?? -1;
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

  const livePath = replaceHubKey
    ? IA_HUB_PATHS[replaceHubKey] || `/${replaceHubKey}`
    : replaceShowcase
      ? SHOWCASE_LIVE_PATH
      : "";

  return {
    success: true,
    message: livePath
      ? `Synced from Varsovia DB. This page now matches live ${livePath}. Filled ${filledSiteKeys} language fields across EN / TH / PL.`
      : `Synced from Varsovia DB. Filled ${filledSiteKeys} language fields across EN / TH / PL. Journal articles: ${journalSync?.total ?? 0} (${journalSync?.deleted ?? 0} extras removed).`,
    report: {
      database,
      host,
      siteId: "varsovia-kitchen",
      siteUpdated,
      preserved: !replaceHubKey && !replaceShowcase,
      resources,
      filledSiteKeys,
      replacedHub: replaceHubKey || (replaceShowcase ? "showcase" : undefined),
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

export { localizedValue } from "@/lib/localized";

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
