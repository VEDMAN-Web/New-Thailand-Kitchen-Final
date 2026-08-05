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
  | "showrooms";

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
  const { data } = await varsoviaApi.get("/site");
  return unwrapApiData<Record<string, unknown>>(data);
}

export async function updateVarsoviaSite(body: Record<string, unknown>) {
  const { data } = await varsoviaApi.put("/site", body);
  return unwrapApiData<Record<string, unknown>>(data);
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
