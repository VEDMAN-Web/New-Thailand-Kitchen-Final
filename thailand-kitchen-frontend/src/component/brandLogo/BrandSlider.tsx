"use client";

import Image from "next/image";
import { brands } from "./brandData";
import { useCmsSection } from "../../lib/CmsHomeContext";

function isUsableLogo(src?: string | null): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  if (!trimmed) return false;
  // Bad CMS default that does not exist in /public
  if (trimmed === "/brand/brand.png" || trimmed.endsWith("/brand/brand.png")) {
    return false;
  }
  return true;
}

export default function BrandSlider() {
  const partners = useCmsSection<{
    logos?: { name?: string; image?: string }[];
  }>("partners");

  const cmsLogos = (partners?.logos || [])
    .map((l) => l.image)
    .filter(isUsableLogo);

  const logos = cmsLogos.length > 0 ? cmsLogos : brands;
  const loop = [...logos, ...logos];

  return (
    <section className="py-12 overflow-hidden ">
      <div className="relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {loop.map((logo, index) => (
            <div key={`${logo}-${index}`} className="flex-shrink-0 mx-10 lg:mx-16">
              <Image
                src={logo}
                alt="brand"
                width={150}
                height={60}
                className="object-contain h-14 w-auto grayscale opacity-50"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
