"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { TranslationKey } from "../../i18n/translations";
import { createContact } from "../../services/contactAPI";
import {
  fetchMergedCatalogues,
  mapCatalogueItems,
  type CmsCatalogue,
} from "../../services/cmsPublic";
import { useCms, useCmsSection } from "../../lib/CmsHomeContext";
import type { ContactData } from "../../types/contactUs";
import { pickCmsText } from "../../lib/cmsText";
import { trackGa4Event } from "../../lib/ga4";
import CmsResolvedImage from "../CmsResolvedImage";

type PendingDownload = {
  id: number;
  category: string;
  downloadName: string;
  pdfFile: string;
  pdfUrl?: string;
};

type GateForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

type GateErrors = Partial<Record<keyof GateForm, string>>;

const lettersOnlyPattern = /^[\p{L}\s'.-]+$/u;
const emptyGate: GateForm = { fullName: "", email: "", phoneNumber: "" };

function validateGateForm(
  data: GateForm,
  t: (key: TranslationKey) => string
): GateErrors {
  const errors: GateErrors = {};
  const email = data.email.trim();
  const phone = data.phoneNumber.trim();

  if (!data.fullName.trim()) {
    errors.fullName = t("form.error.fullNameRequired");
  } else if (!lettersOnlyPattern.test(data.fullName.trim())) {
    errors.fullName = t("form.error.fullNameLetters");
  }

  if (!email && !phone) {
    errors.email = t("form.error.emailOrPhone");
    errors.phoneNumber = t("form.error.emailOrPhone");
  } else {
    if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = t("form.error.emailInvalid");
    }
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) {
      errors.phoneNumber = t("form.error.phoneDigits");
    }
  }

  return errors;
}

export default function CatlogSection({
  initialCatalogues = [],
}: {
  initialCatalogues?: CmsCatalogue[];
}) {
  const { t, locale } = useTranslation();
  const { loading: cmsLoading } = useCms();
  const catalogueSection = useCmsSection<{ items?: unknown[] }>("catalogue");
  const fromCms = useMemo(
    () => mapCatalogueItems(catalogueSection?.items || []),
    [catalogueSection?.items]
  );
  const [fetchedItems, setFetchedItems] = useState<CmsCatalogue[]>([]);
  const items = fromCms.length
    ? fromCms
    : initialCatalogues.length
      ? initialCatalogues
      : fetchedItems;
  const [active, setActive] = useState<number | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [gateForm, setGateForm] = useState<GateForm>(emptyGate);
  const [gateErrors, setGateErrors] = useState<GateErrors>({});
  const pendingDownloadRef = useRef<PendingDownload | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    if (fromCms.length || initialCatalogues.length) return;
    fetchMergedCatalogues().then((list) => {
      setFetchedItems(Array.isArray(list) ? list : []);
    });
  }, [fromCms.length, initialCatalogues.length]);

  const refreshUnlockStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/catalog/status", { credentials: "include" });
      const data = await res.json();
      const next = Boolean(data.unlocked);
      unlockedRef.current = next;
      setUnlocked(next);
      return next;
    } catch {
      unlockedRef.current = false;
      setUnlocked(false);
      return false;
    }
  }, []);

  const saveBlobDownload = (blob: Blob, downloadName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const runDownload = useCallback(
    async (
      id: number,
      category: string,
      downloadName: string,
      pdfFile: string,
      skipLockCheck = false,
      pdfUrl = ""
    ) => {
      if (!skipLockCheck && !unlockedRef.current) {
        pendingDownloadRef.current = { id, category, downloadName, pdfFile, pdfUrl };
        setShowFormPopup(true);
        return;
      }

      setDownloadingId(id);
      try {
        const isUnlocked = skipLockCheck || (await refreshUnlockStatus());
        if (!isUnlocked) {
          pendingDownloadRef.current = { id, category, downloadName, pdfFile, pdfUrl };
          setShowFormPopup(true);
          return;
        }

        // GA4: catalogue download request (unlocked)
        trackGa4Event("catalog_download", {
          lead_source: "catalog_download_btn",
          category,
          download_name: downloadName,
        });

        const sourceUrl =
          pdfUrl && (pdfUrl.startsWith("http") || pdfUrl.startsWith("/uploads"))
            ? pdfUrl
            : pdfFile
              ? `/catlog/${pdfFile}`
              : "";

        if (!sourceUrl) {
          throw new Error("No catalogue PDF configured in admin.");
        }

        const res = await fetch(sourceUrl, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(
            "Catalogue PDF not found. Upload a PDF in the admin catalogue section."
          );
        }

        const blob = await res.blob();
        if (blob.size < 500) {
          throw new Error(t("home.catalog.downloadErrorDesc"));
        }

        saveBlobDownload(blob, downloadName);

        toast.success(t("home.catalog.downloadStarted"), {
          description: category,
        });
      } catch (err) {
        toast.error(t("home.catalog.downloadError"), {
          description:
            err instanceof Error
              ? err.message
              : t("home.catalog.downloadErrorDesc"),
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [refreshUnlockStatus, t]
  );

  useEffect(() => {
    refreshUnlockStatus();
  }, [refreshUnlockStatus]);

  const handleGateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phoneNumber"
        ? value.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "")
        : name === "fullName"
          ? value.replace(/[^\p{L}\s'.-]/gu, "")
          : value;

    setGateForm((prev) => ({ ...prev, [name]: nextValue }));
    setGateErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const closePopup = () => {
    setShowFormPopup(false);
    setGateErrors({});
  };

  const handleGateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateGateForm(gateForm, t);
    if (Object.keys(errors).length > 0) {
      setGateErrors(errors);
      return;
    }

    const pending = pendingDownloadRef.current;
    setSubmitting(true);

    const fullName = gateForm.fullName.trim();
    const email = gateForm.email.trim();
    const phone = gateForm.phoneNumber.trim();
    const fallbackPhone = phone || "0000000000";
    const fallbackEmail =
      email ||
      `catalogue.${fallbackPhone.replace(/\D/g, "")}@thailandkitchens.lead`;

    try {
      const payload: ContactData = {
        fullName,
        email: fallbackEmail,
        phoneCode: "+66",
        phoneNumber: fallbackPhone,
        whatsappNumber: fallbackPhone,
        cityName: "Catalogue Lead",
        countryName: "Catalogue Lead",
        message: `Catalogue download request from ${fullName}. Contact: ${email || "no email"} / ${phone || "no phone"}.`,
      };

      try {
        await createContact(payload);
      } catch {
        /* lead save is best-effort; still unlock download */
      }

      try {
        await fetch("/api/catalog/unlock", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* unlock is best-effort */
      }

      unlockedRef.current = true;
      setUnlocked(true);
      setGateForm(emptyGate);
      setGateErrors({});
      setShowFormPopup(false);

      // GA4: catalogue download unlocked after gate submit
      trackGa4Event("catalog_unlock", {
        lead_source: "catalog_gate",
      });

      toast.success(t("form.successTitle"), {
        description: t("form.successDescCatalog"),
      });

      if (pending) {
        pendingDownloadRef.current = null;
        await runDownload(
          pending.id,
          pending.category,
          pending.downloadName,
          pending.pdfFile,
          true,
          pending.pdfUrl || ""
        );
      }
    } catch (err: unknown) {
      toast.error(t("form.errorTitle"), {
        description:
          err instanceof Error ? err.message : t("form.errorDesc"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="pb-8 sm:pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="flex flex-col sm:flex-row gap-2 sm:gap-4 h-auto sm:h-[520px] lg:h-[600px]"
            onMouseLeave={() => setActive(null)}
          >
            {items.length === 0 ? (
              <p className="text-sm text-[#6B6B6B]">
                {cmsLoading
                  ? t("home.catalog.downloading")
                  : t("home.catalog.empty")}
              </p>
            ) : null}
            {items.map((item, index) => {
              const isActive = active === index;
              const isIdle = active === null;
              const isDownloading = downloadingId === item.id;
              const title = pickCmsText(item.title, "Catalogue", locale);
              const category = pickCmsText(item.category, "Catalogue", locale);
              const imageSrc =
                typeof item.image === "string" ? item.image.trim() : "";

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => setActive(index)}
                  className={`group relative flex flex-col min-w-0 transition-[flex] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isIdle
                      ? "sm:flex-1"
                      : isActive
                        ? "sm:flex-[2.4]"
                        : "sm:flex-[0.8]"
                  }`}
                >
                  <div className="relative w-full h-50 sm:h-full overflow-hidden rounded-2xl">
                    {imageSrc ? (
                      <CmsResolvedImage
                        src={imageSrc}
                        alt={title}
                        fill
                        className={`object-cover transition-transform duration-700 ease-out ${
                          isActive || isIdle
                            ? "scale-100 group-hover:scale-105"
                            : "scale-100"
                        }`}
                        sizes="(max-width: 640px) 50vw, 50vw"
                      />
                    ) : null}

                    <button
                      type="button"
                      aria-label={t("home.catalog.downloadBtn")}
                      disabled={isDownloading}
                      onClick={(e) => {
                        e.stopPropagation();
                        runDownload(
                          item.id,
                          category,
                          item.downloadName,
                          item.pdf,
                          false,
                          item.pdfUrl || ""
                        );
                      }}
                      className={`absolute inset-0 z-10 grid place-items-center bg-[#1A1A1A]/55 transition-opacity duration-500 cursor-pointer border-0 p-0 ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto"
                      }`}
                    >
                      <span className="pointer-events-none inline-flex items-center gap-2 bg-[#E0905A] text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-lg transition-transform duration-500 scale-100 group-hover:scale-105">
                        <Download size={18} />
                        {isDownloading
                          ? t("home.catalog.downloading")
                          : t("home.catalog.downloadBtn")}
                      </span>
                    </button>
                  </div>

                  <div
                    className={`mt-2 sm:mt-4 transition-opacity duration-500 ${
                      isIdle || isActive ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    <p className="text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-[#E0905A] font-semibold mb-0.5 sm:mb-1">
                      {category}
                    </p>
                    <Link
                      href="/catalogue"
                      className="text-xs sm:text-base font-bold uppercase tracking-[0.08em] text-[#1A1A1A] hover:text-[#E0905A] transition-colors"
                    >
                      {title}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:flex justify-center gap-2 mt-6">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Show ${pickCmsText(item.category, "Catalogue", locale)} catalogue`}
                onClick={() => setActive(index)}
                className={`h-2.5 w-2.5 rounded-full border transition-colors duration-300 ${
                  active === index
                    ? "border-[#1A1A1A] bg-white"
                    : "border-[#C8C0B6] bg-[#D8D2C8]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {showFormPopup ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-gate-title"
            className="relative w-full max-w-lg bg-white rounded-[1.75rem] p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePopup}
              className="absolute top-5 right-5 text-[#8A7A68] hover:text-[#1A1A1A] transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
              {t("home.catalog.eyebrow")}
            </p>
            <h3
              id="catalog-gate-title"
              className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2 leading-snug pr-8"
            >
              {t("home.catalog.lockTitle")}
            </h3>
            <p className="text-[#6B6B6B] text-sm leading-7 mb-8">
              {t("home.catalog.lockDesc")}
            </p>

            <form onSubmit={handleGateSubmit} className="grid grid-cols-1 gap-y-7">
              <div className="w-full">
                <label
                  htmlFor="catalog-fullName"
                  className="block text-[11px] tracking-[0.18em] uppercase text-[#8A7A68] mb-2"
                >
                  {t("form.fullName")}
                </label>
                <input
                  id="catalog-fullName"
                  name="fullName"
                  type="text"
                  value={gateForm.fullName}
                  onChange={handleGateChange}
                  className="w-full bg-transparent border-0 border-b border-[#1A1A1A]/20 pb-3 pt-1 text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
                />
                {gateErrors.fullName ? (
                  <p className="mt-2 text-xs text-red-500">{gateErrors.fullName}</p>
                ) : null}
              </div>

              <div className="w-full">
                <label
                  htmlFor="catalog-email"
                  className="block text-[11px] tracking-[0.18em] uppercase text-[#8A7A68] mb-2"
                >
                  {t("form.email")}
                </label>
                <input
                  id="catalog-email"
                  name="email"
                  type="email"
                  value={gateForm.email}
                  onChange={handleGateChange}
                  className="w-full bg-transparent border-0 border-b border-[#1A1A1A]/20 pb-3 pt-1 text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
                />
                {gateErrors.email ? (
                  <p className="mt-2 text-xs text-red-500">{gateErrors.email}</p>
                ) : null}
              </div>

              <div className="w-full">
                <label
                  htmlFor="catalog-phoneNumber"
                  className="block text-[11px] tracking-[0.18em] uppercase text-[#8A7A68] mb-2"
                >
                  {t("form.phone")}
                </label>
                <input
                  id="catalog-phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={gateForm.phoneNumber}
                  onChange={handleGateChange}
                  className="w-full bg-transparent border-0 border-b border-[#1A1A1A]/20 pb-3 pt-1 text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors"
                />
                {gateErrors.phoneNumber ? (
                  <p className="mt-2 text-xs text-red-500">
                    {gateErrors.phoneNumber}
                  </p>
                ) : null}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition disabled:opacity-70"
                >
                  {submitting ? t("form.sending") : t("home.catalog.downloadBtn")}
                  {!submitting && <Download size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
