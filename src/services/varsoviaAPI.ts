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
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
  },
  timeout: 95000,
});

varsoviaApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // Add cache-busting timestamp to all requests
    const cacheBuster = `_t=${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    if (config.url) {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}${cacheBuster}`;
    }
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

export async function updateVarsoviaSite(
  body: Record<string, unknown>,
  opts?: { persistPages?: boolean }
) {
  const picked = pickVarsoviaSiteUpdate(body);
  const explicitKeys = Object.keys(body).filter(
    (key) => key !== "_id" && key !== "key" && key !== "__v"
  );
  const pagesOnlyPatch = explicitKeys.length === 1 && explicitKeys[0] === "pages";
  if (!opts?.persistPages && !pagesOnlyPatch) {
    delete picked.pages;
  }
  
  console.log(`[varsoviaAPI] Updating site content`, {
    timestamp: new Date().toISOString(),
    fieldCount: Object.keys(picked).length,
    hasPages: Boolean(picked.pages),
  });
  
  const { data } = await varsoviaApi.put("/site", picked);
  const result = unwrapApiData<Record<string, unknown>>(data);
  
  console.log(`[varsoviaAPI] Site update successful`, {
    timestamp: new Date().toISOString(),
  });
  
  return result;
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
  catalogueSync?: {
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
  const {
    JOURNAL_ARTICLE_SEEDS,
    JOURNAL_AUTHOR_AVATARS,
    JOURNAL_DETAIL_COPY,
    journalDetailCmsSections,
    isThinJournalArticleSections,
  } = await import("@/app/varsovia/journalArticlesSeed");

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
    const match = byTitle.get(titleKey);
    const existingAuthor =
      match?.author && typeof match.author === "object"
        ? (match.author as Record<string, unknown>)
        : {};
    const existingAvatar = String(existingAuthor.avatar || "").trim();
    const keepSections =
      match && !isThinJournalArticleSections(match.sections) ? match.sections : null;

    const payload = {
      title: loc(seed.title, String(pack.th?.title || ""), String(pack.pl?.title || "")),
      excerpt: loc(
        seed.excerpt,
        String(pack.th?.excerpt || ""),
        String(pack.pl?.excerpt || "")
      ),
      content: loc(JOURNAL_DETAIL_COPY.intro),
      category: seed.category,
      date: seed.date,
      readTime: loc(seed.readTime),
      image: seed.image,
      author: {
        name: loc(seed.author),
        avatar: existingAvatar || JOURNAL_AUTHOR_AVATARS[seed.author] || "",
      },
      sections: keepSections || journalDetailCmsSections(loc),
      views:
        typeof match?.views === "number" && Number.isFinite(match.views)
          ? match.views
          : 0,
      order: seed.order,
      visible: true,
    };

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

function catalogueTitleEn(item: VarsoviaRecord): string {
  const title = item.title;
  if (typeof title === "string") return title.trim();
  if (title && typeof title === "object") {
    const map = title as Record<string, unknown>;
    return String(map.en || map.th || map.pl || "").trim();
  }
  return "";
}

function isUploadedCataloguePdf(url: string): boolean {
  const value = String(url || "").trim();
  if (!value || value === "/catalogue" || value === "/catalogue/") return false;
  return /\.pdf($|\?)/i.test(value) || /\/media\//i.test(value) || /^https?:\/\//i.test(value);
}

/** Mirror live /catalogue brochure cards: upsert the 6 seed covers, delete extras. */
async function syncCatalogueBrochuresMirror(): Promise<{
  upserted: number;
  deleted: number;
  total: number;
}> {
  const { CATALOGUE_BROCHURE_SEEDS } = await import("@/app/varsovia/cataloguesSeed");
  const existing = await listVarsoviaRecords("catalogues");
  const unused = [...existing];

  const takeMatch = (seedTitle: string, seedOrder: number): VarsoviaRecord | undefined => {
    const titleKey = seedTitle.trim().toLowerCase();
    const titleIndex = unused.findIndex(
      (row) => catalogueTitleEn(row).toLowerCase() === titleKey
    );
    if (titleIndex >= 0) return unused.splice(titleIndex, 1)[0];
    const orderIndex = unused.findIndex((row) => Number(row.order) === seedOrder);
    if (orderIndex >= 0) return unused.splice(orderIndex, 1)[0];
    return undefined;
  };

  let upserted = 0;
  for (const seed of CATALOGUE_BROCHURE_SEEDS) {
    const match = takeMatch(seed.title.en, seed.order);
    const existingPdf = String(match?.downloadUrl || "").trim();
    const payload = {
      title: { en: seed.title.en, th: seed.title.th, pl: seed.title.pl },
      coverImage: seed.coverImage,
      downloadUrl: isUploadedCataloguePdf(existingPdf) ? existingPdf : seed.downloadUrl,
      visible: true,
      order: seed.order,
    };
    if (match?._id) {
      await updateVarsoviaRecord("catalogues", match._id, payload);
    } else {
      await createVarsoviaRecord("catalogues", payload);
    }
    upserted += 1;
  }

  let deleted = 0;
  for (const row of unused) {
    if (!row._id) continue;
    await deleteVarsoviaRecord("catalogues", row._id);
    deleted += 1;
  }

  return {
    upserted,
    deleted,
    total: CATALOGUE_BROCHURE_SEEDS.length,
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

/** Fill Journal article fields so admin tabs match live /journal cards + /journal/p/[id]. */
function completeBlogRecord(item: VarsoviaRecord): VarsoviaRecord {
  const image = String(item.image || "").trim();
  const author =
    item.author && typeof item.author === "object"
      ? (item.author as Record<string, unknown>)
      : {};
  const categoryRaw = item.category;
  const category =
    typeof categoryRaw === "string"
      ? categoryRaw.trim()
      : locText(categoryRaw).en;
  return {
    ...item,
    title: locText(item.title),
    excerpt: locText(item.excerpt),
    content: locText(item.content),
    category,
    readTime: locText(item.readTime),
    image,
    author: {
      name: locText(author.name),
      avatar: String(author.avatar || "").trim(),
    },
    visible: item.visible !== false,
    order: typeof item.order === "number" && Number.isFinite(item.order) ? item.order : 0,
  };
}

/** Fill catalogue brochure titles so admin tabs match live /catalogue cards. */
function completeCatalogueRecord(item: VarsoviaRecord): VarsoviaRecord {
  return {
    ...item,
    title: locText(item.title),
    coverImage: String(item.coverImage || "").trim(),
    downloadUrl: String(item.downloadUrl || "").trim(),
    visible: item.visible !== false,
    order: typeof item.order === "number" && Number.isFinite(item.order) ? item.order : 0,
  };
}

function completeProjectRecord(item: VarsoviaRecord): VarsoviaRecord {
  const coverImage = String(item.coverImage || "").trim();
  const gallery = Array.isArray(item.gallery)
    ? item.gallery.map((url) => String(url || "").trim()).filter(Boolean)
    : [];
  return {
    ...item,
    title: locText(item.title),
    description: locText(item.description),
    location: locText(item.location),
    detailTitle: locText(item.detailTitle),
    detailDescription: locText(item.detailDescription),
    narrativeOne: locText(item.narrativeOne),
    narrativeTwo: locText(item.narrativeTwo),
    coverImage,
    gallery: gallery.length ? gallery : coverImage ? [coverImage] : [],
    visible: item.visible !== false,
    order: typeof item.order === "number" && Number.isFinite(item.order) ? item.order : 0,
  };
}

function completeTeamRecord(item: VarsoviaRecord): VarsoviaRecord {
  return {
    ...item,
    name: locText(item.name),
    role: locText(item.role),
    image: String(item.image || "").trim(),
    visible: item.visible !== false,
    order: typeof item.order === "number" && Number.isFinite(item.order) ? item.order : 0,
  };
}

export async function syncVarsoviaFromDb(
  replaceHubKey?: string,
  opts?: {
    replaceShowcase?: boolean;
    replaceCatalogue?: boolean;
    replaceTeam?: boolean;
    replaceQuality?: boolean;
    replaceContact?: boolean;
    replaceFaq?: boolean;
    replaceFooter?: boolean;
  }
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
  const { mergeIaPagesFromLiveSite } = await import("@/app/varsovia/mergeIaPages");
  const { IA_HUB_PATHS, SHOWCASE_LIVE_PATH, CATALOGUE_LIVE_PATH, TEAM_LIVE_PATH, QUALITY_LIVE_PATH, CONTACT_LIVE_PATH, FAQ_LIVE_PATH, FOOTER_LIVE_PATH } = await import(
    "@/app/varsovia/iaPagesDefaults"
  );
  const {
    replaceShowcaseFromLiveSeed,
    replaceCatalogueFromLiveSeed,
    replaceTeamFromLiveSeed,
    replaceQualityFromLiveSeed,
    replaceContactFromLiveSeed,
    replaceFaqFromLiveSeed,
    replaceFooterFromLiveSeed,
  } =
    await import("@/app/varsovia/siteDefaults");

  const replaceShowcase = opts?.replaceShowcase === true;
  const replaceCatalogue = opts?.replaceCatalogue === true;
  const replaceTeam = opts?.replaceTeam === true;
  const replaceQuality = opts?.replaceQuality === true;
  const replaceContact = opts?.replaceContact === true;
  const replaceFaq = opts?.replaceFaq === true;
  const replaceFooter = opts?.replaceFooter === true;
  const pageReplace = Boolean(
    replaceHubKey ||
      replaceShowcase ||
      replaceCatalogue ||
      replaceTeam ||
      replaceQuality ||
      replaceContact ||
      replaceFaq ||
      replaceFooter
  );
  const loaded = await getVarsoviaSite();
  const { site: hydrated } = await hydrateVarsoviaSiteDocument(loaded);
  let merged: Record<string, unknown> = {
    ...hydrated,
    pages: mergeIaPagesFromLiveSite(hydrated.pages, { fillLive: true }),
  };

  if (replaceShowcase) merged = replaceShowcaseFromLiveSeed(merged);
  if (replaceCatalogue) merged = replaceCatalogueFromLiveSeed(merged);
  if (replaceTeam) merged = replaceTeamFromLiveSeed(merged);
  if (replaceQuality) merged = replaceQualityFromLiveSeed(merged);
  if (replaceContact) merged = replaceContactFromLiveSeed(merged);
  if (replaceFaq) merged = replaceFaqFromLiveSeed(merged);
  if (replaceFooter) merged = replaceFooterFromLiveSeed(merged);
  merged = hydrateCmsFromLiveLocales(merged, buildVarsoviaLiveOverlays(), {
    fillFromEnglish: true,
  }) as Record<string, unknown>;

  let siteUpdated = false;
  const filledSiteKeys = countFilledLocaleFields(
    pickVarsoviaSiteUpdate(loaded),
    pickVarsoviaSiteUpdate(merged)
  );
  await updateVarsoviaSite(merged, { persistPages: true });
  siteUpdated = true;

  let filledCount = filledSiteKeys;

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

  let catalogueSync: VarsoviaSyncReport["catalogueSync"];
  if (replaceCatalogue) {
    try {
      catalogueSync = await syncCatalogueBrochuresMirror();
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Catalogue brochures sync failed: ${error.message}`
          : "Catalogue brochures sync failed"
      );
    }
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
            if (resource === "blogs") {
              next = completeBlogRecord(next as VarsoviaRecord);
            }
            if (resource === "catalogues") {
              next = completeCatalogueRecord(next as VarsoviaRecord);
            }
            if (resource === "team-members") {
              next = completeTeamRecord(next as VarsoviaRecord);
            }
            if (resource === "projects") {
              next = completeProjectRecord(next as VarsoviaRecord);
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
            const alwaysWrite =
              resource === "showcases" ||
              resource === "blogs" ||
              resource === "catalogues" ||
              resource === "team-members" ||
              resource === "projects";
            const filled = countFilledLocaleFields(item, next);
            if (!filled && !alwaysWrite) return;
            if (alwaysWrite) {
              const label =
                resource === "team-members"
                  ? (next as VarsoviaRecord).name
                  : (next as VarsoviaRecord).title;
              const titleEn =
                typeof label === "string"
                  ? label.trim()
                  : String((label as { en?: string } | undefined)?.en || "").trim();
              if (!titleEn) return;
            }
            const { _id, __v, createdAt, updatedAt, ...body } = next as Record<
              string, unknown
            >;
            await updateVarsoviaRecord(resource, String(item._id), body);
            filledCount += filled;
          })
        );
      } catch {
        resources[resource] = resources[resource] ?? -1;
      }
    })
  );

  const host = "varsovia-api";
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
      : replaceCatalogue
        ? CATALOGUE_LIVE_PATH
        : replaceTeam
          ? TEAM_LIVE_PATH
          : replaceQuality
            ? QUALITY_LIVE_PATH
            : replaceContact
              ? CONTACT_LIVE_PATH
              : replaceFaq
                ? FAQ_LIVE_PATH
                : replaceFooter
                  ? FOOTER_LIVE_PATH
                  : "";

  return {
    success: true,
    message: livePath
      ? `Synced from Varsovia DB. Admin now matches live ${livePath} (copy + images). Filled ${filledCount} language fields across EN / TH / PL.`
      : `Synced from Varsovia DB. Admin now matches the live site across all pages (copy + images). Filled ${filledCount} language fields. Journal articles: ${journalSync?.total ?? 0} (${journalSync?.deleted ?? 0} extras removed).`,
    report: {
      database,
      host,
      siteId: "varsovia-kitchen",
      siteUpdated,
      preserved: !pageReplace,
      resources,
      filledSiteKeys: filledCount,
      replacedHub:
        replaceHubKey ||
        (replaceShowcase ? "showcase" : undefined) ||
        (replaceCatalogue ? "catalogue" : undefined) ||
        (replaceTeam ? "team" : undefined) ||
        (replaceQuality ? "quality" : undefined) ||
        (replaceContact ? "contact" : undefined) ||
        (replaceFaq ? "faq" : undefined) ||
        (replaceFooter ? "footer" : undefined),
      journalSync,
      catalogueSync,
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
  console.log(`[varsoviaAPI] Updating ${resource}/${id}`, {
    timestamp: new Date().toISOString(),
    bodyKeys: Object.keys(body),
  });
  
  const { data } = await varsoviaApi.put(`/${resource}/${id}`, body);
  const result = unwrapApiData<VarsoviaRecord>(data);
  
  console.log(`[varsoviaAPI] Update successful for ${resource}/${id}`, {
    timestamp: new Date().toISOString(),
    resultId: result._id,
  });
  
  return result;
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

export async function deleteVarsoviaContact(id: string) {
  const { data } = await varsoviaApi.delete(`/contacts/${id}`);
  return unwrapApiData<{ deleted?: boolean }>(data);
}

function adminBearerToken() {
  if (typeof window === "undefined") return "";
  const token = localStorage.getItem("admin_token")?.trim();
  return token ? `Bearer ${token}` : "";
}

/** Upload image/PDF via the admin proxy (JWT must be on the request — axios FormData drops it). */
export async function uploadVarsoviaMedia(
  file: File,
  kind: "image" | "icon" | "pdf" | "any" = "image"
) {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  const authorization = adminBearerToken();
  if (!authorization) {
    throw new Error("Sign in again, then retry the image upload.");
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 120000);
  let res: Response;
  try {
    res = await fetch(
      `/varsovia-api/media?kind=${encodeURIComponent(kind)}`,
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "X-Admin-Authorization": authorization,
        },
        body: form,
        signal: controller.signal,
      }
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Upload timed out. Try a smaller file.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    throw new Error(
      readEnvelopeError(data, "Sign in again, then retry the image upload.")
    );
  }
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
