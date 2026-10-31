"use client";

import Image from "next/image";
import { brands } from "./brandData";
import { useCmsSection } from "../../lib/CmsHomeContext";
import { resolveCmsMediaUrl } from "../../lib/cmsMedia";
import { useResolvedMediaUrl } from "../../lib/useResolvedMediaUrl";

// Each rendered set must be wider than the viewport so the loop has no empty gap.
const MIN_TILES_PER_SET = 16;

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
    <div className="flex h-14 sm:h-16 lg:h-20 items-center justify-center px-6">
      <Image
        src={resolved}
        alt={name ? `${name} logo` : "Partner brand logo"}
        width={150}
        height={60}
        className="object-contain h-9 sm:h-11 lg:h-14 w-auto"
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

  const baseLogos =
    cmsLogos.length > 0
      ? cmsLogos
      : brands.map((image) => ({ image, name: "" }));
  const logos = Array.from({
    length: Math.ceil(MIN_TILES_PER_SET / baseLogos.length),
  }).flatMap(() => baseLogos);

  // Keep scroll speed steady (~60px/s desktop, ~50px/s mobile) whatever the logo count.
  const desktopSeconds = Math.round((logos.length * 164) / 60);
  const mobileSeconds = Math.round((logos.length * 122) / 50);

  const renderSet = (setId: string) =>
    logos.map((logo, index) => (
      <div key={`${logo.image}-${setId}-${index}`} className="flex-shrink-0">
        <BrandLogo src={logo.image} name={logo.name} />
      </div>
    ));

  return (
    <section id="brands" className="py-12 overflow-hidden">
      <div className="relative">
        <div
          className="flex w-max animate-marquee items-center whitespace-nowrap bg-white"
          style={
            {
              "--marquee-d": `${desktopSeconds}s`,
              "--marquee-m": `${mobileSeconds}s`,
            } as React.CSSProperties
          }
        >
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
