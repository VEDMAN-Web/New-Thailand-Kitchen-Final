"use client";

import { useEffect, useState } from "react";
import {
  needsRemoteMediaResolve,
  resolveCmsMediaUrl,
  resolveRemoteCmsMedia,
} from "./cmsMedia";

/** Resolve Pexels/Unsplash page links to a playable/displayable CDN URL. */
export function useResolvedMediaUrl(
  url: string,
  field: "image" | "video" = "image"
): string {
  const local = resolveCmsMediaUrl(url);
  const [src, setSrc] = useState(local);

  useEffect(() => {
    const nextLocal = resolveCmsMediaUrl(url);
    if (!needsRemoteMediaResolve(nextLocal)) {
      setSrc(nextLocal);
      return;
    }
    let cancelled = false;
    setSrc(nextLocal);
    void resolveRemoteCmsMedia(nextLocal, field).then((resolved) => {
      if (!cancelled) setSrc(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [url, field]);

  return src;
}
