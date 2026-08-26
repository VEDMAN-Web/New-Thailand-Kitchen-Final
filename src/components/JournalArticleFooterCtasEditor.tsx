"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import AdminSkeleton from "@/components/AdminSkeleton";
import LocaleTabs from "@/components/LocaleTabs";
import MediaUpload from "@/components/MediaUpload";
import { CMS_SYNCED_EVENT } from "@/lib/adminSectionNav";
import {
  asLocalizedForm,
  emptyLocalized,
  localeFieldPlaceholder,
  localizedValue,
  writeLocalized,
  type LocaleCode,
  type LocalizedText,
} from "@/lib/localized";
import {
  getVarsoviaSite,
  uploadVarsoviaMedia,
  varsoviaErrorMessage,
} from "@/services/varsoviaAPI";
import { DEFAULT_IA_PAGES } from "@/app/varsovia/iaPagesDefaults";
import { persistIaHubPatch } from "@/app/varsovia/persistIaHub";
import { useRegisterCmsFlush } from "@/lib/cmsFlushSaves";

const POINT_COUNT = 3;
const INPUT_CLS =
  "mt-1.5 w-full rounded-lg border border-[#E2E5EA] px-3.5 py-2.5 text-sm";

type ContactDraft = {
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText;
  ctaHref: string;
};

type OfferDraft = {
  eyebrow: LocalizedText;
  title: LocalizedText;
  text: LocalizedText;
  points: LocalizedText[];
  ctaLabel: LocalizedText;
  ctaHref: string;
  image: string;
  imageAlt: LocalizedText;
};

function padPoints(value: unknown): LocalizedText[] {
  const arr = Array.isArray(value) ? value : [];
  const next = arr.slice(0, POINT_COUNT).map((item) => asLocalizedForm(item));
  while (next.length < POINT_COUNT) next.push(emptyLocalized());
  return next;
}

function emptyContact(): ContactDraft {
  const seed = DEFAULT_IA_PAGES.journal.articleContact;
  return {
    title: asLocalizedForm(seed.title),
    subtitle: asLocalizedForm(seed.subtitle),
    ctaLabel: asLocalizedForm(seed.ctaLabel),
    ctaHref: String(seed.ctaHref || "/contact"),
  };
}

function emptyOffer(): OfferDraft {
  const seed = DEFAULT_IA_PAGES.journal.articleOffer;
  return {
    eyebrow: asLocalizedForm(seed.eyebrow),
    title: asLocalizedForm(seed.title),
    text: asLocalizedForm(seed.text),
    points: padPoints(seed.points),
    ctaLabel: asLocalizedForm(seed.ctaLabel),
    ctaHref: String(seed.ctaHref || "/contact"),
    image: String(seed.image || ""),
    imageAlt: asLocalizedForm(seed.imageAlt),
  };
}

function contactFromApi(raw: unknown): ContactDraft {
  const seed = emptyContact();
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    title: asLocalizedForm(value.title, localizedValue(seed.title, "en")),
    subtitle: asLocalizedForm(value.subtitle, localizedValue(seed.subtitle, "en")),
    ctaLabel: asLocalizedForm(value.ctaLabel, localizedValue(seed.ctaLabel, "en")),
    ctaHref: String(value.ctaHref || seed.ctaHref || "/contact"),
  };
}

function offerFromApi(raw: unknown): OfferDraft {
  const seed = emptyOffer();
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    eyebrow: asLocalizedForm(value.eyebrow, localizedValue(seed.eyebrow, "en")),
    title: asLocalizedForm(value.title, localizedValue(seed.title, "en")),
    text: asLocalizedForm(value.text, localizedValue(seed.text, "en")),
    points: padPoints(Array.isArray(value.points) && value.points.length ? value.points : seed.points),
    ctaLabel: asLocalizedForm(value.ctaLabel, localizedValue(seed.ctaLabel, "en")),
    ctaHref: String(value.ctaHref || seed.ctaHref || "/contact"),
    image: String(value.image || seed.image || ""),
    imageAlt: asLocalizedForm(value.imageAlt, localizedValue(seed.imageAlt, "en")),
  };
}

function TextField({
  label,
  value,
  locale,
  onChange,
  multiline,
}: {
  label: string;
  value: LocalizedText;
  locale: LocaleCode;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
}) {
  const current = localizedValue(value, locale, { strict: true });
  return (
    <label className="block text-xs font-semibold text-[#5C6370]">
      {label} ({locale.toUpperCase()})
      {multiline ? (
        <textarea
          rows={3}
          value={current}
          placeholder={localeFieldPlaceholder(locale)}
          onChange={(e) => onChange(writeLocalized(value, locale, e.target.value))}
          className={INPUT_CLS}
        />
      ) : (
        <input
          value={current}
          placeholder={localeFieldPlaceholder(locale)}
          onChange={(e) => onChange(writeLocalized(value, locale, e.target.value))}
          className={INPUT_CLS}
        />
      )}
    </label>
  );
}

function FieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-[#E8EDF2] bg-[#F8FAFC] p-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5C6370]">{title}</p>
        {hint ? (
          <p className="mt-1 text-[11px] font-normal leading-snug text-[#6B7280]">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function JournalArticleFooterCtasEditor() {
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [contact, setContact] = useState<ContactDraft>(emptyContact);
  const [offer, setOffer] = useState<OfferDraft>(emptyOffer);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const site = await getVarsoviaSite();
      // Trust MongoDB data AS-IS - do NOT merge with defaults
      const allPages = (site.pages && typeof site.pages === "object" && !Array.isArray(site.pages))
        ? (site.pages as Record<string, unknown>)
        : {};
      const hub = (allPages.journal || {}) as Record<string, unknown>;
      setContact(contactFromApi(hub.articleContact));
      setOffer(offerFromApi(hub.articleOffer));
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to load article footer bands"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onSynced = () => void load();
    window.addEventListener(CMS_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(CMS_SYNCED_EVENT, onSynced);
  }, [load]);

  const save = async (opts?: { quiet?: boolean }): Promise<boolean> => {
    setSaving(true);
    try {
      // Save to backend
      await persistIaHubPatch("journal", {
        articleContact: {
          title: asLocalizedForm(contact.title),
          subtitle: asLocalizedForm(contact.subtitle),
          ctaLabel: asLocalizedForm(contact.ctaLabel),
          ctaHref: contact.ctaHref.trim() || "/contact",
        },
        articleOffer: {
          eyebrow: asLocalizedForm(offer.eyebrow),
          title: asLocalizedForm(offer.title),
          text: asLocalizedForm(offer.text),
          points: offer.points.map((point) => asLocalizedForm(point)),
          ctaLabel: asLocalizedForm(offer.ctaLabel),
          ctaHref: offer.ctaHref.trim() || "/contact",
          image: offer.image.trim(),
          imageAlt: asLocalizedForm(offer.imageAlt),
        },
      });
      
      // MIRROR THAILAND KITCHEN PATTERN: Trust what we sent, don't re-fetch
      // contact and offer already have the correct data that the user edited
      // No need to: const merged = await persistIaHubPatch(); setContact(contactFromApi(hub.articleContact)); setOffer(offerFromApi(hub.articleOffer));
      
      if (!opts?.quiet) toast.success("Article footer bands saved");
      return true;
    } catch (err) {
      toast.error(varsoviaErrorMessage(err, "Failed to save article footer bands"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  useRegisterCmsFlush("journal-footer", true, () => save({ quiet: true }));

  return (
    <div className="rounded-2xl border border-[#E8EAED] bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A2332]">
            Article footer — every /journal/p/[id]
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#6B7280]">
            Shared Contact Varsovia + Your kitchen bands. Same copy on every article. Get Offers
            goes to the contact page.
          </p>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void save()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1A2332] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243044] disabled:opacity-60"
        >
          <CloudUpload className="h-4 w-4" />
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <LocaleTabs locale={locale} onChange={setLocale} />

      {loading ? (
        <AdminSkeleton variant="panel" />
      ) : (
        <div className="space-y-4">
          <FieldGroup
            title="Contact Varsovia"
            hint="Centered blush band below Discover more. Contact Us opens the Get In Touch modal when the link is /contact."
          >
            <TextField
              label="Heading"
              value={contact.title}
              locale={locale}
              onChange={(title) => setContact((d) => ({ ...d, title }))}
            />
            <TextField
              label="Supporting line"
              value={contact.subtitle}
              locale={locale}
              multiline
              onChange={(subtitle) => setContact((d) => ({ ...d, subtitle }))}
            />
            <TextField
              label="Button text"
              value={contact.ctaLabel}
              locale={locale}
              onChange={(ctaLabel) => setContact((d) => ({ ...d, ctaLabel }))}
            />
            <label className="block text-xs font-semibold text-[#5C6370]">
              Button link
              <input
                value={contact.ctaHref}
                onChange={(e) => setContact((d) => ({ ...d, ctaHref: e.target.value }))}
                className={INPUT_CLS}
              />
            </label>
          </FieldGroup>

          <FieldGroup
            title="Your kitchen"
            hint="Split card under Contact Varsovia. Get Offers navigates to the contact page — it does not open the popup."
          >
            <TextField
              label="Eyebrow (small pink line)"
              value={offer.eyebrow}
              locale={locale}
              onChange={(eyebrow) => setOffer((d) => ({ ...d, eyebrow }))}
            />
            <TextField
              label="Headline"
              value={offer.title}
              locale={locale}
              onChange={(title) => setOffer((d) => ({ ...d, title }))}
            />
            <TextField
              label="Paragraph"
              value={offer.text}
              locale={locale}
              multiline
              onChange={(text) => setOffer((d) => ({ ...d, text }))}
            />
            {offer.points.map((point, index) => (
              <TextField
                key={index}
                label={`Checklist point ${index + 1}`}
                value={point}
                locale={locale}
                onChange={(next) =>
                  setOffer((d) => ({
                    ...d,
                    points: d.points.map((row, i) => (i === index ? next : row)),
                  }))
                }
              />
            ))}
            <TextField
              label="Button text"
              value={offer.ctaLabel}
              locale={locale}
              onChange={(ctaLabel) => setOffer((d) => ({ ...d, ctaLabel }))}
            />
            <label className="block text-xs font-semibold text-[#5C6370]">
              Button link
              <input
                value={offer.ctaHref}
                onChange={(e) => setOffer((d) => ({ ...d, ctaHref: e.target.value }))}
                className={INPUT_CLS}
              />
              <span className="mt-0.5 block text-[11px] font-normal text-[#9CA3AF]">
                Default /contact opens the contact page, not the modal.
              </span>
            </label>
            <MediaUpload
              label="Kitchen photo (right side)"
              kind="image"
              value={offer.image}
              onChange={(image) => setOffer((d) => ({ ...d, image }))}
              uploadFile={uploadVarsoviaMedia}
            />
            <TextField
              label="Photo alt text"
              value={offer.imageAlt}
              locale={locale}
              onChange={(imageAlt) => setOffer((d) => ({ ...d, imageAlt }))}
            />
          </FieldGroup>
        </div>
      )}
    </div>
  );
}
