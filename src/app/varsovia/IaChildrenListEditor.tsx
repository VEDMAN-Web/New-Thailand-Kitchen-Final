"use client";

import MediaUpload from "@/components/MediaUpload";
import { uploadVarsoviaMedia } from "@/services/varsoviaAPI";
import {
  asLocalizedForm,
  emptyLocalized,
  localeFieldPlaceholder,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import { IA_HUB_PATHS } from "./iaPagesDefaults";

type IaChildRow = {
  slug: string;
  title?: unknown;
  metaTitle?: unknown;
  metaDescription?: unknown;
  body?: unknown;
  relatedTitle?: unknown;
  servicesTitle?: unknown;
  servicesSubtitle?: unknown;
  indexable?: boolean;
  order?: number;
  locationSlugs?: string[];
  sections?: Array<{
    heading?: unknown;
    text?: unknown;
    image?: string;
    imagePosition?: string;
    layout?: string;
  }>;
  hero?: {
    eyebrow?: unknown;
    title?: unknown;
    subtitle?: unknown;
    image?: string;
    ctaLabel?: unknown;
    ctaHref?: string;
  };
};

function asLoc(value: unknown): LocalizedText {
  return asLocalizedForm(value) || emptyLocalized();
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] font-normal text-[#6B7280] leading-snug">{children}</p>;
}

function liveChildPath(hubKey: string, slug: string) {
  const base = IA_HUB_PATHS[hubKey] || `/${hubKey}`;
  if (hubKey === "journal") return `/journal/topic/${slug}`;
  if (hubKey === "aboutBrand") return `/about/${slug}`;
  return `${base}/${slug}`;
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border border-[#E8EDF2] bg-white p-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">{title}</p>
        {hint ? <FieldHint>{hint}</FieldHint> : null}
      </div>
      {children}
    </div>
  );
}

function IndexableControl({
  checked,
  onChange,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  hint: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[#E8EDF2] bg-white px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#1A2332]">Indexable</p>
        <FieldHint>{hint}</FieldHint>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`inline-flex h-8 min-w-[3.25rem] shrink-0 items-center justify-center rounded-full px-3 text-[11px] font-bold tracking-wide ${
          checked ? "bg-emerald-600 text-white" : "bg-[#E2E8F0] text-[#64748B]"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}

export default function IaChildrenListEditor({
  value,
  onChange,
  locale,
  hubKey,
  embedded = false,
}: {
  value: unknown;
  onChange: (next: IaChildRow[]) => void;
  locale: LocaleCode;
  hubKey: string;
  /** Hide list chrome when this editor is used inside a single-page modal. */
  embedded?: boolean;
}) {
  const items: IaChildRow[] = Array.isArray(value) ? (value as IaChildRow[]) : [];

  const update = (index: number, patch: Partial<IaChildRow>) => {
    onChange(
      items.map((item, i) =>
        i === index
          ? { ...item, ...patch, slug: String(patch.slug ?? item.slug ?? "") }
          : item
      )
    );
  };

  const updateHero = (index: number, patch: NonNullable<IaChildRow["hero"]>) => {
    const item = items[index];
    update(index, { hero: { ...(item.hero || {}), ...patch } });
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, i) => ({ ...item, order: i })));
  };

  if (!items.length) {
    return (
      <div className="md:col-span-2 rounded-lg border border-dashed border-[#DDE1E7] px-4 py-6 text-sm text-[#6B7280]">
        No sub-pages yet for this section.
      </div>
    );
  }

  const isLocation = hubKey === "locations";
  const isAbout = hubKey === "aboutBrand";
  const isJournal = hubKey === "journal";
  const isCompleteInteriors = hubKey === "completeInteriors";

  return (
    <div className="md:col-span-2 space-y-4">
      {embedded ? null : (
        <>
          <div className="rounded-lg border border-[#E8EDF2] bg-white px-4 py-3 text-sm text-[#4B5563]">
            <p className="font-semibold text-[#1A2332]">Sub-pages = live URLs</p>
            <p className="mt-1 text-xs leading-relaxed">
              {isLocation
                ? "Field order matches the live city page: banner → intro → content blocks → services list → related projects → SEO."
                : isAbout
                  ? "Field order matches the live brand page: banner → intro → content blocks → SEO."
                  : isJournal
                    ? "Field order matches the live topic page: banner → intro → content blocks → articles in this topic → SEO."
                    : isCompleteInteriors
                      ? "Field order matches the live programme page: banner → intro → content blocks → related heading → SEO."
                  : "Field order matches the live page: banner → intro → content blocks → related heading → SEO."}{" "}
              Use ↑↓ to reorder Explore cards. Indexable OFF until photo + copy are final.
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
            Sub-pages ({items.length})
          </p>
        </>
      )}

      {items.map((item, index) => {
        const title = asLoc(item.title);
        const metaTitle = asLoc(item.metaTitle);
        const metaDescription = asLoc(item.metaDescription);
        const body = asLoc(item.body);
        const relatedTitle = asLoc(item.relatedTitle);
        const servicesTitle = asLoc(item.servicesTitle);
        const servicesSubtitle = asLoc(item.servicesSubtitle);
        const heroEyebrow = asLoc(item.hero?.eyebrow);
        const heroTitle = asLoc(item.hero?.title);
        const heroSubtitle = asLoc(item.hero?.subtitle);
        const ctaLabel = asLoc(item.hero?.ctaLabel);
        const liveUrl = liveChildPath(hubKey, item.slug || "slug");
        const tab = (value: unknown) => localizedValue(value, locale, { strict: true });

        return (
          <div
            key={item.slug || index}
            className={
              embedded
                ? "space-y-4"
                : "space-y-4 rounded-xl border border-[#E2E5EA] bg-[#F8FAFC] p-4"
            }
          >
            {embedded ? (
              <IndexableControl
                checked={item.indexable === true}
                onChange={(indexable) => update(index, { indexable })}
                hint={
                  isLocation
                    ? "OFF = noindex, omitted from sitemap. ON = Google can list this city URL."
                    : isAbout
                      ? "OFF = noindex, omitted from sitemap. ON = Google can list this brand URL."
                      : "OFF until final photo + copy."
                }
              />
            ) : (
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[#1A2332]">/{item.slug}</p>
                <p className="text-xs font-mono text-[#6B7280]">Live URL: {liveUrl}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="rounded border border-[#DDE1E7] bg-white px-2 py-1 text-xs font-semibold text-[#5C6370] disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      className="rounded border border-[#DDE1E7] bg-white px-2 py-1 text-xs font-semibold text-[#5C6370] disabled:opacity-40"
                    >
                      ↓
                    </button>
                <label className="inline-flex max-w-xs items-start gap-2 text-sm text-[#1A2332]">
                  <input
                    type="checkbox"
                    checked={item.indexable === true}
                    onChange={(e) => update(index, { indexable: e.target.checked })}
                    className="mt-0.5 rounded border-[#DDE1E7]"
                  />
                  <span>
                    <span className="font-medium">Indexable</span>
                    <FieldHint>
                      {isLocation
                        ? "OFF = noindex, omitted from sitemap. ON = Google can list this city URL."
                        : isAbout
                          ? "OFF = noindex, omitted from sitemap. ON = Google can list this brand URL."
                          : "OFF until final photo + copy."}
                    </FieldHint>
                  </span>
                </label>
              </div>
            </div>
            )}

            {hubKey === "services" ? (
              <label className="block text-xs font-semibold text-[#5C6370]">
                Cities that list this service
                <input
                  className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm font-mono"
                  placeholder="koh-samui, phuket, bangkok"
                  value={(item.locationSlugs || []).join(", ")}
                  onChange={(e) =>
                    update(index, {
                      locationSlugs: e.target.value
                        .split(",")
                        .map((s) => s.trim().toLowerCase())
                        .filter(Boolean),
                    })
                  }
                />
                <FieldHint>
                  Comma-separated location slugs → which /locations/* pages show this service.
                </FieldHint>
              </label>
            ) : null}

            <Group
              title="1 · Banner"
              hint={
                isLocation
                  ? "Live /locations/[city] top: photo, heading, tagline, button. Card photo + name + tagline also appear on /locations."
                  : isAbout
                    ? "Live /about/[brand] top: photo, heading, tagline, button. Card photo + name + tagline also appear on /about."
                    : hubKey === "services"
                      ? "Live /services/[slug] top: photo, heading, tagline, button. Card photo + name also appear on /services."
                      : isCompleteInteriors
                        ? "Live /complete-interiors/[slug] top: photo, heading, tagline, button. Card photo + name also appear on /complete-interiors."
                        : isJournal
                          ? "Live /journal/topic/[slug] top: photo, heading, tagline, button. Card photo + name also appear on /journal."
                          : "Same fields as the live page top: photo, heading, description, button."
              }
            >
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Card / nav title
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    placeholder={localeFieldPlaceholder(locale)}
                    value={tab(title)}
                    onChange={(e) => {
                      const next = e.target.value;
                      const prevCard = localizedValue(title, locale);
                      const prevHero = localizedValue(heroTitle, locale);
                      const patch: Partial<IaChildRow> = {
                        title: writeLocalized(title, locale, next),
                      };
                      if (!prevHero || prevHero === prevCard) {
                        patch.hero = {
                          ...(item.hero || {}),
                          title: writeLocalized(heroTitle, locale, next),
                        };
                      }
                      update(index, patch);
                    }}
                  />
                  {isLocation ? (
                    <FieldHint>
                      City name on /locations cards, mega-menu, and breadcrumbs.
                    </FieldHint>
                  ) : isAbout ? (
                    <FieldHint>
                      Brand name on /about cards, mega-menu, and breadcrumbs.
                    </FieldHint>
                  ) : hubKey === "services" ? (
                    <FieldHint>
                      Service name on /services cards and breadcrumbs.
                    </FieldHint>
                  ) : isCompleteInteriors ? (
                    <FieldHint>
                      Programme name on /complete-interiors cards and breadcrumbs.
                    </FieldHint>
                  ) : isJournal ? (
                    <FieldHint>
                      Topic name on /journal cards and breadcrumbs.
                    </FieldHint>
                  ) : null}
                </label>
                <div className="md:col-span-2">
                  <MediaUpload
                    label="Banner photo"
                    kind="image"
                    value={String(item.hero?.image || "")}
                    onChange={(url) => updateHero(index, { image: url })}
                    uploadFile={uploadVarsoviaMedia}
                  />
                </div>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Tag (optional)
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    placeholder={localeFieldPlaceholder(locale)}
                    value={tab(heroEyebrow)}
                    onChange={(e) =>
                      updateHero(index, {
                        eyebrow: writeLocalized(heroEyebrow, locale, e.target.value),
                      })
                    }
                  />
                </label>
                <label className="md:col-span-2 block text-xs font-semibold text-[#5C6370]">
                  Heading
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    placeholder={localeFieldPlaceholder(locale)}
                    value={tab(heroTitle)}
                    onChange={(e) =>
                      updateHero(index, {
                        title: writeLocalized(heroTitle, locale, e.target.value),
                      })
                    }
                  />
                  {isLocation ? (
                    <FieldHint>H1 on the /locations/[city] banner.</FieldHint>
                  ) : isAbout ? (
                    <FieldHint>H1 on the /about/[brand] banner.</FieldHint>
                  ) : hubKey === "services" ? (
                    <FieldHint>H1 on the /services/[slug] banner.</FieldHint>
                  ) : null}
                </label>
                <label className="md:col-span-2 block text-xs font-semibold text-[#5C6370]">
                  Description
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    placeholder={localeFieldPlaceholder(locale)}
                    value={tab(heroSubtitle)}
                    onChange={(e) =>
                      updateHero(index, {
                        subtitle: writeLocalized(heroSubtitle, locale, e.target.value),
                      })
                    }
                  />
                  {isLocation ? (
                    <FieldHint>
                      Tagline under the city name on /locations cards and on the city banner.
                    </FieldHint>
                  ) : isAbout ? (
                    <FieldHint>
                      Tagline under the brand name on /about cards and on the brand banner.
                    </FieldHint>
                  ) : null}
                </label>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Button text
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={tab(ctaLabel)}
                    onChange={(e) =>
                      updateHero(index, {
                        ctaLabel: writeLocalized(ctaLabel, locale, e.target.value),
                      })
                    }
                  />
                  <FieldHint>Clear to hide the button.</FieldHint>
                </label>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Button link
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm font-mono"
                    value={String(item.hero?.ctaHref || "")}
                    onChange={(e) => updateHero(index, { ctaHref: e.target.value })}
                    placeholder="/contact"
                  />
                </label>
              </div>
            </Group>

            <Group title="2 · Intro paragraph">
              <label className="block text-xs font-semibold text-[#5C6370]">
                Intro paragraph
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                  value={tab(body)}
                  onChange={(e) =>
                    update(index, {
                      body: writeLocalized(body, locale, e.target.value),
                    })
                  }
                />
              </label>
            </Group>

            <Group
              title="3 · Content blocks"
              hint="Same photo + heading + text cards as the live page."
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const sections = Array.isArray(item.sections) ? [...item.sections] : [];
                    sections.push({
                      heading: emptyLocalized(),
                      text: emptyLocalized(),
                      image: "",
                      imagePosition: sections.length % 2 === 0 ? "left" : "right",
                      layout: "band",
                    });
                    update(index, { sections });
                  }}
                  className="rounded-lg border border-dashed border-[#B9C0CA] px-3 py-1.5 text-xs font-semibold text-[#5C6370]"
                >
                  + Add block
                </button>
              </div>
              {(Array.isArray(item.sections) ? item.sections : []).map((sec, sIdx) => {
                const heading = asLoc(sec.heading);
                const text = asLoc(sec.text);
                const sections = Array.isArray(item.sections) ? item.sections : [];
                return (
                  <div
                    key={sIdx}
                    className="space-y-2 rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#5C6370]">Block {sIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          update(index, {
                            sections: sections.filter((_, i) => i !== sIdx),
                          })
                        }
                        className="text-xs font-semibold text-[#B42318]"
                      >
                        Remove
                      </button>
                    </div>
                    <MediaUpload
                      label={`Block ${sIdx + 1} photo`}
                      kind="image"
                      value={String(sec.image || "")}
                      onChange={(url) => {
                        const next = sections.map((current, i) =>
                          i === sIdx ? { ...current, image: url } : current,
                        );
                        update(index, { sections: next });
                      }}
                      uploadFile={uploadVarsoviaMedia}
                    />
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Heading
                      <input
                        className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                        value={tab(heading)}
                        onChange={(e) => {
                          const next = sections.map((current, i) =>
                            i === sIdx
                              ? {
                                  ...current,
                                  heading: writeLocalized(heading, locale, e.target.value),
                                }
                              : current,
                          );
                          update(index, { sections: next });
                        }}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Text
                      <textarea
                        rows={3}
                        className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                        value={tab(text)}
                        onChange={(e) => {
                          const next = sections.map((current, i) =>
                            i === sIdx
                              ? {
                                  ...current,
                                  text: writeLocalized(text, locale, e.target.value),
                                }
                              : current,
                          );
                          update(index, { sections: next });
                        }}
                      />
                    </label>
                  </div>
                );
              })}
            </Group>

            {isLocation ? (
              <Group
                title="4 · Services in this location"
                hint="Heading on the live city page above the service cards."
              >
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Services heading
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={tab(servicesTitle)}
                    onChange={(e) =>
                      update(index, {
                        servicesTitle: writeLocalized(
                          servicesTitle,
                          locale,
                          e.target.value,
                        ),
                      })
                    }
                    placeholder="Services in this location"
                  />
                </label>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Services subtitle
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={tab(servicesSubtitle)}
                    onChange={(e) =>
                      update(index, {
                        servicesSubtitle: writeLocalized(
                          servicesSubtitle,
                          locale,
                          e.target.value,
                        ),
                      })
                    }
                    placeholder="How we support homes and projects here."
                  />
                </label>
                <FieldHint>
                  Cards (Custom Furniture, Interior Design, …) come from Services
                  tagged with this city slug. Leave heading blank to use the default.
                </FieldHint>
              </Group>
            ) : null}

            {isAbout ? null : (
            <Group
              title={
                isLocation
                  ? "5 · Related projects heading"
                  : isJournal
                    ? "4 · Articles in this topic"
                    : "4 · Related projects heading"
              }
              hint={
                isJournal
                  ? "Shown above matching journal articles on /journal/topic/[slug]."
                  : "Shown above related projects / articles on this page."
              }
            >
              <label className="block text-xs font-semibold text-[#5C6370]">
                Related section title
                <input
                  className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                  value={tab(relatedTitle)}
                  onChange={(e) =>
                    update(index, {
                      relatedTitle: writeLocalized(relatedTitle, locale, e.target.value),
                    })
                  }
                  placeholder={isJournal ? "Articles in this topic" : "Related projects"}
                />
              </label>
            </Group>
            )}

            <Group
              title={
                isLocation
                  ? "6 · Google / SEO"
                  : isAbout
                    ? "4 · Google / SEO"
                    : "5 · Google / SEO"
              }
              hint={
                isLocation
                  ? "Browser tab, Google snippet, and share preview. Banner photo is the Open Graph / Twitter image. City pages also emit LocalBusiness JSON-LD."
                  : isAbout
                    ? "Browser tab, Google snippet, and share preview. Banner photo is the Open Graph / Twitter image."
                    : "Browser tab, Google snippet, and share preview. Banner photo is the Open Graph / Twitter image."
              }
            >
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Google title ({tab(metaTitle).length}/60)
                  <input
                    maxLength={60}
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={tab(metaTitle)}
                    onChange={(e) =>
                      update(index, {
                        metaTitle: writeLocalized(
                          metaTitle,
                          locale,
                          e.target.value.slice(0, 60),
                        ),
                      })
                    }
                  />
                  <FieldHint>
                    Browser tab + Google headline. Keep under 60. Brand is not added twice if you already include “| Varsovia Design”.
                  </FieldHint>
                </label>
                <label className="md:col-span-2 block text-xs font-semibold text-[#5C6370]">
                  Google description ({tab(metaDescription).length}/160)
                  <textarea
                    rows={2}
                    maxLength={160}
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={tab(metaDescription)}
                    onChange={(e) =>
                      update(index, {
                        metaDescription: writeLocalized(
                          metaDescription,
                          locale,
                          e.target.value.slice(0, 160),
                        ),
                      })
                    }
                  />
                  {isLocation ? (
                    <FieldHint>
                      Unique per city. Live default: “City by Varsovia Design — [banner tagline]”. Max 160.
                    </FieldHint>
                  ) : isAbout ? (
                    <FieldHint>
                      Unique per brand. Live default: “Brand by Varsovia Design — [banner tagline]”. Max 160.
                    </FieldHint>
                  ) : (
                    <FieldHint>
                      Unique per page. Live default: “Title by Varsovia Design — [banner tagline]”. Max 160.
                    </FieldHint>
                  )}
                </label>
              </div>
            </Group>
          </div>
        );
      })}
    </div>
  );
}
