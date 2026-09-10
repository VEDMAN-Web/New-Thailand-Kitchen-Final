"use client";

import Image from "next/image";
import { brands } from "./brandData";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { resolveCmsMediaUrl } from "../../lib/cmsMedia";
import { useResolvedMediaUrl } from "../../lib/useResolvedMediaUrl";

function isUsableLogo(src?: string | null): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  if (/\/brandLogo\/partner-\d\.svg$/i.test(trimmed)) return false;
  // Block known CMS placeholder that is not a real partner logo asset.
  if (/\/brand\/brand\.png$/i.test(trimmed)) return false;
  return true;
}

function BrandLogo({ src, name }: { src: string; name?: string }) {
  const resolved = useResolvedMediaUrl(resolveCmsMediaUrl(src), "image");
  return (
    <div className="flex h-12 sm:h-14 lg:h-16 items-center justify-center rounded-xl bg-white px-4 py-2 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <Image
        src={resolved}
        alt={name || ""}
        width={150}
        height={60}
        className="object-contain h-8 sm:h-10 lg:h-11 w-auto"
        unoptimized
        aria-hidden={!name}
      />
    </div>
  );
}

export default function BrandSlider() {
  const partners = useCmsSection<{
    logos?: { name?: string; image?: string }[];
  }>("partners");

  const cmsLogos = (partners?.logos || [])
    .map((l) => ({
      image: String(l.image || ""),
      name: String(l.name || "").trim(),
    }))
    .filter((l) => isUsableLogo(l.image));

  const logos =
    cmsLogos.length > 0
      ? cmsLogos
      : brands.map((image) => ({ image, name: "" }));

  const renderSet = (setId: string) =>
    logos.map((logo, index) => (
      <div key={`${logo.image}-${setId}-${index}`} className="flex-shrink-0">
        <BrandLogo src={logo.image} name={logo.name} />
      </div>
    ));

  return (
    <section id="brands" className="py-12 overflow-hidden">
      <div className="relative">
        <div className="flex w-max animate-marquee items-center gap-6 sm:gap-10 lg:gap-16 whitespace-nowrap">
          {renderSet("a")}
          {renderSet("b")}
          {/* Desktop-only 3rd set (>=769px): wide viewports need more than 2
              sets in the track to stay fully covered with no empty gap.
              display:none on mobile keeps mobile's DOM/width unchanged. */}
          <div className="hidden min-[769px]:contents">{renderSet("c")}</div>
        </div>
      </div>
    </section>
  );
}
