"use client";

import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "../../i18n/LanguageProvider";
import type { CmsCatalogue } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import { useCmsSection } from "../../lib/CmsHomeContext";
import CmsResolvedImage from "../../component/CmsResolvedImage";
import { toast } from "sonner";

type CatalogueCms = {
  pageEyebrow?: unknown;
  pageTitle?: unknown;
  pageDescription?: unknown;
  eyebrow?: unknown;
  title?: unknown;
};

type LeadForm = {
  fullName: string;
  email: string;
  phone: string;
};

export default function CataloguePageClient({
  initialCatalogues,
}: {
  initialCatalogues: CmsCatalogue[];
}) {
  const { t, locale } = useTranslation();
  const cms = useCmsSection<CatalogueCms>("catalogue");

  const [unlocked, setUnlocked] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<CmsCatalogue | null>(null);
  const [leadForm, setLeadForm] = useState<LeadForm>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Check unlock status on mount
  useEffect(() => {
    fetch("/api/catalog/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.unlocked) setUnlocked(true);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  const pageEyebrow = pickCmsText(
    cms?.pageEyebrow || cms?.eyebrow,
    t("catalogue.eyebrow"),
    locale
  );
  const pageTitle = pickCmsText(
    cms?.pageTitle || cms?.title,
    t("catalogue.title"),
    locale
  );
  const pageDescription = pickCmsText(
    cms?.pageDescription,
    t("catalogue.description"),
    locale
  );

  const handleDownloadClick = async (catalogue: CmsCatalogue) => {
    if (!unlocked) {
      setPendingDownload(catalogue);
      setShowLeadModal(true);
      return;
    }

    // Already unlocked - download directly
    await triggerDownload(catalogue);
  };

  const triggerDownload = async (catalogue: CmsCatalogue) => {
    try {
      const res = await fetch(`/api/catalog/download?id=${catalogue.id}`);
      if (!res.ok) {
        const error = await res.json();
        toast.error("Download Failed", {
          description: error.message || "Could not download catalogue",
        });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = catalogue.downloadName || "catalogue.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Download Failed", {
        description: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { fullName, email, phone } = leadForm;

    if (!fullName.trim()) {
      toast.error("Validation Error", { description: "Name is required" });
      return;
    }

    if (!email.trim() && !phone.trim()) {
      toast.error("Validation Error", {
        description: "Email or phone number is required",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/catalog/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Submission Failed", {
          description: data.message || "Could not submit form",
        });
        setSubmitting(false);
        return;
      }

      setUnlocked(true);
      setShowLeadModal(false);
      setLeadForm({ fullName: "", email: "", phone: "" });
      
      toast.success("Success!", {
        description: "Your catalogue download is now unlocked",
      });

      if (pendingDownload) {
        await triggerDownload(pendingDownload);
        setPendingDownload(null);
      }
    } catch (err) {
      toast.error("Network Error", {
        description: err instanceof Error ? err.message : "Connection failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#F5F3EF]">
        <section className="pt-[80px] sm:pt-[84px] pb-16 lg:pb-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[#E0905A] text-xs tracking-[0.28em] uppercase font-medium mb-3">
              {pageEyebrow}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A]">
              {pageTitle}
            </h1>
            <p className="mt-5 text-[#6B6B6B] text-sm sm:text-base leading-7 max-w-xl mx-auto">
              {pageDescription}
            </p>

            {initialCatalogues.length === 0 ? (
              <p className="mt-10 text-sm text-[#6B6B6B]">{t("home.catalog.empty")}</p>
            ) : (
              <div className="mt-10 mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
                {initialCatalogues.map((entry, index) => {
                  const coverImg = entry.image || "/catlog/catlog.png";
                  const cardTitle = pickCmsText(
                    entry.title,
                    t("catalogue.fileTitle"),
                    locale
                  );
                  const cardCategory = pickCmsText(
                    entry.category,
                    t("catalogue.edition"),
                    locale
                  );

                  return (
                    <div
                      key={entry.id ?? index}
                      className="rounded-[1.75rem] overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-left"
                    >
                      <div className="relative w-full aspect-[4/5]">
                        <CmsResolvedImage
                          src={coverImg}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                      </div>
                      <div className="p-6">
                        <p className="text-[11px] tracking-[0.18em] uppercase text-[#E0905A] font-semibold mb-1">
                          {cardCategory}
                        </p>
                        <h2 className="text-lg font-bold uppercase tracking-wide text-[#1A1A1A]">
                          {cardTitle}
                        </h2>
                        <button
                          type="button"
                          onClick={() => handleDownloadClick(entry)}
                          className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition"
                        >
                          <Download size={18} />
                          {t("catalogue.download")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Lead Gate Modal */}
      {showLeadModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowLeadModal(false);
              setPendingDownload(null);
            }}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1A1A1A]">
                Download Catalogue
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLeadModal(false);
                  setPendingDownload(null);
                }}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#6B6B6B] hover:bg-black/5 transition"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-[#6B6B6B] mb-6">
              Please provide your contact details to download our catalogue.
            </p>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="lead-fullName"
                  className="block text-sm font-medium text-[#3A3A3A] mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="lead-fullName"
                  type="text"
                  value={leadForm.fullName}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, fullName: e.target.value })
                  }
                  className="w-full rounded-md border border-[#D8D8D8] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#A0A0A0] outline-none focus:border-[#B38B6D] transition"
                  placeholder="Enter your full name"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="lead-email"
                  className="block text-sm font-medium text-[#3A3A3A] mb-1.5"
                >
                  Email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  value={leadForm.email}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, email: e.target.value })
                  }
                  className="w-full rounded-md border border-[#D8D8D8] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#A0A0A0] outline-none focus:border-[#B38B6D] transition"
                  placeholder="your.email@example.com"
                  disabled={submitting}
                />
              </div>

              <div>
                <label
                  htmlFor="lead-phone"
                  className="block text-sm font-medium text-[#3A3A3A] mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) =>
                    setLeadForm({ ...leadForm, phone: e.target.value })
                  }
                  className="w-full rounded-md border border-[#D8D8D8] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#A0A0A0] outline-none focus:border-[#B38B6D] transition"
                  placeholder="+66 123 456 789"
                  disabled={submitting}
                />
              </div>

              <p className="text-xs text-[#6B6B6B]">
                * Email or phone number is required
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Download Catalogue"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
