"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { resolveMediaUrl, uploadMedia } from "@/services/adminAPI";
import {
  classifyMediaUrl,
  mediaUrlHint,
  needsRemoteResolve,
  pexelsVideoThumbnailUrl,
  resolveAdminMediaPreviewFallbacks,
} from "@/lib/adminMediaPreview";
import { clsx } from "clsx";

type Kind = "image" | "icon" | "pdf" | "any";

type UploadResult = {
  success?: boolean;
  file?: { url?: string };
};

export default function MediaUpload({
  label,
  value,
  onChange,
  kind = "image",
  accept,
  hint,
  uploadFile,
  previewSize = "md",
  clearable = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind?: Kind;
  accept?: string;
  hint?: string;
  uploadFile?: (file: File, kind: Kind) => Promise<UploadResult>;
  previewSize?: "sm" | "md" | "lg";
  clearable?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [remotePreviewUrl, setRemotePreviewUrl] = useState("");
  const [resolving, setResolving] = useState(false);

  const isImageField = kind === "image" || kind === "icon" || kind === "any";

  const defaultAccept =
    kind === "pdf"
      ? "application/pdf,.pdf"
      : kind === "icon"
        ? "image/png,image/svg+xml,image/webp,image/jpeg"
        : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

  const urlKind = classifyMediaUrl(value);
  const guidance = isImageField ? mediaUrlHint(urlKind, false) : "";

  const localThumb =
    urlKind === "pexels-video-page" ? pexelsVideoThumbnailUrl(value) : "";
  const fallbacks =
    remotePreviewUrl || localThumb
      ? [remotePreviewUrl || localThumb]
      : resolveAdminMediaPreviewFallbacks(value);
  const previewUrl = fallbacks[Math.min(previewIndex, Math.max(fallbacks.length - 1, 0))] || "";

  const wrongMediaForImageField =
    isImageField &&
    (urlKind === "pexels-video-page" ||
      urlKind === "direct-video" ||
      urlKind === "embed-video");

  useEffect(() => {
    setPreviewFailed(false);
    setPreviewIndex(0);
    setRemotePreviewUrl("");
    setResolving(false);

    const trimmed = value.trim();
    if (!trimmed || kind === "pdf" || !isImageField) return;

    const classified = classifyMediaUrl(trimmed);

    if (classified === "pexels-video-page") {
      const thumb = pexelsVideoThumbnailUrl(trimmed);
      if (thumb) setRemotePreviewUrl(thumb);
    }

    if (!needsRemoteResolve(classified)) return;

    let cancelled = false;
    setResolving(true);
    const timer = window.setTimeout(() => {
      if (!cancelled) setResolving(false);
    }, 4000);

    void resolveMediaUrl(trimmed, "image")
      .then((res) => {
        if (cancelled) return;
        const next = String(res.resolvedUrl || res.previewUrl || "").trim();
        const usable =
          Boolean(next) &&
          (/\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(next) ||
            /images\.pexels\.com|images\.unsplash\.com/i.test(next));
        if (usable) setRemotePreviewUrl(next);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setResolving(false);
        window.clearTimeout(timer);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, kind, isImageField]);

  const onFile = async (file?: File | null) => {
    if (!file || uploadingRef.current) return;
    if (kind === "pdf") {
      const name = String(file.name || "").toLowerCase();
      const mime = String(file.type || "").toLowerCase();
      if (mime && mime !== "application/pdf" && !name.endsWith(".pdf")) {
        toast.error("This field only accepts a PDF file.");
        return;
      }
    } else if (file.type.startsWith("video/")) {
      toast.error("This is an image field — upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File must be 50MB or smaller");
      return;
    }
    uploadingRef.current = true;
    setUploading(true);
    try {
      const res = uploadFile
        ? await uploadFile(file, kind)
        : await uploadMedia(file, kind);
      if (!res?.file?.url) throw new Error("No URL returned");
      onChange(res.file.url);
      toast.success("Uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shellClass =
    previewSize === "lg"
      ? "mt-2 w-full min-h-40 rounded-xl border border-[#E2E5EA] bg-[#F8FAFC]"
      : previewSize === "md"
        ? "mt-2 min-h-44 w-full max-w-xl rounded-lg border border-[#E2E5EA] bg-[#F8FAFC]"
        : "mt-2 h-16 w-full max-w-xs rounded-md border border-[#E2E5EA] bg-[#F8FAFC]";

  const imgClass =
    previewSize === "lg"
      ? "h-auto max-h-72 w-full object-contain"
      : previewSize === "md"
        ? "max-h-56 w-full object-contain"
        : "h-full w-auto max-w-full object-contain";

  const showPreview = Boolean(value.trim()) && kind !== "pdf";

  return (
    <div>
      <label className="block text-xs font-semibold text-[#5C6370] mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            kind === "pdf"
              ? "PDF URL or upload…"
              : "Paste image URL or upload…"
          }
          className="flex-1 rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E5EA] bg-[#F9FAFB] px-3 py-2 text-xs font-semibold text-[#1A2332] hover:bg-[#F3F4F6] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        {clearable && value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] bg-white px-3 py-2 text-xs font-semibold text-[#B91C1C] hover:bg-red-50"
            aria-label="Remove"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept || defaultAccept}
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {hint ? <p className="mt-1 text-[11px] text-[#9CA3AF]">{hint}</p> : null}

      {guidance ? (
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
          {guidance}
        </p>
      ) : null}

      {showPreview ? (
        <div
          className={clsx(
            shellClass,
            "relative overflow-hidden flex items-center justify-center"
          )}
        >
          {resolving && !previewUrl ? (
            <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview…
            </div>
          ) : previewFailed || (!previewUrl && wrongMediaForImageField) ? (
            <div className="flex flex-col items-center justify-center gap-1.5 px-3 text-center">
              <ImageOff className="h-5 w-5 text-[#9CA3AF]" />
              <p className="text-[11px] font-medium text-[#6B7280]">
                {wrongMediaForImageField
                  ? "Not a valid image URL for this field"
                  : "Preview failed — use Upload or a direct image URL"}
              </p>
            </div>
          ) : previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={previewUrl}
                src={previewUrl}
                alt=""
                referrerPolicy="no-referrer"
                className={imgClass}
                onLoad={() => {
                  setPreviewFailed(false);
                }}
                onError={() => {
                  if (previewIndex + 1 < fallbacks.length) {
                    setPreviewIndex((i) => i + 1);
                    return;
                  }
                  setPreviewFailed(true);
                }}
                ref={(el) => {
                  if (el?.complete && el.naturalWidth > 0) {
                    setPreviewFailed(false);
                  }
                }}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 px-3 text-center">
              <ImageOff className="h-5 w-5 text-[#9CA3AF]" />
              <p className="text-[11px] font-medium text-[#6B7280]">
                Paste an image URL or upload an image
              </p>
            </div>
          )}
        </div>
      ) : null}

      {value && kind === "pdf" ? (
        <p className="mt-2 truncate text-xs text-[#64748B]">{value}</p>
      ) : null}
    </div>
  );
}
