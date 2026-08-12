"use client";

import MediaUpload from "@/components/MediaUpload";
import {
  asLocalizedForm,
  emptyLocalized,
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

export default function IaChildrenListEditor({
  value,
  onChange,
  locale,
  hubKey,
}: {
  value: unknown;
  onChange: (next: IaChildRow[]) => void;
  locale: LocaleCode;
  hubKey: string;
}) {
  const items: IaChildRow[] = Array.isArray(value) ? (value as IaChildRow[]) : [];

  const update = (index: number, patch: Partial<IaChildRow>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
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

  return (
    <div className="md:col-span-2 space-y-4">
      <div className="rounded-lg border border-[#E8EDF2] bg-white px-4 py-3 text-sm text-[#4B5563]">
        <p className="font-semibold text-[#1A2332]">Sub-pages = live URLs</p>
        <p className="mt-1 text-xs leading-relaxed">
          Field order matches the live page: banner → intro → content blocks → related heading → SEO.
          Use ↑↓ to reorder Explore cards. Indexable OFF until photo + copy are final.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">
        Sub-pages ({items.length})
      </p>

      {items.map((item, index) => {
        const title = asLoc(item.title);
        const metaTitle = asLoc(item.metaTitle);
        const metaDescription = asLoc(item.metaDescription);
        const body = asLoc(item.body);
        const relatedTitle = asLoc(item.relatedTitle);
        const heroEyebrow = asLoc(item.hero?.eyebrow);
        const heroTitle = asLoc(item.hero?.title);
        const heroSubtitle = asLoc(item.hero?.subtitle);
        const ctaLabel = asLoc(item.hero?.ctaLabel);
        const liveUrl = liveChildPath(hubKey, item.slug || "slug");

        return (
          <div
            key={item.slug || index}
            className="space-y-4 rounded-xl border border-[#E2E5EA] bg-[#F8FAFC] p-4"
          >
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
                    <FieldHint>OFF until final photo + copy.</FieldHint>
                  </span>
                </label>
              </div>
            </div>

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

            <Group title="1 · Banner (Hero)" hint="Same fields as the live page top.">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Card / nav title
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(title, locale)}
                    onChange={(e) =>
                      update(index, {
                        title: writeLocalized(title, locale, e.target.value),
                      })
                    }
                  />
                </label>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Eyebrow (optional)
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(heroEyebrow, locale)}
                    onChange={(e) =>
                      updateHero(index, {
                        eyebrow: writeLocalized(heroEyebrow, locale, e.target.value),
                      })
                    }
                  />
                </label>
                <label className="md:col-span-2 block text-xs font-semibold text-[#5C6370]">
                  Headline (H1)
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(heroTitle, locale)}
                    onChange={(e) =>
                      updateHero(index, {
                        title: writeLocalized(heroTitle, locale, e.target.value),
                      })
                    }
                  />
                </label>
                <label className="md:col-span-2 block text-xs font-semibold text-[#5C6370]">
                  Intro line under headline
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(heroSubtitle, locale)}
                    onChange={(e) =>
                      updateHero(index, {
                        subtitle: writeLocalized(heroSubtitle, locale, e.target.value),
                      })
                    }
                  />
                </label>
                <div className="md:col-span-2">
                  <MediaUpload
                    label="Banner photo"
                    kind="image"
                    value={String(item.hero?.image || "")}
                    onChange={(url) => updateHero(index, { image: url })}
                  />
                </div>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Button text
                  <input
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(ctaLabel, locale)}
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
                  value={localizedValue(body, locale)}
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
              hint="Image + text blocks. Layout: Band / Spotlight / Editorial / Overlay / Rail."
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
                      layout: "auto",
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
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Heading
                      <input
                        className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                        value={localizedValue(heading, locale)}
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
                        value={localizedValue(text, locale)}
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
                    <MediaUpload
                      label={`Block ${sIdx + 1} — Photo`}
                      kind="image"
                      value={String(sec.image || "")}
                      onChange={(url) => {
                        const next = sections.map((current, i) =>
                          i === sIdx ? { ...current, image: url } : current,
                        );
                        update(index, { sections: next });
                      }}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block text-xs font-semibold text-[#5C6370]">
                        Image side
                        <select
                          className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                          value={
                            sec.imagePosition === "right" || sec.imagePosition === "left"
                              ? sec.imagePosition
                              : sIdx % 2 === 0
                                ? "left"
                                : "right"
                          }
                          onChange={(e) => {
                            const next = sections.map((current, i) =>
                              i === sIdx
                                ? { ...current, imagePosition: e.target.value }
                                : current,
                            );
                            update(index, { sections: next });
                          }}
                        >
                          <option value="left">Photo left</option>
                          <option value="right">Photo right</option>
                        </select>
                      </label>
                      <label className="block text-xs font-semibold text-[#5C6370]">
                        Layout
                        <select
                          className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                          value={
                            ["band", "spotlight", "editorial", "overlay", "rail"].includes(
                              String(sec.layout || ""),
                            )
                              ? String(sec.layout)
                              : "auto"
                          }
                          onChange={(e) => {
                            const next = sections.map((current, i) =>
                              i === sIdx
                                ? {
                                    ...current,
                                    layout:
                                      e.target.value === "auto" ? undefined : e.target.value,
                                  }
                                : current,
                            );
                            update(index, { sections: next });
                          }}
                        >
                          <option value="auto">Auto</option>
                          <option value="band">Band</option>
                          <option value="spotlight">Spotlight</option>
                          <option value="editorial">Editorial</option>
                          <option value="overlay">Overlay</option>
                          <option value="rail">Rail</option>
                        </select>
                      </label>
                    </div>
                  </div>
                );
              })}
            </Group>

            <Group
              title="4 · Related projects heading"
              hint="Shown above related projects / articles on this page."
            >
              <label className="block text-xs font-semibold text-[#5C6370]">
                Related section title
                <input
                  className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                  value={localizedValue(relatedTitle, locale)}
                  onChange={(e) =>
                    update(index, {
                      relatedTitle: writeLocalized(relatedTitle, locale, e.target.value),
                    })
                  }
                  placeholder="Related projects"
                />
              </label>
            </Group>

            <Group title="5 · Google / SEO">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Google title ({localizedValue(metaTitle, locale).length}/60)
                  <input
                    maxLength={60}
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(metaTitle, locale)}
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
                </label>
                <label className="md:col-span-2 block text-xs font-semibold text-[#5C6370]">
                  Google description ({localizedValue(metaDescription, locale).length}/160)
                  <textarea
                    rows={2}
                    maxLength={160}
                    className="mt-1 w-full rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-sm"
                    value={localizedValue(metaDescription, locale)}
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
                </label>
              </div>
            </Group>
          </div>
        );
      })}
    </div>
  );
}
