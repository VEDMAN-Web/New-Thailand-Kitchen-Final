"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/lib/AdminAuthContext";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type ProductItem,
} from "@/services/adminAPI";
import MediaUpload from "@/components/MediaUpload";
import AdminImage from "@/components/AdminImage";
import AdminSkeleton from "@/components/AdminSkeleton";
import { resolveAdminMediaPreviewUrl } from "@/lib/adminMediaPreview";
import LocaleTabs from "@/components/LocaleTabs";
import {
  asLocalizedForm,
  emptyLocalized,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  CMS_SYNCED_EVENT,
} from "@/lib/adminSectionNav";
import {
  isGenericFeaturePack,
  isMislabelledKitchenStock,
} from "@/lib/approvedSiteFacts";
import {
  canonicalCategoryLabel,
  categoryTitleEn,
  collectProductCategoryLabels,
  normalizeCategoryKey,
} from "@/lib/productCategories";

type FeatureHighlight = { title: LocalizedText; description: LocalizedText };

type ProductForm = {
  title: LocalizedText;
  slug: string;
  subtitle: LocalizedText;
  productType: LocalizedText;
  sectionTag: LocalizedText;
  description: LocalizedText;
  image: string;
  icon: string;
  gallery: string[];
  contactImage: string;
  contactEyebrow: LocalizedText;
  contactTitle: LocalizedText;
  contactFormTitle: LocalizedText;
  pdfUrl: string;
  category: LocalizedText;
  featureHighlights: FeatureHighlight[];
  featured: boolean;
  finish: LocalizedText;
  material: LocalizedText;
  style: LocalizedText;
  color: LocalizedText;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  indexable: boolean;
};

function gallerySlotMeta(index: number): { title: string; hint: string; label: string } {
  const n = index + 1;
  if (index === 0) {
    return {
      title: `Image ${String(n).padStart(2, "0")} · Hero main`,
      label: "Hero main image",
      hint: "Used on: large left image at the top of the product page",
    };
  }
  if (index === 1) {
    return {
      title: `Image ${String(n).padStart(2, "0")} · Hero side (top)`,
      label: "Hero side image (top)",
      hint: "Used on: top-right image in the hero gallery",
    };
  }
  if (index === 2) {
    return {
      title: `Image ${String(n).padStart(2, "0")} · Hero side (bottom)`,
      label: "Hero side image (bottom)",
      hint: "Used on: bottom-right image in the hero gallery",
    };
  }
  return {
    title: `Image ${String(n).padStart(2, "0")} · Slider / features slide ${n - 2}`,
    label: `Gallery slide ${n}`,
    hint: "Used on: mid-page image slider and the features side panel carousel",
  };
}

const empty: ProductForm = {
  title: emptyLocalized(),
  slug: "",
  subtitle: emptyLocalized(),
  productType: emptyLocalized(),
  sectionTag: emptyLocalized(),
  description: emptyLocalized(),
  image: "",
  icon: "",
  gallery: ["", "", ""],
  contactImage: "",
  contactEyebrow: emptyLocalized(),
  contactTitle: emptyLocalized(),
  contactFormTitle: emptyLocalized(),
  pdfUrl: "",
  category: emptyLocalized(),
  featureHighlights: [],
  featured: false,
  finish: emptyLocalized(),
  material: emptyLocalized(),
  style: emptyLocalized(),
  color: emptyLocalized(),
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  indexable: false,
};

export default function AdminProductsPage() {
  const { siteId } = useAdminAuth();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [form, setForm] = useState(empty);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saveArmed, setSaveArmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [locale, setLocale] = useState<LocaleCode>("en");
  const loadSeqRef = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    setLoading(true);
    try {
      const res = await listProducts(siteId);
      if (seq !== loadSeqRef.current) return;
      setItems(res.items || []);
      setLoadError(false);
    } catch {
      if (seq !== loadSeqRef.current) return;
      setLoadError(true);
      toast.error("Failed to load products");
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [siteId]);

  const loadCategories = useCallback(async () => {
    const seq = loadSeqRef.current;
    try {
      const { listCategories } = await import("@/services/adminAPI");
      const res = await listCategories(siteId);
      if (seq !== loadSeqRef.current) return;
      setCategoryList(res.items || []);
    } catch {
      // Silently fail - category dropdown will just show empty
    }
  }, [siteId]);

  useEffect(() => {
    load();
    loadCategories();
  }, [load, loadCategories]);

  useEffect(() => {
    const onSynced = () => {
      void load();
      void loadCategories();
    };
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load, loadCategories]);

  const openCreate = () => {
    setForm(empty);
    setEditing(null);
    setStep(1);
    setSaveArmed(false);
    setLocale("en");
    setModal("create");
  };

  const openEdit = (item: ProductItem) => {
    let highlights = (item.featureHighlights || [])
      .map((h) => ({
        title: asLocalizedForm(h.title),
        description: asLocalizedForm(h.description),
      }))
      .filter(
        (h) =>
          localizedValue(h.title, "en").trim() ||
          localizedValue(h.description, "en").trim()
      );
    if (isGenericFeaturePack(highlights)) {
      highlights = [];
      toast.message(
        "Generic Obsidian/Gold/Marble pack removed. Enter verified per-model features only."
      );
    }
    const gallery = (item.gallery || [])
      .map((s) => String(s || "").trim())
      .filter(Boolean)
      .filter((url, index, all) => {
        // Keep first unique URL; drop duplicate kitchen stock reuse in later slots.
        if (all.indexOf(url) !== index) return false;
        return true;
      });
    while (gallery.length < 3) gallery.push("");
    const primary = String(item.image || "").trim();
    setEditing(item);
    setForm({
      title: asLocalizedForm(item.title),
      slug: item.slug,
      subtitle: asLocalizedForm(item.subtitle),
      productType: asLocalizedForm(item.productType),
      sectionTag: asLocalizedForm(item.sectionTag),
      description: asLocalizedForm(item.description),
      image: primary,
      icon: item.icon || "",
      gallery,
      contactImage: String((item as any).contactImage || ""),
      contactEyebrow: asLocalizedForm((item as any).contactEyebrow),
      contactTitle: asLocalizedForm((item as any).contactTitle),
      contactFormTitle: asLocalizedForm((item as any).contactFormTitle),
      pdfUrl: item.pdfUrl || "",
      category: asLocalizedForm(item.category),
      featureHighlights: highlights.length
        ? highlights
        : [{ title: emptyLocalized(), description: emptyLocalized() }],
      featured: item.featured,
      finish: asLocalizedForm(item.finish),
      material: asLocalizedForm(item.material),
      style: asLocalizedForm(item.style),
      color: asLocalizedForm(item.color),
      metaTitle: (item as any).metaTitle || "",
      metaDescription: (item as any).metaDescription || "",
      canonicalUrl: (item as any).canonicalUrl || "",
      indexable: (item as any).indexable ?? false,
    });
    setStep(1);
    setSaveArmed(false);
    setLocale("en");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setStep(1);
    setSaveArmed(false);
  };

  const validateStep = (target: 1 | 2 | 3) => {
    if (target === 2) {
      if (
        !localizedValue(form.title, "en").trim() ||
        !localizedValue(form.productType, "en").trim() ||
        !localizedValue(form.category, "en").trim()
      ) {
        toast.error("Please fill all required fields in Product Identity (Name, Type, Category)");
        return false;
      }
    }
    if (target === 3) {
      if (!localizedValue(form.description, "en").trim()) {
        toast.error("Please add a Detailed Description before continuing");
        return false;
      }
    }
    return true;
  };

  const goToStep = (next: 1 | 2 | 3) => {
    if (next === step) return;
    if (next > step) {
      if (next >= 2 && !validateStep(2)) return;
      if (next >= 3 && !validateStep(3)) return;
    }
    setStep(next);
    if (next === 3) {
      setSaveArmed(false);
      window.setTimeout(() => setSaveArmed(true), 350);
    } else {
      setSaveArmed(false);
    }
  };

  const onNext = () => {
    if (step === 1 && validateStep(2)) {
      setStep(2);
      setSaveArmed(false);
    } else if (step === 2 && validateStep(3)) {
      setStep(3);
      setSaveArmed(false);
      window.setTimeout(() => setSaveArmed(true), 350);
    }
  };

  const onBack = () => {
    if (step === 3) {
      setStep(2);
      setSaveArmed(false);
    } else if (step === 2) {
      setStep(1);
      setSaveArmed(false);
    }
  };

  // Navigation is all type="button" — no form submit needed

  const saveProduct = async () => {
    if (step !== 3 || !saveArmed || saving) return;
    if (!validateStep(2) || !validateStep(3)) return;

    if (form.metaTitle && form.metaTitle.length > 60) {
      toast.error("Meta Title must be 60 characters or less");
      return;
    }
    if (form.metaDescription && form.metaDescription.length > 160) {
      toast.error("Meta Description must be 160 characters or less");
      return;
    }

    const imagePath = form.image.trim();
    const duplicate = items.find((item) => {
      if (editing && item._id === editing._id) return false;
      return imagePath && String(item.image || "").trim() === imagePath;
    });
    if (duplicate) {
      toast.error(
        `This photo is already used on “${localizedValue(duplicate.title, "en") || duplicate.slug}”. Upload a unique photo for this model.`
      );
      return;
    }

    const featureHighlights: FeatureHighlight[] = form.featureHighlights
      .map((f) => ({
        title: asLocalizedForm(f.title),
        description: asLocalizedForm(f.description),
      }))
      .filter(
        (f) =>
          localizedValue(f.title, "en").trim() ||
          localizedValue(f.description, "en").trim()
      );

    if (isGenericFeaturePack(featureHighlights)) {
      toast.error(
        "Do not paste the shared Obsidian / Gold / Marble pack. Enter verified per-model features, or leave empty to hide the block."
      );
      return;
    }

    const gallery = form.gallery.map((s) => s.trim()).filter(Boolean);
    if (gallery.some((url) => isMislabelledKitchenStock(url) && url !== form.image.trim())) {
      toast.error(
        "Gallery still reuses another Kitchen*.png. Upload unique photos for this model."
      );
      return;
    }

    const payload: any = {
      title: asLocalizedForm(form.title),
      slug: form.slug || localizedValue(form.title, "en"),
      subtitle: asLocalizedForm(form.subtitle),
      productType: asLocalizedForm(form.productType),
      sectionTag: asLocalizedForm(form.sectionTag),
      description: asLocalizedForm(form.description),
      image: form.image,
      icon: form.icon,
      gallery,
      contactImage: form.contactImage.trim(),
      contactEyebrow: asLocalizedForm(form.contactEyebrow),
      contactTitle: asLocalizedForm(form.contactTitle),
      contactFormTitle: asLocalizedForm(form.contactFormTitle),
      pdfUrl: form.pdfUrl,
      featureHighlights,
      category: asLocalizedForm(form.category),
      featured: form.featured,
      finish: asLocalizedForm(form.finish),
      material: asLocalizedForm(form.material),
      style: asLocalizedForm(form.style),
      color: asLocalizedForm(form.color),
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      canonicalUrl: form.canonicalUrl,
      indexable: form.indexable,
    };
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await createProduct(siteId, payload);
        if (res?.item) setItems((current) => [res.item, ...current]);
        toast.success("Product created");
      } else if (editing) {
        const res = await updateProduct(siteId, editing._id, payload);
        if (res?.item) {
          setItems((current) =>
            current.map((item) => (item._id === res.item._id ? res.item : item))
          );
        }
        toast.success("Product updated");
      }
      closeModal();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (item: ProductItem) => {
    if (deletingId) return;
    if (!confirm(`Delete "${localizedValue(item.title, "en")}"?`)) return;
    setDeletingId(item._id);
    try {
      await deleteProduct(siteId, item._id);
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const productCategoryLabels = useMemo(() => {
    const extras: string[] = [];
    for (const cat of categoryList) {
      if (String(cat.categoryType || "") !== "layout") continue;
      const title = categoryTitleEn(cat);
      if (title) extras.push(title);
    }
    for (const item of items) {
      const category = localizedValue(item.category, "en").trim();
      const productType = localizedValue(item.productType, "en").trim();
      if (category) extras.push(category);
      if (productType) extras.push(productType);
    }
    return collectProductCategoryLabels(extras);
  }, [categoryList, items]);

  const categories = useMemo(
    () => ["All categories", ...productCategoryLabels, "Best Seller"],
    [productCategoryLabels]
  );

  const homeRanks = useMemo(() => {
    const featured = items.filter((item) => item.featured);
    return new Map(featured.slice(0, 3).map((item, index) => [item._id, index + 1]));
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const title = localizedValue(item.title, "en").toLowerCase();
      const subtitle = localizedValue(item.subtitle, "en").toLowerCase();
      const category = localizedValue(item.category, "en");
      const productType = localizedValue(item.productType, "en");
      const matchesQuery =
        !q ||
        title.includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        subtitle.includes(q) ||
        productType.toLowerCase().includes(q);
      const matchesCategory = (() => {
        if (categoryFilter === "All categories") return true;
        if (normalizeCategoryKey(categoryFilter) === "best-seller") {
          return Boolean(item.featured);
        }
        const want = normalizeCategoryKey(categoryFilter);
        return (
          normalizeCategoryKey(category) === want ||
          normalizeCategoryKey(productType) === want ||
          normalizeCategoryKey(canonicalCategoryLabel(category)) === want ||
          normalizeCategoryKey(canonicalCategoryLabel(productType)) === want
        );
      })();
      return matchesQuery && matchesCategory;
    });
  }, [items, query, categoryFilter]);

  return (
    <>
    {(!loading || items.length > 0) && (
      <>
    <div className="rounded-xl border border-[#C9D9EE] bg-[#F3F7FC] px-4 py-4 mb-6 space-y-2">
      <p className="text-sm font-semibold text-[#1A2332]">Where products show on the live site</p>
      <ol className="list-decimal pl-4 space-y-1.5 text-[13px] leading-snug text-[#334155]">
        <li>
          <strong>Home → Our Products (Best Seller)</strong> — up to 3 cards. Tick “Best Seller —
          show on homepage” below. Phone stacks them; tablet/desktop shows them side by side.
        </li>
        <li>
          <strong>View Collection</strong> — opens <span className="font-mono">/products</span> with
          every product you create here (filters, category tabs, Best Seller tab).
        </li>
        <li>
          <strong>Product detail</strong> — each card also has its own page{" "}
          <span className="font-mono">/products/[slug]</span> (gallery, features, contact form).
        </li>
      </ol>
      <p className="text-[12px] text-[#5C6B7A]">
        Adding more products fills the collection page. It does not add extra homepage cards.
      </p>
    </div>
    <div className="rounded-xl border border-[#E8EDF2] bg-white px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div>
        <p className="text-sm font-semibold text-[#1A2332]">
          Products page hero{" "}
          <span className="font-mono text-xs font-normal text-[#6B7280]">
            /products
          </span>
        </p>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Edit the /products hero video. Homepage product images are chosen with Best Seller on each product card.
        </p>
      </div>
      <Link
        href="/?section=productsPage"
        className="inline-flex items-center justify-center rounded-lg border border-[#E2E5EA] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#EEF0F3] shrink-0"
      >
        Edit Products page content
      </Link>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[270px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product inventory..."
              className="h-11 w-full rounded-xl border border-[#E2E5EA] bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#1A2332]/15"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 w-full sm:w-auto sm:min-w-[170px] appearance-none rounded-xl border border-[#E2E5EA] bg-white px-4 pr-9 text-sm outline-none focus:ring-2 focus:ring-[#1A2332]/15"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#1A2332] text-white text-sm font-semibold px-4"
        >
          <Plus className="w-4 h-4" />
          Create Product
        </button>
      </div>
      </>
    )}

      {loading && items.length === 0 && !loadError ? (
        <AdminSkeleton variant="products" count={8} />
      ) : loadError && items.length === 0 ? (
        <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="text-sm font-semibold text-red-900">Products could not be loaded.</p>
          <p className="mt-1 text-sm text-red-700">Check the connection and try again.</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#1A2332] px-4 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {loadError ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Products could not be refreshed. Showing the last loaded data.
              <button
                type="button"
                onClick={() => void load()}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : null}
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start auto-rows-auto"
            aria-busy={loading}
          >
            {filteredItems.length === 0 ? (
            <div className="col-span-full rounded-xl border border-[#E8EAED] bg-white p-10 text-center text-[#6B7280]">
              No products found.
            </div>
            ) : (
              filteredItems.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-2xl border border-[#E8EAED] bg-white"
              >
                <div className="relative h-40 w-full bg-[#F3F4F6]">
                  <AdminImage
                    src={resolveAdminMediaPreviewUrl(item.image || "/products/Kitchen1.png")}
                    alt={localizedValue(item.title, "en")}
                    className="h-full w-full object-cover"
                    fallbackSrcs={[resolveAdminMediaPreviewUrl("/products/Kitchen1.png")]}
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[#475569]">
                    {localizedValue(item.category, "en") || "Kitchen Layouts"}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-base font-semibold text-[#1A2332]">
                    {localizedValue(item.title, "en")}
                  </h3>
                  <p className="line-clamp-1 text-sm text-[#64748B]">
                    {localizedValue(item.subtitle, "en") ||
                      localizedValue(item.productType, "en") ||
                      "—"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#EEF2F7] px-2 py-0.5 text-xs text-[#475569]">
                      {localizedValue(item.productType, "en") || "—"}
                    </span>
                    {item.featured ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          homeRanks.has(item._id)
                            ? "bg-[#1A2332] text-white"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {homeRanks.has(item._id)
                          ? `Homepage ${homeRanks.get(item._id)}`
                          : "Best Seller — queued"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                        Collection only
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs text-[#475569]">
                    {localizedValue(item.description, "en") || "—"}
                  </p>
                  <div className="flex justify-end gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="inline-flex rounded-lg p-2 text-[#1A2332] hover:bg-[#F3F4F6]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(item)}
                      disabled={Boolean(deletingId)}
                      className="inline-flex rounded-lg p-2 text-[#DC2626] hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
              ))
            )}
          </div>
        </>
      )}

      {modal && (
        <div className="tk-overlay">
          <div
            className="tk-sheet w-full max-w-5xl bg-white p-4 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap justify-between items-start mb-2 gap-3">
              <div>
                <h3 className="font-bold text-lg">
                  {modal === "create" ? "Add Product" : "Edit Product"}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Switch language to edit Thai or Polish copy.
                </p>
                <div className="mt-2">
                  <LocaleTabs locale={locale} onChange={setLocale} />
                </div>
              </div>
              <button type="button" onClick={closeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                ["1. Product Identity", "Basic details & main gallery"],
                ["2. Overview Section", "Overview header & description"],
                ["3. Features & Details", "Highlight features & images"],
              ].map(([title, sub], i) => {
                const n = (i + 1) as 1 | 2 | 3;
                const active = step === n;
                const done = step > n;
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => goToStep(n)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${active ? "border-[#1A2332] bg-[#F8FAFC]" : done ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100" : "border-[#E2E5EA] hover:border-[#CBD5E1]"}`}
                  >
                    <p className={`font-semibold ${active ? "text-[#1A2332]" : done ? "text-emerald-700" : "text-[#6B7280]"}`}>
                      {title}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF]">{sub}</p>
                    {done ? <CheckCircle2 className="mt-1 h-3.5 w-3.5 text-emerald-600" /> : null}
                  </button>
                );
              })}
            </div>

            {step === 1 ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#E8EAED] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">Basic Identity</p>
                  <p className="text-[11px] text-[#94A3B8]">Core title and narrative headline for this kitchen model</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Product Name *
                      <input
                        required
                        value={localizedValue(form.title, locale)}
                        onChange={(e) => setForm({ ...form, title: writeLocalized(form.title, locale, e.target.value) })}
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Narrative headline *
                      <input
                        required
                        value={localizedValue(form.subtitle, locale)}
                        onChange={(e) => setForm({ ...form, subtitle: writeLocalized(form.subtitle, locale, e.target.value) })}
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94A3B8]">
                    Headline appears under the orange series tag on the product detail page.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E8EAED] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">Classification & Category</p>
                  <p className="text-[11px] text-[#94A3B8]">Assign model type and store category</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Product Type *
                      <input
                        required
                        value={localizedValue(form.productType, locale)}
                        onChange={(e) => setForm({ ...form, productType: writeLocalized(form.productType, locale, e.target.value) })}
                        placeholder="e.g. U Shape, L Shape"
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Category *
                      <select
                        required
                        value={
                          canonicalCategoryLabel(
                            localizedValue(form.category, "en")
                          ) || localizedValue(form.category, "en")
                        }
                        onChange={(e) =>
                          setForm({
                            ...form,
                            category: writeLocalized(
                              form.category,
                              "en",
                              e.target.value
                            ),
                          })
                        }
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal bg-white"
                      >
                        <option value="">Select a category...</option>
                        {productCategoryLabels.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Same list as the live /products chips. New layout categories appear automatically.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Slug (optional)
                    <input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <div />
                </div>

                <MediaUpload
                  label="Listing / contact fallback image *"
                  kind="image"
                  value={form.image}
                  onChange={(v) => setForm({ ...form, image: v })}
                  previewSize="lg"
                  clearable
                />
                <p className="text-[11px] text-[#94A3B8] -mt-1">
                  Used on product cards and as fallback when Contact side image is empty.
                </p>
                <MediaUpload
                  label="Icon (optional)"
                  kind="icon"
                  value={form.icon}
                  onChange={(v) => setForm({ ...form, icon: v })}
                  previewSize="sm"
                  clearable
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Finish
                    <input
                      value={localizedValue(form.finish, locale)}
                      onChange={(e) =>
                        setForm({ ...form, finish: writeLocalized(form.finish, locale, e.target.value) })
                      }
                      placeholder="e.g. Matte lacquer"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Material
                    <input
                      value={localizedValue(form.material, locale)}
                      onChange={(e) =>
                        setForm({ ...form, material: writeLocalized(form.material, locale, e.target.value) })
                      }
                      placeholder="e.g. Oak veneer"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Style
                    <input
                      value={localizedValue(form.style, locale)}
                      onChange={(e) =>
                        setForm({ ...form, style: writeLocalized(form.style, locale, e.target.value) })
                      }
                      placeholder="e.g. Contemporary"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Color
                    <input
                      value={localizedValue(form.color, locale)}
                      onChange={(e) =>
                        setForm({ ...form, color: writeLocalized(form.color, locale, e.target.value) })
                      }
                      placeholder="e.g. Black"
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                </div>

                {locale === "en" && (
                  <>
                    <div className="rounded-xl border border-[#E8EAED] p-4 mt-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">SEO Metadata</p>
                      <p className="text-[11px] text-[#94A3B8] mb-3">Optional search engine optimization fields</p>
                      
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-[#5C6370]">
                          Meta Title ({form.metaTitle.length}/60)
                          <input
                            value={form.metaTitle}
                            onChange={(e) => setForm({ ...form, metaTitle: e.target.value.slice(0, 60) })}
                            placeholder="Custom Black Kitchen | Thailand Kitchen"
                            maxLength={60}
                            className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                          />
                        </label>

                        <label className="block text-xs font-semibold text-[#5C6370]">
                          Meta Description ({form.metaDescription.length}/160)
                          <textarea
                            rows={2}
                            value={form.metaDescription}
                            onChange={(e) => setForm({ ...form, metaDescription: e.target.value.slice(0, 160) })}
                            placeholder="Professional custom black kitchen design with matte obsidian finish and gold hardware. Premium materials, expert craftsmanship."
                            maxLength={160}
                            className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal resize-y"
                          />
                        </label>

                        <label className="block text-xs font-semibold text-[#5C6370]">
                          Canonical URL (optional)
                          <input
                            value={form.canonicalUrl}
                            onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                            placeholder="https://www.thailandkitchens.com/products/your-product"
                            className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                          />
                          <span className="mt-1 block text-[11px] text-[#94A3B8] font-normal">
                            Leave blank to use the default self-referencing canonical.
                          </span>
                        </label>

                        <div className="flex items-center gap-3">
                          <input
                            id="product-indexable"
                            type="checkbox"
                            checked={form.indexable}
                            onChange={(e) => setForm({ ...form, indexable: e.target.checked })}
                            className="w-4 h-4 rounded border-[#E2E5EA]"
                          />
                          <label htmlFor="product-indexable" className="text-sm text-[#1A2332]">
                            Indexable (allow Google to index this product page)
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Narrative series tag (eyebrow) *
                  <input
                    value={localizedValue(form.sectionTag, locale)}
                    onChange={(e) => setForm({ ...form, sectionTag: writeLocalized(form.sectionTag, locale, e.target.value) })}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>
                <p className="text-[11px] text-[#94A3B8] -mt-1">
                  Orange uppercase label above the narrative headline (e.g. Premium Finishes).
                </p>
                <label className="block text-xs font-semibold text-[#5C6370]">
                  Detailed Description *
                  <textarea
                    rows={5}
                    value={localizedValue(form.description, locale)}
                    onChange={(e) => setForm({ ...form, description: writeLocalized(form.description, locale, e.target.value) })}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                  />
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="mt-0.5"
                  />
                  <span>
                    Best Seller — show on homepage
                    <span className="block text-[11px] font-normal text-[#94A3B8]">
                      Home “Our Products” shows up to 3 Best Sellers. Everything else still
                      appears on /products.
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                      Feature Highlights
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Per-model facts only. Leave empty to hide the feature block
                      on the live product page. Do not paste the same Obsidian /
                      Gold / Marble pack onto every model.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          featureHighlights: [
                            ...form.featureHighlights,
                            { title: emptyLocalized(), description: emptyLocalized() },
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add highlight
                    </button>
                  </div>
                </div>

                {form.featureHighlights.map((feature, index) => (
                  <div key={index} className="rounded-xl border border-[#E8EAED] p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[#1A2332]">
                        Feature Highlight {String(index + 1).padStart(2, "0")}
                      </p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-red-600"
                        onClick={() => {
                          const next = form.featureHighlights.filter((_, i) => i !== index);
                          setForm({
                            ...form,
                            featureHighlights: next.length
                              ? next
                              : [{ title: emptyLocalized(), description: emptyLocalized() }],
                          });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="block text-xs font-semibold text-[#5C6370]">
                        Title
                        <input
                          value={localizedValue(feature.title, locale)}
                          onChange={(e) => {
                            const next = [...form.featureHighlights];
                            next[index] = {
                              ...feature,
                              title: writeLocalized(
                                feature.title,
                                locale,
                                e.target.value
                              ),
                            };
                            setForm({ ...form, featureHighlights: next });
                          }}
                          placeholder="e.g. Matte Obsidian Finish"
                          className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                        />
                      </label>
                      <label className="block text-xs font-semibold text-[#5C6370]">
                        Description
                        <textarea
                          rows={3}
                          value={localizedValue(feature.description, locale)}
                          onChange={(e) => {
                            const next = [...form.featureHighlights];
                            next[index] = {
                              ...feature,
                              description: writeLocalized(
                                feature.description,
                                locale,
                                e.target.value
                              ),
                            };
                            setForm({ ...form, featureHighlights: next });
                          }}
                          placeholder="Short description shown under the title"
                          className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                        />
                      </label>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                      Page images · hero + slider
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Image 01–03 = hero gallery. Image 04+ = mid-page slider and features side panel.
                      Each slot is a separate upload. Do not reuse another model’s Kitchen*.png — leave
                      empty until a unique project photo is available.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, gallery: [...form.gallery, ""] })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F8FAFC]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add image
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {form.gallery.map((url, index) => {
                    const slot = gallerySlotMeta(index);
                    return (
                    <div
                      key={`gallery-${index}`}
                      className="rounded-xl border border-[#E8EAED] p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-[#1A2332]">
                            {slot.title}
                          </p>
                          <p className="text-[11px] text-[#94A3B8]">{slot.hint}</p>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-600 disabled:opacity-40"
                          disabled={form.gallery.length <= 3 && index < 3}
                          onClick={() => {
                            const next = form.gallery.filter((_, i) => i !== index);
                            while (next.length < 3) next.push("");
                            setForm({
                              ...form,
                              gallery: next.length ? next : ["", "", ""],
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <MediaUpload
                        label={slot.label}
                        kind="image"
                        value={url}
                        onChange={(v) => {
                          const next = [...form.gallery];
                          next[index] = v;
                          setForm({ ...form, gallery: next });
                        }}
                        previewSize="lg"
                        clearable
                      />
                    </div>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-[#E8EDF2] bg-[#F8FAFC] p-4 space-y-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#334155]">
                      Contact band · bottom of product page
                    </p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Eyebrow, titles, and the large side image next to the enquiry form.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Contact eyebrow ({locale.toUpperCase()})
                      <input
                        value={localizedValue(form.contactEyebrow, locale)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            contactEyebrow: writeLocalized(
                              form.contactEyebrow,
                              locale,
                              e.target.value
                            ),
                          })
                        }
                        placeholder="Premium Finishes"
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                    <label className="block text-xs font-semibold text-[#5C6370]">
                      Contact title ({locale.toUpperCase()})
                      <input
                        value={localizedValue(form.contactTitle, locale)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            contactTitle: writeLocalized(
                              form.contactTitle,
                              locale,
                              e.target.value
                            ),
                          })
                        }
                        placeholder="Contact US"
                        className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-[#5C6370]">
                    Contact form heading ({locale.toUpperCase()})
                    <input
                      value={localizedValue(form.contactFormTitle, locale)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contactFormTitle: writeLocalized(
                            form.contactFormTitle,
                            locale,
                            e.target.value
                          ),
                        })
                      }
                      placeholder="Let's design a kitchen worthy of your island."
                      className="mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <MediaUpload
                    label="Contact side image"
                    kind="image"
                    value={form.contactImage}
                    onChange={(v) => setForm({ ...form, contactImage: v })}
                    previewSize="lg"
                    clearable
                  />
                  <p className="text-[11px] text-[#94A3B8]">
                    Used on: large photo beside the contact form. Falls back to listing image if empty.
                  </p>
                </div>

                <MediaUpload
                  label="Product PDF (optional)"
                  kind="pdf"
                  value={form.pdfUrl}
                  onChange={(v) => setForm({ ...form, pdfUrl: v })}
                  clearable
                />
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1A2332] text-white px-4 py-2 text-sm font-semibold"
                >
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void saveProduct()}
                  disabled={!saveArmed || saving}
                  className="rounded-lg bg-[#1A2332] text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : modal === "create" ? "Create Product" : "Edit Product"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
