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
      className="object-contain h-14 w-auto grayscale opacity-50"
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
  const loop = [...logos, ...logos];

  return (
    <section id="brands" className="py-12 overflow-hidden ">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {loop.map((logo, index) => (
            <div key={`${logo}-${index}`} className="flex-shrink-0 mx-10 lg:mx-16">
              <BrandLogo src={logo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
