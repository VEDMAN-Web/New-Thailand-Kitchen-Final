"use client";

import Image, { type ImageProps } from "next/image";
import { cmsImageNeedsUnoptimized } from "../lib/cmsMedia";
import { useResolvedMediaUrl } from "../lib/useResolvedMediaUrl";

type Props = Omit<ImageProps, "src"> & {
  src: string;
};

/** next/image wrapper that turns Pexels/Unsplash page links into CDN files. */
export default function CmsResolvedImage({ src, alt, unoptimized, ...rest }: Props) {
  const resolved = useResolvedMediaUrl(src, "image");
  return (
    <Image
      src={resolved}
      alt={alt}
      unoptimized={unoptimized ?? cmsImageNeedsUnoptimized(resolved)}
      {...rest}
    />
  );
}
