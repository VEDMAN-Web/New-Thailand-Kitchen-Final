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
  if (trimmed === "/brand/brand.png" || trimmed.endsWith("/brand/brand.png")) {
    return false;
  }
  return true;
}

function BrandLogo({ src }: { src: string }) {
  const resolved = useResolvedMediaUrl(resolveCmsMediaUrl(src), "image");
  return (
    <Image
      src={resolved}
      alt="brand"
      width={150}
      height={60}
      className="object-contain h-9 sm:h-12 lg:h-14 w-auto grayscale opacity-50"
      unoptimized
    />
  );
}

export default function BrandSlider() {
  const partners = useCmsSection<{
    logos?: { name?: string; image?: string }[];
  }>("partners");

  const cmsLogos = (partners?.logos || [])
    .map((l) => String(l.image || ""))
    .filter(isUsableLogo);

  const logos = cmsLogos.length > 0 ? cmsLogos : brands;

  const renderSet = (setId: string) =>
    logos.map((logo, index) => (
      <div key={`${logo}-${setId}-${index}`} className="flex-shrink-0">
        <BrandLogo src={logo} />
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
