"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { clsx } from "clsx";

type AdminImageProps = {
  src: string;
  alt: string;
  fallbackSrcs?: string[];
  className?: string;
  imageClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
};

export default function AdminImage({
  src,
  alt,
  fallbackSrcs = [],
  className,
  imageClassName,
  referrerPolicy,
}: AdminImageProps) {
  const sources = [src, ...fallbackSrcs].filter(Boolean).filter(
    (candidate, index, all) => all.indexOf(candidate) === index
  );
  const sourceKey = sources.join("|");
  const [state, setState] = useState<{
    key: string;
    index: number;
    status: "loading" | "loaded" | "error";
  }>({ key: sourceKey, index: 0, status: "loading" });
  const currentState = state.key === sourceKey
    ? state
    : { key: sourceKey, index: 0, status: "loading" as const };
  const currentSrc = sources[currentState.index] || "";

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {currentState.status === "loading" ? (
        <div
          className="absolute inset-0 animate-pulse bg-[#E9EDF2]"
          aria-label="Loading image"
          role="status"
        />
      ) : null}
      {currentState.status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#F3F4F6] px-3 text-center text-[#64748B]">
          <ImageOff className="h-5 w-5 text-[#94A3B8]" />
          <span className="text-[11px] font-medium">Image unavailable</span>
        </div>
      ) : null}
      {currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          referrerPolicy={referrerPolicy}
          className={clsx(
            "transition-opacity duration-300",
            imageClassName || "h-full w-full object-cover",
            currentState.status === "loaded" ? "opacity-100" : "opacity-0"
          )}
          onLoad={(event) => {
            setState({
              key: sourceKey,
              index: currentState.index,
              status: event.currentTarget.naturalWidth > 0 ? "loaded" : "error",
            });
          }}
          onError={() => {
            if (currentState.index + 1 < sources.length) {
              setState({ key: sourceKey, index: currentState.index + 1, status: "loading" });
            } else {
              setState({ key: sourceKey, index: currentState.index, status: "error" });
            }
          }}
          ref={(element) => {
            if (currentState.status === "loading" && element?.complete) {
              setState({
                key: sourceKey,
                index: currentState.index,
                status: element.naturalWidth > 0 ? "loaded" : "error",
              });
            }
          }}
        />
      ) : null}
    </div>
  );
}