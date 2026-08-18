/**
 * Default kitchen landing sections for admin "Load template".
 * Keep in sync with backend src/seed/categoryPageTemplates.js
 */
import {
  asLocalizedForm,
  type LocalizedText,
} from "@/lib/localized";
import type { SectionBlockForm } from "@/components/SectionBlocksEditor";

const IMG = {
  k1: "/products/Kitchen1.png",
  k2: "/products/Kitchen2.png",
  k3: "/products/Kitchen3.png",
  k4: "/products/Kitchen4.png",
  k5: "/products/Kitchen5.png",
  k6: "/products/Kitchen6.png",
  f2: "/features/image2.png",
};

function L(en: string): LocalizedText {
  return { en, th: "", pl: "" };
}

function hashPick<T>(seed: string, items: T[]): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

export function buildDefaultCategorySections(input: {
  title: string;
  description?: string;
  image?: string;
  categoryType?: string;
  slug?: string;
}): SectionBlockForm[] {
  const title = input.title || "This collection";
  const type = String(input.categoryType || "service");
  const seed = `${type}:${input.slug || title}`;
  const imageA =
    (input.image || "").trim() ||
    hashPick(seed, [IMG.k1, IMG.k2, IMG.k3, IMG.k5]);
  const imageB = hashPick(`${seed}:b`, [IMG.k3, IMG.k4, IMG.k6, IMG.f2]);
  const lead =
    input.description?.split(/\n/)[0]?.trim() ||
    `${title} — designed and installed by Thailand Kitchens.`;

  if (type === "layout") {
    return [
      {
        heading: L(`${title} planning principles`),
        body: L("Work triangle|Storage depth|Appliance zones|Traffic clearance"),
        layout: "cards",
        image: imageA,
      },
      {
        heading: L(`Is ${title} right for your room?`),
        body: L(lead),
        image: imageB,
        layout: "image-right",
      },
      {
        heading: L(`We refine ${title} to your walls`),
        body: L(
          "Every run is measured on site — corners, columns, and window reveals decide the final module sizes."
        ),
        layout: "band",
        image: "",
      },
    ];
  }

  if (type === "style") {
    return [
      {
        heading: L(`The ${title} look`),
        body: L(lead),
        image: imageA,
        layout: "split-dark",
      },
      {
        heading: L("Signature moves"),
        body: L("Colour & tone|Door profile|Hardware language|Worktop contrast"),
        layout: "checklist",
        image: "",
      },
      {
        heading: L(`“Living with ${title} feels effortless.”`),
        body: L("Client notes from style-focused kitchen projects."),
        layout: "quote",
        image: "",
      },
    ];
  }

  if (type === "property-type") {
    return [
      {
        heading: L(`Kitchens for ${title} living`),
        body: L(lead),
        image: imageA,
        layout: "wide",
      },
      {
        heading: L(`What ${title} owners usually need`),
        body: L(
          "Storage strategy|Island vs peninsula|Service access|Guest-ready hosting"
        ),
        layout: "cards",
        image: "",
      },
      {
        heading: L(`Designed for how ${title} homes work`),
        body: L(
          "We plan around your floor plate, ceiling height, and how guests move through the space."
        ),
        layout: "band",
        image: "",
      },
    ];
  }

  if (type === "material") {
    return [
      {
        heading: L(`Working with ${title}`),
        body: L(
          "Finish character|Climate performance|Maintenance|Pairing with cabinetry"
        ),
        layout: "checklist",
        image: imageA,
      },
      {
        heading: L(lead),
        body: L(
          `See and feel ${title} in context — we sample finishes against your lighting and existing materials before production.`
        ),
        image: imageB,
        layout: "wide",
      },
      {
        heading: L(`“${title} changed how the whole kitchen feels.”`),
        body: L("From recent material-led projects across Thailand."),
        layout: "quote",
        image: "",
      },
    ];
  }

  if (type === "service") {
    return [
      {
        heading: L(`How ${title} works`),
        body: L(
          "Brief & site visit|Design proposal|Approve materials|Fabrication|Install & handover"
        ),
        image: imageA,
        layout: "steps",
      },
      {
        heading: L("What’s included"),
        body: L(
          "Dedicated project lead|Measured drawings|Factory quality control|On-site install team|Aftercare guidance"
        ),
        layout: "cards",
        image: "",
      },
      {
        heading: L("Ready when you are"),
        body: L(
          `Talk to us about ${title} for your home or project — timelines, budget ranges, and next steps.`
        ),
        layout: "band",
        image: "",
      },
    ];
  }

  if (type === "built-in-furniture") {
    return [
      {
        heading: L(`How we deliver ${title}`),
        body: L(
          "Measure & brief|Design proposal|Material selection|Fabrication|Install & handover"
        ),
        image: imageA,
        layout: "steps",
      },
      {
        heading: L("Built around your rooms"),
        body: L(lead),
        image: imageB,
        layout: "image-right",
      },
      {
        heading: L("Ready to plan storage that lasts"),
        body: L(
          "Book a consultation — we design wardrobes and built-ins to your walls, lifestyle, and finishes."
        ),
        layout: "band",
        image: "",
      },
    ];
  }

  if (type === "location") {
    return [
      {
        heading: L(`Kitchen projects in ${title}`),
        body: L(lead),
        image: imageA,
        layout: "image-left",
      },
      {
        heading: L(`Local delivery for ${title}`),
        body: L(
          "Site survey|Local install crew|Climate-aware materials|Aftercare nearby"
        ),
        layout: "steps",
        image: imageB,
      },
      {
        heading: L(`Building in ${title}?`),
        body: L(
          "Book a consultation — we’ll map timelines and logistics for your address."
        ),
        layout: "band",
        image: "",
      },
    ];
  }

  return [
    {
      heading: L(title),
      body: L(lead),
      image: imageA,
      layout: "image-left",
    },
  ];
}

export function defaultFooterCtaFields(title: string): {
  footerCtaHeading: LocalizedText;
  footerCtaBody: LocalizedText;
} {
  const t = title || "kitchen";
  return {
    footerCtaHeading: L(`Ready to plan your ${t.toLowerCase()}?`),
    footerCtaBody: L(
      "Speak with our design team for a free consultation and tailored quote."
    ),
  };
}

export function defaultEyebrowForType(categoryType: string): LocalizedText {
  switch (categoryType) {
    case "layout":
      return L("Layouts");
    case "style":
      return L("Styles");
    case "property-type":
      return L("Property");
    case "material":
      return L("Materials");
    case "service":
      return L("Services");
    case "built-in-furniture":
      return L("Built-in");
    case "location":
      return L("Explore");
    default:
      return L("Explore");
  }
}
