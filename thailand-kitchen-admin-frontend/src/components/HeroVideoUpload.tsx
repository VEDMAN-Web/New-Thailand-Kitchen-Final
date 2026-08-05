"use client";

import { useEffect, useRef, useState } from "react";
import {
  CloudUpload,
  Link2,
  Loader2,
  Lightbulb,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { uploadMedia } from "@/services/adminAPI";
import { clsx } from "clsx";

type Mode = "upload" | "url";

function isEmbedUrl(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function toEmbedSrc(url: string) {
  // Already embed path
  if (/youtube\.com\/embed\//i.test(url)) return url;
  const yt =
    url.match(/youtu\.be\/([^?&/]+)/i) ||
    url.match(/[?&]v=([^?&]+)/i) ||
    url.match(/youtube\.com\/shorts\/([^?&/]+)/i);
  if (yt?.[1]) {
    const start = url.match(/[?&](?:t|start)=(\d+)/i)?.[1];
    return `https://www.youtube.com/embed/${yt[1]}${start ? `?start=${start}` : ""}`;
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export default function HeroVideoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>(() =>
    value && !value.includes("/uploads/") ? "url" : "upload"
  );
  const [uploading, setUploading] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value || "");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setUrlDraft(value || "");
  }, [value]);

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
    const next = urlDraft.trim();
    onChange(next);
    if (next) toast.success("Video URL saved");
  };

  const clear = () => {
    onChange("");
    setUrlDraft("");
  };

  const preview = value.trim();
  const embed = preview && isEmbedUrl(preview);

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
              placeholder="https://… or YouTube / CDN video URL"
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
            Paste a direct video URL from S3, CDN, cloud storage — or a YouTube
            embed / watch link.
          </p>
        </div>
      )}

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

          {embed ? (
            <iframe
              title="Hero video preview"
              src={toEmbedSrc(preview)}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={preview}
              src={preview}
              controls
              className="aspect-video w-full bg-black"
            />
          )}

          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold text-white">
            <Video className="h-3.5 w-3.5 text-emerald-400" />
            {mode === "url" || embed ? "Video URL Link" : "Uploaded File"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
