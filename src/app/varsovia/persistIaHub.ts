import { asLocalizedForm, localizedValue, type LocaleCode } from "@/lib/localized";
import { getVarsoviaSite, updateVarsoviaSite } from "@/services/varsoviaAPI";
import { liveChildDefault } from "@/app/varsovia/mergeIaPages";

function slugify(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function childSlug(item: { slug?: unknown; title?: unknown }) {
  return slugify(String(item.slug || "")) || slugify(localizedValue(item.title, "en"));
}

const CMS_LOCALES: LocaleCode[] = ["en", "th", "pl"];

function syncCardTitleIntoHero(
  hubKey: string,
  item: Record<string, unknown> & { slug?: unknown; title?: unknown; hero?: unknown }
): Record<string, unknown> {
  const seed = liveChildDefault(hubKey, String(item.slug || ""));
  const seedHeroRaw =
    seed?.hero && typeof seed.hero === "object"
      ? (seed.hero as Record<string, unknown>).title
      : "";
  const seedHero = asLocalizedForm(seedHeroRaw);
  const card = asLocalizedForm(item.title);
  const hero =
    item.hero && typeof item.hero === "object" && !Array.isArray(item.hero)
      ? { ...(item.hero as Record<string, unknown>) }
      : {};
  const heroTitle = asLocalizedForm(hero.title);
  const nextTitle = { ...heroTitle };
  for (const loc of CMS_LOCALES) {
    if (card[loc] && (!heroTitle[loc] || heroTitle[loc] === seedHero[loc])) {
      nextTitle[loc] = card[loc];
    }
  }
  return { ...item, hero: { ...hero, title: nextTitle } };
}

/**
 * Save one IA hub without replacing the rest of `site.pages`.
 * Patches onto the Mongo hub as stored (not a seed-filled snapshot), so a
 * stale furniture/locations view cannot wipe sibling hubs or custom copy.
 */
export async function persistIaHubPatch(
  hubKey: string,
  patchHub: Record<string, unknown>
) {
  console.log(`[persistIaHub] ===== START =====`, {
    hubKey,
    patchHubKeys: Object.keys(patchHub),
    hasChildren: Boolean(patchHub.children),
    childrenCount: Array.isArray(patchHub.children) ? patchHub.children.length : 0,
  });
  
  if (patchHub.hero && typeof patchHub.hero === 'object') {
    console.log(`[persistIaHub] Hub hero image:`, (patchHub.hero as any).image);
  }
  
  const site = await getVarsoviaSite();
  const storedPages =
    site.pages && typeof site.pages === "object" && !Array.isArray(site.pages)
      ? (site.pages as Record<string, unknown>)
      : {};
  const existing = (storedPages[hubKey] || {}) as Record<string, unknown>;
  
  console.log(`[persistIaHub] Existing hub data:`, {
    existingKeys: Object.keys(existing),
    existingChildrenCount: Array.isArray(existing.children) ? existing.children.length : 0,
  });
  
  let children = Array.isArray(patchHub.children)
    ? patchHub.children
    : Array.isArray(existing.children)
      ? existing.children
      : [];
  if (hubKey === "aboutBrand") {
    const hubHero =
      patchHub.hero && typeof patchHub.hero === "object"
        ? (patchHub.hero as Record<string, unknown>)
        : existing.hero && typeof existing.hero === "object"
          ? (existing.hero as Record<string, unknown>)
          : {};
    const hubImage = String(hubHero.image || "").trim();
    if (hubImage) {
      children = children.map((row) => {
        const child = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        if (String(child.slug || "").toLowerCase() !== "varsovia") return child;
        const hero =
          child.hero && typeof child.hero === "object"
            ? { ...(child.hero as Record<string, unknown>) }
            : {};
        return { ...child, hero: { ...hero, image: hubImage } };
      });
    }
  }
  
  const updatePayload = {
    pages: {
      [hubKey]: {
        ...existing,
        ...patchHub,
        slug: String(patchHub.slug || existing.slug || hubKey),
        children,
      },
    },
  };
  
  console.log(`[persistIaHub] Calling updateVarsoviaSite with:`, {
    hasPages: true,
    hubKey,
    childrenCount: children.length,
    persistPages: true,
  });
  
  await updateVarsoviaSite(updatePayload, { persistPages: true });
  
  console.log(`[persistIaHub] Reading back from server...`);
  const saved = await getVarsoviaSite();
  // Trust MongoDB data AS-IS - do NOT merge with defaults
  const resultPages = (saved.pages && typeof saved.pages === "object" && !Array.isArray(saved.pages))
    ? (saved.pages as Record<string, unknown>)
    : {};
    
  console.log(`[persistIaHub] ===== RESULT =====`, {
    hasSavedPages: Boolean(saved.pages),
    resultPagesKeys: Object.keys(resultPages),
    hasHubKey: Boolean(resultPages[hubKey]),
  });
  
  if (resultPages[hubKey]) {
    const resultHub = resultPages[hubKey] as Record<string, unknown>;
    console.log(`[persistIaHub] Result hub:`, {
      resultHubKeys: Object.keys(resultHub),
      resultChildrenCount: Array.isArray(resultHub.children) ? resultHub.children.length : 0,
      heroImage: resultHub.hero && typeof resultHub.hero === 'object' ? (resultHub.hero as any).image : 'no hero',
    });
  }
  
  return resultPages;
}

export async function persistIaHubChildren(
  hubKey: string,
  nextChildren: Array<Record<string, unknown> & { slug?: unknown; title?: unknown }>
) {
  const children: Record<string, unknown>[] = [];
  nextChildren.forEach((item, index) => {
    const slug = childSlug(item);
    if (!slug) return;
    children.push(syncCardTitleIntoHero(hubKey, { ...item, slug, order: index }));
  });
  return persistIaHubPatch(hubKey, { children });
}
