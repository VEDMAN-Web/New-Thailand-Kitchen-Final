"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FolderOpen, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import SectionBlocksEditor, {
  sectionsFromApi,
  sectionsToApiPayload,
} from "@/components/SectionBlocksEditor";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  buildDefaultCategorySections,
  defaultEyebrowForType,
  defaultFooterCtaFields,
} from "@/lib/categoryPageTemplates";
import {
  adminHubByParam,
  categoryTypeLabel,
} from "@/lib/thailandHubs";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import HubLandingEditor from "@/components/HubLandingEditor";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryItem,
} from "@/services/adminAPI";

type CategorySection = {
  heading: LocalizedText;
  body: LocalizedText;
  image: string;
  layout: string;
};

type CategoryForm = {
  title: LocalizedText;
  description: LocalizedText;
  image: string;
  icon: string;
  slug: string;
  categoryType: string;
  parentId: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  indexable: boolean;
  eyebrow: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
  footerCtaHeading: LocalizedText;
  footerCtaBody: LocalizedText;
  sections: CategorySection[];
};

/** Public path for a category type — keep in sync with thailand-kitchen-frontend routes. */
function categoryPublicBasePath(categoryType: string): string {
  switch (categoryType) {
    case "service":
      return "/services";
    case "material":
      return "/materials";
    case "style":
      return "/kitchens/styles";
    case "layout":
      return "/kitchens/layouts";
    case "property-type":
      return "/kitchens/by-property";
    case "location":
      return "/locations";
    case "built-in-furniture":
      return "/built-in-furniture";
    default:
      return "/products";
  }
}

function slugifyPreview(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Same rule as site HubMegaMenu — only root pages appear in Services/Materials nav. */
function isTopLevelCategory(item: {
  parentId?: string | { _id?: string; slug?: string } | null;
}) {
  const parent = item.parentId;
  if (!parent) return true;
  if (typeof parent === "object") return false;
  return !String(parent).trim();
}

function parentLocationSlug(item: CategoryItem): string {
  const parent = (item as any).parentId;
  if (parent && typeof parent === "object" && parent.slug) {
    return String(parent.slug);
  }
  return "";
}

/** Canonical public path — mirrors frontend categoryPublicPath. */
function categoryPublicPath(item: CategoryItem): string {
  const type = String((item as any).categoryType || "");
  const slug = String((item as any).slug || "").trim();
  if (!slug) return categoryPublicBasePath(type);

  const parent = (item as any).parentId;
  if (
    type === "service" &&
    parent &&
    typeof parent === "object" &&
    String(parent.categoryType || "") === "location" &&
    parent.slug
  ) {
    return `/locations/${parent.slug}/${slug}`;
  }

  return `${categoryPublicBasePath(type)}/${slug}`;
}

/** Parent options: location×service children must pick a location parent; others any non-self. */
function compatibleParentTypes(childType: string): string[] | null {
  if (childType === "service") return ["location"];
  return null;
}

export default function AdminCategoriesPage() {
  const { siteId } = useAdminAuth();
  const searchParams = useSearchParams();
  const hub = adminHubByParam(searchParams.get("hub"));
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [form, setForm] = useState<CategoryForm>({
    title: emptyLocalized(),
    description: emptyLocalized(),
    image: "",
    icon: "",
    slug: "",
    categoryType: "service",
    parentId: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    indexable: false,
    eyebrow: emptyLocalized(),
    ctaLabel: emptyLocalized(),
    ctaHref: "/contact",
    footerCtaHeading: emptyLocalized(),
    footerCtaBody: emptyLocalized(),
    sections: [],
  });

  useEffect(() => {
    setTypeFilter("all");
    setQuery("");
  }, [hub?.hubParam]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCategories(siteId);
      setItems(res.items || []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => {
      void load();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      const type = String((i as any).categoryType || "");
      if (hub) {
        if (hub.key === "services") {
          // Match site Services mega-menu: top-level services only
          if (type !== "service" || !isTopLevelCategory(i)) return false;
        } else if (hub.key === "materials") {
          if (type !== "material" || !isTopLevelCategory(i)) return false;
        } else if (hub.key === "locations") {
          // Default / All = same as site Locations mega-menu (cities only).
          // Filter "service" = city×service pages (/locations/bangkok/kitchen-design).
          const isLocation = type === "location" && isTopLevelCategory(i);
          const isLocationService =
            type === "service" &&
            !isTopLevelCategory(i) &&
            String((i as any).parentId?.categoryType || "") === "location";

          if (typeFilter === "service") {
            if (!isLocationService) return false;
          } else if (typeFilter === "location") {
            if (!isLocation) return false;
          } else {
            // "all" mirrors the public mega-menu
            if (!isLocation) return false;
          }
        } else if (!hub.categoryTypes.includes(type)) {
          return false;
        }
      }
      if (
        hub?.key !== "locations" &&
        typeFilter !== "all" &&
        type !== typeFilter
      ) {
        return false;
      }
      if (!q) return true;
      const title = localizedValue(i.title, "en").toLowerCase();
      const description = localizedValue(i.description, "en").toLowerCase();
      const path = categoryPublicPath(i).toLowerCase();
      return (
        title.includes(q) || description.includes(q) || path.includes(q)
      );
    });
  }, [items, query, hub, typeFilter]);

  const parentOptions = useMemo(() => {
    const allowed = compatibleParentTypes(form.categoryType);
    return items.filter((i) => {
      if (editing && i._id === editing._id) return false;
      if (!allowed) return true;
      return allowed.includes(String((i as any).categoryType || ""));
    });
  }, [items, form.categoryType, editing]);

  const liveUrlPreview = useMemo(() => {
    const slug =
      slugifyPreview(form.slug) ||
      slugifyPreview(localizedValue(form.title, "en")) ||
      "your-slug";
    // Location × service → /locations/{parentSlug}/{serviceSlug}
    if (form.categoryType === "service" && form.parentId) {
      const parent = items.find((i) => i._id === form.parentId) as any;
      if (parent && String(parent.categoryType || "") === "location") {
        const parentSlug =
          slugifyPreview(parent.slug) ||
          slugifyPreview(localizedValue(parent.title, "en")) ||
          "location";
        return `/locations/${parentSlug}/${slug}`;
      }
    }
    return `${categoryPublicBasePath(form.categoryType)}/${slug}`;
  }, [form.categoryType, form.slug, form.title, form.parentId, items]);

  const openCreate = () => {
    const type = hub?.defaultCategoryType || "service";
    const footer = defaultFooterCtaFields("kitchen");
    const preloadSections = [
      "layout",
      "style",
      "property-type",
      "service",
      "material",
      "built-in-furniture",
    ].includes(type);
    setForm({
      title: emptyLocalized(),
      description: emptyLocalized(),
      image: "/products/Kitchen2.png",
      icon: "",
      slug: "",
      categoryType: type,
      parentId: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      indexable: false,
      eyebrow: defaultEyebrowForType(type),
      ctaLabel: asLocalizedForm("Request a consultation"),
      ctaHref: "/contact",
      footerCtaHeading: footer.footerCtaHeading,
      footerCtaBody: footer.footerCtaBody,
      sections: preloadSections
        ? buildDefaultCategorySections({
            title: "New page",
            description: "",
            image: "/products/Kitchen2.png",
            categoryType: type,
            slug: "",
          })
        : [],
    });
    setEditing(null);
    setLocale("en");
    setModal("create");
  };

  const openEdit = (item: CategoryItem) => {
    setEditing(item);
    const indexableValue = (item as any).indexable;
    const type = (item as any).categoryType || "service";
    const footerFallback = defaultFooterCtaFields(
      localizedValue(asLocalizedForm(item.title), "en") || "kitchen"
    );
    const eyebrowForm = asLocalizedForm((item as any).eyebrow);
    const footerHeadingForm = asLocalizedForm((item as any).footerCtaHeading);
    const footerBodyForm = asLocalizedForm((item as any).footerCtaBody);
    setForm({
      title: asLocalizedForm(item.title),
      description: asLocalizedForm(item.description),
      image: item.image,
      icon: item.icon || "",
      slug: (item as any).slug || "",
      categoryType: type,
      parentId: (item as any).parentId?._id || (item as any).parentId || "",
      metaTitle: (item as any).metaTitle || "",
      metaDescription: (item as any).metaDescription || "",
      canonicalUrl: (item as any).canonicalUrl || "",
      indexable: indexableValue === true,
      eyebrow: localizedValue(eyebrowForm, "en")
        ? eyebrowForm
        : defaultEyebrowForType(type),
      ctaLabel: asLocalizedForm((item as any).ctaLabel),
      ctaHref: String((item as any).ctaHref || "/contact"),
      footerCtaHeading: localizedValue(footerHeadingForm, "en")
        ? footerHeadingForm
        : footerFallback.footerCtaHeading,
      footerCtaBody: localizedValue(footerBodyForm, "en")
        ? footerBodyForm
        : footerFallback.footerCtaBody,
      sections: sectionsFromApi((item as any).sections),
    });
    setLocale("en");
    setModal("edit");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!localizedValue(form.title, "en").trim()) {
      toast.error("English title is required");
      return;
    }
    if (form.metaTitle && form.metaTitle.length > 60) {
      toast.error("Meta Title must be 60 characters or less");
      return;
    }
    if (form.metaDescription && form.metaDescription.length > 160) {
      toast.error("Meta Description must be 160 characters or less");
      return;
    }
    try {
      const payload: any = {
        title: asLocalizedForm(form.title),
        description: asLocalizedForm(form.description),
        image: form.image,
        icon: form.icon,
        slug: form.slug,
        categoryType: form.categoryType,
        parentId: form.parentId || undefined,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        canonicalUrl: form.canonicalUrl,
        indexable: form.indexable,
        eyebrow: asLocalizedForm(form.eyebrow),
        ctaLabel: asLocalizedForm(form.ctaLabel),
        ctaHref: form.ctaHref || "/contact",
        footerCtaHeading: asLocalizedForm(form.footerCtaHeading),
        footerCtaBody: asLocalizedForm(form.footerCtaBody),
        sections: sectionsToApiPayload(form.sections),
      };
      if (modal === "create") {
        await createCategory(siteId, payload);
        toast.success("Category created");
      } else if (editing) {
        await updateCategory(siteId, editing._id, payload);
        toast.success("Category updated");
      }
      setModal(null);
      await load();
    } catch {
      toast.error("Save failed");
    }
  };

  const onDelete = async (item: CategoryItem) => {
    const label = localizedValue(item.title, "en");
    if (!confirm(`Delete category “${label}”?`)) return;
    try {
      await deleteCategory(siteId, item._id);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
    <div className="space-y-6">
        {hub ? (
          <HubLandingEditor hub={hub} />
        ) : (
          <p className="text-xs text-[#6B7280]">
            Pick a hub from the sidebar (Kitchens, Services, Materials,
            Locations, Built-In Furniture) to edit that page.
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                hub ? `Search ${hub.label.toLowerCase()}…` : "Search categories…"
              }
              className="w-full rounded-xl border border-[#E2E5EA] bg-white pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A2332] text-white px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add {hub ? `${hub.label} page` : "Category"}
          </button>
        </div>

        {hub && hub.categoryTypes.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${
                typeFilter === "all"
                  ? "bg-[#1A2332] text-white border-[#1A2332]"
                  : "bg-white text-[#5C6370] border-[#E2E5EA]"
              }`}
            >
              {hub.key === "locations" ? "Menu cities" : "All"}
            </button>
            {hub.categoryTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${
                  typeFilter === t
                    ? "bg-[#1A2332] text-white border-[#1A2332]"
                    : "bg-white text-[#5C6370] border-[#E2E5EA]"
                }`}
              >
                {hub.key === "locations" && t === "service"
                  ? "City services"
                  : categoryTypeLabel(t)}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E2E5EA] bg-white p-12 text-center">
            <FolderOpen className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-sm text-[#6B7280]">
              {hub ? `No ${hub.label.toLowerCase()} pages yet` : "No categories yet"}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-[#E8EAED] bg-white p-4 flex gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1A2332]">
                      {localizedValue(item.title, "en")}
                    </p>
                    <span className="rounded-md bg-[#F4F5F7] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#5C6370]">
                      {categoryTypeLabel(String((item as any).categoryType || ""))}
                    </span>
                    {!isTopLevelCategory(item) && parentLocationSlug(item) ? (
                      <span className="rounded-md bg-[#EEF2F6] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3D5A80]">
                        Under {parentLocationSlug(item)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] font-mono text-[#9CA3AF]">
                    {categoryPublicPath(item)}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">
                    {localizedValue(item.description, "en")}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-lg hover:bg-[#F4F5F7]"
                  >
                    <Pencil className="w-4 h-4 text-[#5C6370]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 space-y-4 shadow-xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#1A2332]">
                {modal === "create" ? "Add Category" : "Edit Category"}
              </h2>
              <button type="button" onClick={() => setModal(null)}>
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
            <LocaleTabs locale={locale} onChange={setLocale} />
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                Title ({locale.toUpperCase()})
              </label>
              <input
                value={localizedValue(form.title, locale)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: writeLocalized(f.title, locale, e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                required={locale === "en"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                Description ({locale.toUpperCase()})
              </label>
              <textarea
                rows={3}
                value={localizedValue(form.description, locale)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: writeLocalized(
                      f.description,
                      locale,
                      e.target.value
                    ),
                  }))
                }
                className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm resize-y"
              />
            </div>
            
            {locale === "en" && (
              <>
                <div className="border-t border-[#E2E5EA] pt-4">
                  <p className="text-xs font-semibold text-[#5C6370] mb-3">SEO & Taxonomy</p>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    Type *
                  </label>
                  <select
                    value={form.categoryType}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        categoryType: e.target.value,
                        // Clear incompatible parent when type changes
                        parentId: "",
                      }))
                    }
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                    required
                  >
                    {(hub?.categoryTypes || [
                      "service",
                      "material",
                      "style",
                      "layout",
                      "property-type",
                      "location",
                      "built-in-furniture",
                    ]).map((t) => (
                      <option key={t} value={t}>
                        {categoryTypeLabel(t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    Parent Category
                    {form.categoryType === "service" ? " (location parents for location × service)" : ""}
                  </label>
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                  >
                    <option value="">None (Top Level)</option>
                    {parentOptions.map((i) => (
                      <option key={i._id} value={i._id}>
                        {localizedValue(i.title, "en")} {(i as any).categoryType ? `(${(i as any).categoryType})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    Slug (URL-safe, lowercase, hyphens only)
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") }))}
                    placeholder="custom-kitchens"
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm font-mono"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Leave blank to auto-generate from title</p>
                </div>

                <div className="rounded-lg border border-[#E2E5EA] bg-[#F8FAFC] px-3.5 py-2.5">
                  <p className="text-xs font-semibold text-[#5C6370] mb-1">Live URL preview</p>
                  <p className="text-sm font-mono text-[#1A2332] break-all">{liveUrlPreview}</p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Path the public site will use for this type + slug. Indexable must be ON for sitemap.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    Meta Title ({form.metaTitle.length}/60)
                  </label>
                  <input
                    value={form.metaTitle}
                    onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value.slice(0, 60) }))}
                    placeholder="Custom Kitchens Bangkok | Thailand Kitchen"
                    maxLength={60}
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    Meta Description ({form.metaDescription.length}/160)
                  </label>
                  <textarea
                    rows={2}
                    value={form.metaDescription}
                    onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value.slice(0, 160) }))}
                    placeholder="Professional custom kitchen design and installation in Bangkok. Modern materials, expert craftsmanship."
                    maxLength={160}
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    Canonical URL (optional)
                  </label>
                  <input
                    value={form.canonicalUrl}
                    onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
                    placeholder="https://thailandkitchen.com/services/custom-kitchens"
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="indexable"
                    type="checkbox"
                    checked={form.indexable}
                    onChange={(e) => setForm((f) => ({ ...f, indexable: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#E2E5EA]"
                  />
                  <label htmlFor="indexable" className="text-sm text-[#1A2332]">
                    Indexable (allow Google to index this page)
                  </label>
                </div>
                <p className="text-xs text-[#6B7280] -mt-2">⚠️ Only enable when page has real content & photos. Defaults to OFF per client spec.</p>
              </>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                Hero eyebrow ({locale.toUpperCase()})
              </label>
              <input
                value={localizedValue(form.eyebrow, locale)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    eyebrow: writeLocalized(f.eyebrow, locale, e.target.value),
                  }))
                }
                placeholder="Layouts"
                className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="rounded-xl border border-[#E8EDF2] bg-[#F8FAFC] p-4 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                  Hero · Full-bleed overlay
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  Same overlay banner as Kitchens, Materials, and Services:
                  photo behind the title, gold tag, white heading, description,
                  and pill button.
                </p>
              </div>
              <MediaUpload
                label="Hero image"
                kind="image"
                value={form.image}
                onChange={(v) => setForm((f) => ({ ...f, image: v }))}
              />
              <p className="text-[11px] text-[#6B7280] -mt-1">
                Full-width background photo behind the heading
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    CTA label ({locale.toUpperCase()})
                  </label>
                  <input
                    value={localizedValue(form.ctaLabel, locale)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        ctaLabel: writeLocalized(
                          f.ctaLabel,
                          locale,
                          e.target.value
                        ),
                      }))
                    }
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
                    CTA link
                  </label>
                  <input
                    value={form.ctaHref}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, ctaHref: e.target.value }))
                    }
                    placeholder="/contact"
                    className="w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <SectionBlocksEditor
              locale={locale}
              label="Body sections · below the hero"
              sections={form.sections}
              onChange={(sections) => setForm((f) => ({ ...f, sections }))}
              onLoadTemplate={() => {
                const title = localizedValue(form.title, "en") || "Kitchen";
                const description = localizedValue(form.description, "en");
                const sections = buildDefaultCategorySections({
                  title,
                  description,
                  image: form.image,
                  categoryType: form.categoryType,
                  slug: form.slug,
                });
                const footer = defaultFooterCtaFields(title);
                setForm((f) => ({
                  ...f,
                  sections,
                  eyebrow: localizedValue(f.eyebrow, "en")
                    ? f.eyebrow
                    : defaultEyebrowForType(f.categoryType),
                  footerCtaHeading: localizedValue(f.footerCtaHeading, "en")
                    ? f.footerCtaHeading
                    : footer.footerCtaHeading,
                  footerCtaBody: localizedValue(f.footerCtaBody, "en")
                    ? f.footerCtaBody
                    : footer.footerCtaBody,
                }));
                toast.success("Default page template loaded");
              }}
              loadTemplateLabel="Load default page template"
            />

            <div className="rounded-xl border border-[#E8EDF2] bg-[#1A2332] p-4 space-y-3 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                  Footer CTA · bottom of page
                </p>
                <p className="text-[11px] text-white/55 mt-0.5">
                  Dark band at the bottom. Button uses the same CTA label / link
                  as the hero.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Footer heading ({locale.toUpperCase()})
                </label>
                <input
                  value={localizedValue(form.footerCtaHeading, locale)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      footerCtaHeading: writeLocalized(
                        f.footerCtaHeading,
                        locale,
                        e.target.value
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Footer body ({locale.toUpperCase()})
                </label>
                <textarea
                  rows={2}
                  value={localizedValue(form.footerCtaBody, locale)}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      footerCtaBody: writeLocalized(
                        f.footerCtaBody,
                        locale,
                        e.target.value
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 resize-y"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-[#E2E5EA] px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#1A2332] text-white px-4 py-2 text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
