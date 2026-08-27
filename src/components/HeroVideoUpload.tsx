"use client";

import { useEffect, useRef, useState } from "react";
import {
  CloudUpload,
  ExternalLink,
  Link2,
  Loader2,
  Lightbulb,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { resolveMediaUrl, uploadMedia } from "@/services/adminAPI";
import {
  classifyMediaUrl,
  isEmbedVideoUrl,
  isPlayableVideoSrc,
  mediaUrlHint,
  needsRemoteResolve,
  resolveAdminMediaPreviewFallbacks,
  toEmbedVideoSrc,
} from "@/lib/adminMediaPreview";
import { clsx } from "clsx";
import AdminImage from "@/components/AdminImage";

type Mode = "upload" | "url";

export default function HeroVideoUpload({
  value,
  onChange,
  fallbackUrl = "",
}: {
  value: string;
  onChange: (url: string) => void;
  /** Live-site video shown (with URL) when CMS field is empty. */
  fallbackUrl?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stored = String(value || "").trim();
  const fallback = String(fallbackUrl || "").trim();
  const effective = stored || fallback;
  const showingSiteFallback = !stored && Boolean(fallback);

  const [mode, setMode] = useState<Mode>(() =>
    effective && !effective.includes("/uploads/") ? "url" : "upload"
  );
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(effective);
  const [dragOver, setDragOver] = useState(false);
  const [remotePreviewUrl, setRemotePreviewUrl] = useState("");
  const [remotePlayableUrl, setRemotePlayableUrl] = useState("");
  const [remoteHint, setRemoteHint] = useState("");
  const [resolving, setResolving] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);

  useEffect(() => {
    setUrlDraft(stored || fallback);
    if (effective && !effective.includes("/uploads/")) setMode("url");
  }, [stored, fallback, effective]);

  const urlKind = classifyMediaUrl(effective);
  const guidance =
    remoteHint ||
    (showingSiteFallback
      ? "Empty CMS field — previewing the current live-site video. Sync from DB or Apply to save this URL."
      : mediaUrlHint(urlKind, true));
  const embed = Boolean(effective) && isEmbedVideoUrl(effective);
  const playableSrc =
    remotePlayableUrl || (isPlayableVideoSrc(effective) ? effective : "");
  const directVideo = Boolean(playableSrc) && !embed;
  const previewCandidates = playableSrc
    ? resolveAdminMediaPreviewFallbacks(playableSrc)
    : [];
  const videoElSrc =
    previewCandidates[Math.min(srcIndex, Math.max(previewCandidates.length - 1, 0))] ||
    playableSrc;

  useEffect(() => {
    setSrcIndex(0);
  }, [playableSrc]);

  useEffect(() => {
    setRemotePreviewUrl("");
    setRemotePlayableUrl("");
    setRemoteHint("");

    const trimmed = effective;
    if (!trimmed || !needsRemoteResolve(classifyMediaUrl(trimmed))) return;

    let cancelled = false;
    setResolving(true);
    void resolveMediaUrl(trimmed, "video")
      .then((res) => {
        if (cancelled) return;
        const next =
          (res.playable && (res.resolvedUrl || res.previewUrl)) ||
          (res.resolvedUrl && isPlayableVideoSrc(res.resolvedUrl)
            ? res.resolvedUrl
            : "");
        if (next) {
          setRemotePlayableUrl(next);
          setRemoteHint("");
          return;
        }
        if (res.previewUrl) setRemotePreviewUrl(res.previewUrl);
        if (res.hint) setRemoteHint(res.hint);
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteHint(
            "Could not resolve this link. Upload the video file or paste a direct .mp4 / YouTube / Vimeo URL."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effective]);

  const onFile = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be 50MB or smaller");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadMedia(file, "video");
      if (!res?.file?.url) throw new Error("No URL returned");
      onChange(res.file.url);
      setMode("upload");
      toast.success("Video uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const applyUrl = () => {
    const next = urlDraft.trim() || fallback;
    onChange(next);
    if (next) toast.success("Video URL saved");
  };

  const clear = () => {
    onChange("");
    setUrlDraft(fallback);
  };

  const preview = effective;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-[#5C6370]">
        Hero Video Upload (optional)
      </label>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#F3F4F6] p-1">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            mode === "upload"
              ? "bg-white text-[#1A2332] shadow-sm"
              : "text-[#6B7280] hover:text-[#1A2332]"
          )}
        >
          <Upload className="w-4 h-4" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            mode === "url"
              ? "bg-white text-[#1A2332] shadow-sm"
              : "text-[#6B7280] hover:text-[#1A2332]"
          )}
        >
          <Link2 className="w-4 h-4" />
          Video Link / URL
        </button>
      </div>

      {mode === "upload" ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          className={clsx(
            "w-full rounded-xl border-2 border-dashed px-4 py-10 text-center transition",
            dragOver
              ? "border-[#1A2332] bg-[#F8FAFC]"
              : "border-[#D1D5DB] bg-white hover:border-[#9CA3AF]",
            uploading && "opacity-70"
          )}
        >
          {uploading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#1A2332]" />
          ) : (
            <CloudUpload className="mx-auto h-8 w-8 text-[#9CA3AF]" />
          )}
          <p className="mt-3 text-sm font-semibold text-[#1A2332]">
            {preview
              ? "Click or Drag to replace video file"
              : "Click or Drag to upload video file"}
          </p>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            MP4, WebM, OGG, MOV (Max 50MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.ogv,.mov"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </button>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#5C6370]">
            Video URL Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onBlur={applyUrl}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
              placeholder="Direct .mp4, YouTube, Vimeo, or Pexels video URL"
              className="flex-1 rounded-lg border border-[#E2E5EA] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2332]/15 focus:border-[#1A2332]"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="rounded-lg bg-[#1A2332] px-4 py-2 text-xs font-semibold text-white"
            >
              Apply
            </button>
          </div>
          <p className="flex items-start gap-1.5 text-[11px] text-[#9CA3AF]">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Use Upload, a direct .mp4 URL, YouTube/Vimeo, or a Pexels video /
            download link — those play in preview and on the live site.
          </p>
        </div>
      )}

      {guidance ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
          {guidance}
        </p>
      ) : null}

      {preview ? (
        <div className="relative overflow-hidden rounded-xl bg-black">
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700"
            aria-label="Remove video"
          >
            <X className="h-4 w-4" />
          </button>

          {resolving ? (
            <div className="flex aspect-video items-center justify-center bg-[#111] text-sm text-white/70">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Resolving preview…
            </div>
          ) : embed ? (
            <iframe
              title="Hero video preview"
              src={toEmbedVideoSrc(preview)}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : directVideo ? (
            <video
              key={videoElSrc}
              src={videoElSrc}
              controls
              className="aspect-video w-full bg-black"
              onError={() => {
                if (srcIndex + 1 < previewCandidates.length) {
                  setSrcIndex((i) => i + 1);
                }
              }}
            />
          ) : urlKind === "pexels-video-page" && remotePreviewUrl ? (
            <div className="relative aspect-video w-full">
              <AdminImage
                src={remotePreviewUrl}
                alt="Pexels thumbnail preview"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 px-4 text-center text-white">
                <ExternalLink className="h-6 w-6" />
                <p className="text-xs font-semibold">
                  Could not load this Pexels video yet. Try Apply again or upload a file.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-[#111] px-4 text-center text-white/80">
              <ExternalLink className="h-6 w-6" />
              <p className="text-xs">
                This URL cannot play as hero video. Upload a file or use a
                direct .mp4 / YouTube / Vimeo link.
              </p>
            </div>
          )}

          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold text-white">
            <Video className="h-3.5 w-3.5 text-emerald-400" />
            {showingSiteFallback
              ? "Live site video"
              : mode === "url" || embed
                ? "Video URL Link"
                : "Uploaded File"}
          </span>
        </div>
      ) : null}
      {preview ? (
        <p className="truncate text-[11px] text-[#64748B]" title={effective}>
          URL: {effective}
        </p>
      ) : null}
    </div>
  );
}
