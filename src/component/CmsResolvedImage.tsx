"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cmsImageNeedsUnoptimized, DEFAULT_BLOG_COVER } from "../lib/cmsMedia";
import { useResolvedMediaUrl } from "../lib/useResolvedMediaUrl";

type Props = Omit<ImageProps, "src"> & {
  src: string;
};

/** next/image wrapper that turns Pexels/Unsplash page links into CDN files. */
export default function CmsResolvedImage({ src, alt, unoptimized, ...rest }: Props) {
  const resolved = useResolvedMediaUrl(src, "image");
  const [current, setCurrent] = useState(resolved || DEFAULT_BLOG_COVER);

  useEffect(() => {
    setCurrent(resolved || DEFAULT_BLOG_COVER);
  }, [resolved]);

  return (
    <Image
      src={current}
      alt={alt}
      unoptimized={unoptimized ?? cmsImageNeedsUnoptimized(current)}
      onError={() => {
        if (current !== DEFAULT_BLOG_COVER) setCurrent(DEFAULT_BLOG_COVER);
      }}
      {...rest}
    />
  );
}
