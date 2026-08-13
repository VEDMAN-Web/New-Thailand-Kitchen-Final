/** Sync home-section selection without Next.js navigations (avoids Suspense flicker). */
export const ADMIN_SECTION_EVENT = "tk-admin-section";

/** Fired after a successful CMS sync so open editors can reload from DB. */
export const CMS_SYNCED_EVENT = "tk-cms-synced";

export function emitCmsSynced(detail?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CMS_SYNCED_EVENT, { detail: detail || {} })
  );
}

/** Varsovia CMS resource/section changes on `/varsovia` without Next navigations. */
export const VARSOVIA_NAV_EVENT = "varsovia-admin-nav";

export type VarsoviaNavDetail = {
  resource: string;
  section: string | null;
};

export function readAdminSectionFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get("section");
  } catch {
    return null;
  }
}

export function writeAdminSectionToUrl(section: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!section || section === "hero") {
    url.searchParams.delete("section");
  } else {
    url.searchParams.set("section", section);
  }
  // Hub focus is only meaningful on Kitchens / Services / Materials / Locations overview pages
  if (section !== "hubPages") {
    url.searchParams.delete("hub");
  }
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);
  window.dispatchEvent(
    new CustomEvent(ADMIN_SECTION_EVENT, { detail: section || "hero" })
  );
}

export function readVarsoviaNavFromUrl(): VarsoviaNavDetail {
  if (typeof window === "undefined") {
    return { resource: "site", section: null };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      resource: params.get("resource") || "site",
      section: params.get("section"),
    };
  } catch {
    return { resource: "site", section: null };
  }
}

/**
 * Update `/varsovia?resource=&section=` via history.replaceState — no Suspense flicker.
 * Dispatches VARSOVIA_NAV_EVENT (+ ADMIN_SECTION_EVENT when resource is site).
 */
export function writeVarsoviaNav(resource: string, section: string | null = null) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.pathname = "/varsovia";
  url.searchParams.set("resource", resource || "site");

  const normalizedSection =
    resource === "site" && section && section !== "hero" ? section : null;

  if (normalizedSection) {
    url.searchParams.set("section", normalizedSection);
  } else {
    url.searchParams.delete("section");
  }

  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", next);

  const detail: VarsoviaNavDetail = {
    resource: resource || "site",
    section: normalizedSection,
  };
  window.dispatchEvent(new CustomEvent(VARSOVIA_NAV_EVENT, { detail }));

  if (detail.resource === "site") {
    window.dispatchEvent(
      new CustomEvent(ADMIN_SECTION_EVENT, {
        detail: detail.section || "hero",
      })
    );
  }
}
