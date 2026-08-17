"use client";

import Image from "next/image";
import Link from "next/link";
import { cmsImageNeedsUnoptimized, resolveCmsMediaUrl } from "../../lib/cmsMedia";
import { useResolvedMediaUrl } from "../../lib/useResolvedMediaUrl";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
};

/** Full-bleed photo + dark overlay — hubs and category pages (admin hero fields). */
export default function OverlayHeroBanner({
  eyebrow,
  title,
  description,
  image,
  ctaLabel,
  ctaHref,
}: Props) {
  const src = useResolvedMediaUrl(resolveCmsMediaUrl(image), "image");
  const remote = cmsImageNeedsUnoptimized(src);

  return (
    <section className="relative min-h-[70vh] flex items-end">
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          unoptimized={remote}
        />
      ) : (
        <div className="absolute inset-0 bg-[#1A2332]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1A2332]/90 via-[#1A2332]/35 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-6 pb-12 sm:pb-16 pt-32">
        {eyebrow ? (
          <p className="text-[#D4B896] text-xs tracking-[0.22em] uppercase font-semibold mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-sans font-extrabold text-3xl md:text-4xl lg:text-5xl text-white leading-tight max-w-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-xl text-white/80 text-sm sm:text-base leading-7">
            {description}
          </p>
        ) : null}
        {ctaLabel ? (
          <Link
            href={ctaHref || "/contact"}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A2332] hover:bg-[#F5F3EF] transition"
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
