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

/** Save one IA hub without replacing the rest of `site.pages`. */
export async function persistIaHubPatch(
  hubKey: string,
  patchHub: Record<string, unknown>
) {
  const site = await getVarsoviaSite();
  
  const storedPages =
    site.pages && typeof site.pages === "object" && !Array.isArray(site.pages)
      ? (site.pages as Record<string, unknown>)
      : {};
  const existing = (storedPages[hubKey] || {}) as Record<string, unknown>;
  
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
  
  const existingHero =
    existing.hero && typeof existing.hero === "object" && !Array.isArray(existing.hero)
      ? (existing.hero as Record<string, unknown>)
      : {};
  const patchHero =
    patchHub.hero && typeof patchHub.hero === "object" && !Array.isArray(patchHub.hero)
      ? (patchHub.hero as Record<string, unknown>)
      : {};

  const updatePayload = {
    pages: {
      [hubKey]: {
        ...existing,
        ...patchHub,
        slug: String(patchHub.slug || existing.slug || hubKey),
        hero: { ...existingHero, ...patchHero },
        children,
      },
    },
  };

  const savedSite = await updateVarsoviaSite(updatePayload, { persistPages: true });
  const savedPages =
    savedSite.pages && typeof savedSite.pages === "object" && !Array.isArray(savedSite.pages)
      ? (savedSite.pages as Record<string, unknown>)
      : {};
  return savedPages;
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
