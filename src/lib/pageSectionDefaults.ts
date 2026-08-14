import type { ContentSectionBlock } from "../components/seo/HubContentBlock";
import type { HubNavKey } from "./hubNavigation";
import type { KitchensSectionKey } from "../components/kitchens/kitchensConfig";

const IMG = {
  k1: "/products/Kitchen1.png",
  k2: "/products/Kitchen2.png",
  k3: "/products/Kitchen3.png",
  k4: "/products/Kitchen4.png",
  k5: "/products/Kitchen5.png",
  k6: "/products/Kitchen6.png",
  f2: "/features/image2.png",
};


function hashPick<T>(seed: string, items: T[]): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

/** Fallback when CMS hub page lacks rich, unique sections. */
export function defaultHubSections(
  hubKey: HubNavKey,
  kitchensSubKey?: KitchensSectionKey
): ContentSectionBlock[] {
  if (hubKey === "kitchens" && kitchensSubKey === "layouts") {
    return [
      {
        heading: "Choose the layout that fits your room",
        body: "Island · L-shape · U-shape · Galley · Straight|Each plan balances prep zones, storage depth, and traffic flow for Thai homes.",
        layout: "cards",
      },
      {
        heading: "How we plan your kitchen footprint",
        body: "Measure & zone|We map cooking, washing, and storage against your walls and light.\nDraft circulation|Walkways and appliance doors are cleared before we lock the layout.\nConfirm on site|Final dimensions are checked before manufacturing begins.",
        image: IMG.k2,
        layout: "steps",
      },
      {
        heading: "Layouts engineered for humidity and heat",
        body: "Ventilation paths, appliance clearances, and material choices are tuned for Thailand’s climate — not a European catalogue template.",
        image: IMG.k4,
        layout: "wide",
      },
    ];
  }

  if (hubKey === "kitchens" && kitchensSubKey === "styles") {
    return [
      {
        heading: "A style that stays calm for decades",
        body: "Modern, minimal, contemporary, and traditional Thai — proportions and finishes chosen to age gracefully, not chase trends.",
        image: IMG.k5,
        layout: "split-dark",
      },
      {
        heading: "“The finishes feel intentional — nothing looks bolted on.”",
        body: "Homeowner feedback from recent style-led projects across Bangkok and the islands.",
        layout: "quote",
      },
      {
        heading: "Details that carry the look",
        body: "Profiles & edges|Hardware finish|Worktop pairing|Lighting warmth",
        image: IMG.k3,
        layout: "checklist",
      },
    ];
  }

  if (hubKey === "kitchens" && kitchensSubKey === "byProperty") {
    return [
      {
        heading: "Property-first kitchen planning",
        body: "Villa|Condo|Apartment|Townhouse|Hotel / developer",
        layout: "stats",
        image: IMG.k1,
      },
      {
        heading: "Scale that matches the building",
        body: "Island depth, pantry access, and service routing change with property type — we design for how the building is actually used.",
        image: IMG.k6,
        layout: "image-right",
      },
      {
        heading: "Repeatable quality for multi-unit projects",
        body: "Module kits, shared finish libraries, and install programs that keep unit-to-unit consistency without looking identical.",
        layout: "band",
      },
    ];
  }

  const byHub: Record<HubNavKey, ContentSectionBlock[]> = {
    kitchens: [
      {
        heading: "Kitchen design shaped around daily life",
        body: "Layouts|Styles|By property|Every path starts with how you cook, host, and store — then we build the cabinetry to match.",
        layout: "cards",
        image: IMG.k2,
      },
      {
        heading: "From first sketch to final handover",
        body: "Consult & measure|Design & materials|Manufacture|Install & aftercare",
        image: IMG.k4,
        layout: "steps",
      },
      {
        heading: "Craft you can see in every joint",
        body: "Thai artisanship meets modern hardware standards — cabinets built for humidity, heat, and years of real use.",
        image: IMG.k1,
        layout: "wide",
      },
    ],
    services: [
      {
        heading: "A clear path from brief to install",
        body: "Discovery call|On-site measure|3D design approval|Fabrication|Installation|Handover",
        image: IMG.k3,
        layout: "steps",
      },
      {
        heading: "Services built for real homes",
        body: "Kitchen design|Installation|Renovation|Built-in furniture|Local project management",
        layout: "cards",
      },
      {
        heading: "Renovation without turning your home upside down",
        body: "Phased works, protected living areas, and a dedicated site lead — so timelines stay honest and daily life continues.",
        image: IMG.k4,
        layout: "split-dark",
      },
    ],
    materials: [
      {
        heading: "Materials specified for Thailand",
        body: "Humidity-stable boards|Heat-tolerant finishes|Worktops for daily prep|Hardware that won’t seize",
        layout: "checklist",
        image: IMG.f2,
      },
      {
        heading: "Touch, tone, and longevity",
        body: "Brass · lacquer · teak · marble · quartz — sampled in person so you feel the finish before we commit to production.",
        image: IMG.k5,
        layout: "wide",
      },
      {
        heading: "“We chose materials that still look new after monsoon season.”",
        body: "Material selection notes from villa projects in Samui and Phuket.",
        layout: "quote",
      },
    ],
    locations: [
      {
        heading: "Projects across Thailand",
        body: "Bangkok|Phuket|Koh Samui|Pattaya|Chiang Mai",
        layout: "stats",
      },
      {
        heading: "Local teams, national craft standard",
        body: "Site surveys, fabrication coordination, and installation crews who know local building practice and climate.",
        image: IMG.k1,
        layout: "image-left",
      },
      {
        heading: "Wherever you are building",
        body: "Book a consultation for your city — we plan logistics, lead times, and aftercare around your location.",
        layout: "band",
      },
    ],
    builtInFurniture: [
      {
        heading: "Built-ins aligned to the architecture",
        body: "Wardrobes|Vanities|Entertainment units|Closets & niches",
        layout: "cards",
        image: IMG.k2,
      },
      {
        heading: "Millimetre-true fitting",
        body: "We design to doors, windows, and ceiling lines so built-ins feel structural — not freestanding furniture pushed against a wall.",
        image: IMG.k5,
        layout: "split-dark",
      },
      {
        heading: "Same workshop as our kitchens",
        body: "Shared materials, hardware, and finishing standards — one craft language through the whole interior.",
        layout: "band",
      },
    ],
  };

  return byHub[hubKey] || byHub.kitchens;
}

/** Unique body sections per category type + title (not a shared template). */
export function defaultCategorySections(input: {
  title: string;
  description?: string;
  image?: string;
  categoryType?: string;
  slug?: string;
}): ContentSectionBlock[] {
  const title = input.title || "This collection";
  const type = String(input.categoryType || "service");
  const seed = `${type}:${input.slug || title}`;
  const imageA = input.image || hashPick(seed, [IMG.k1, IMG.k2, IMG.k3, IMG.k5]);
  const imageB = hashPick(seed + ":b", [IMG.k3, IMG.k4, IMG.k6, IMG.f2]);
  const lead =
    input.description?.split(/\n/)[0]?.trim() ||
    `${title} — designed and installed by Thailand Kitchens.`;

  if (type === "material") {
    return [
      {
        heading: `Working with ${title}`,
        body: `Finish character|Climate performance|Maintenance|Pairing with cabinetry`,
        layout: "checklist",
        image: imageA,
      },
      {
        heading: lead,
        body: `See and feel ${title} in context — we sample finishes against your lighting and existing materials before production.`,
        image: imageB,
        layout: "wide",
      },
      {
        heading: `“${title} changed how the whole kitchen feels.”`,
        body: "From recent material-led projects across Thailand.",
        layout: "quote",
      },
    ];
  }

  if (type === "service") {
    return [
      {
        heading: `How ${title} works`,
        body: `Brief & site visit|Design proposal|Approve materials|Fabrication|Install & handover`,
        image: imageA,
        layout: "steps",
      },
      {
        heading: `What’s included`,
        body: `Dedicated project lead|Measured drawings|Factory quality control|On-site install team|Aftercare guidance`,
        layout: "cards",
      },
      {
        heading: `Ready when you are`,
        body: `Talk to us about ${title} for your home or project — timelines, budget ranges, and next steps.`,
        layout: "band",
      },
    ];
  }

  if (type === "built-in-furniture") {
    return [
      {
        heading: `How we deliver ${title}`,
        body: `Measure & brief|Design proposal|Material selection|Fabrication|Install & handover`,
        image: imageA,
        layout: "steps",
      },
      {
        heading: `Built around your rooms`,
        body: lead,
        image: imageB,
        layout: "image-right",
      },
      {
        heading: `Ready to plan storage that lasts`,
        body: `Book a consultation — we design wardrobes and built-ins to your walls, lifestyle, and finishes.`,
        layout: "band",
      },
    ];
  }

  if (type === "layout") {
    return [
      {
        heading: `${title} planning principles`,
        body: `Work triangle|Storage depth|Appliance zones|Traffic clearance`,
        layout: "cards",
        image: imageA,
      },
      {
        heading: `Is ${title} right for your room?`,
        body: lead,
        image: imageB,
        layout: "image-right",
      },
      {
        heading: `We refine ${title} to your walls`,
        body: "Every run is measured on site — corners, columns, and window reveals decide the final module sizes.",
        layout: "band",
      },
    ];
  }

  if (type === "style") {
    return [
      {
        heading: `The ${title} look`,
        body: lead,
        image: imageA,
        layout: "split-dark",
      },
      {
        heading: `Signature moves`,
        body: `Colour & tone|Door profile|Hardware language|Worktop contrast`,
        layout: "checklist",
      },
      {
        heading: `“Living with ${title} feels effortless.”`,
        body: "Client notes from style-focused kitchen projects.",
        layout: "quote",
      },
    ];
  }

  if (type === "property-type") {
    return [
      {
        heading: `Kitchens for ${title} living`,
        body: lead,
        image: imageA,
        layout: "wide",
      },
      {
        heading: `What ${title} owners usually need`,
        body: `Storage strategy|Island vs peninsula|Service access|Guest-ready hosting`,
        layout: "cards",
      },
      {
        heading: `Designed for how ${title} homes work`,
        body: "We plan around your floor plate, ceiling height, and how guests move through the space.",
        layout: "band",
      },
    ];
  }

  if (type === "location") {
    return [
      {
        heading: `Kitchen projects in ${title}`,
        body: lead,
        image: imageA,
        layout: "image-left",
      },
      {
        heading: `Local delivery for ${title}`,
        body: `Site survey|Local install crew|Climate-aware materials|Aftercare nearby`,
        layout: "steps",
        image: imageB,
      },
      {
        heading: `Building in ${title}?`,
        body: "Book a consultation — we’ll map timelines and logistics for your address.",
        layout: "band",
      },
    ];
  }

  if (type === "built-in-furniture") {
    return [
      {
        heading: `${title}, fitted to the room`,
        body: lead,
        image: imageA,
        layout: "split-dark",
      },
      {
        heading: `Built-in essentials`,
        body: `Precise measure|Interior organisation|Matching finishes|Soft-close hardware`,
        layout: "checklist",
      },
      {
        heading: `From kitchen craft to ${title}`,
        body: "Same workshop standards as our kitchens — one finish language through the home.",
        layout: "band",
      },
    ];
  }

  return [
    {
      heading: title,
      body: lead,
      image: imageA,
      layout: "image-left",
    },
    {
      heading: "Designed, made, and installed",
      body: "Consult|Design|Make|Install",
      layout: "steps",
      image: imageB,
    },
    {
      heading: "Talk to our team",
      body: `Ask about ${title} for your project.`,
      layout: "band",
    },
  ];
}

export function sectionIsUsable(b: ContentSectionBlock) {
  return Boolean(
    (typeof b.heading === "string" && b.heading.trim()) ||
      (b.heading && typeof b.heading === "object") ||
      (typeof b.body === "string" && b.body.trim()) ||
      (b.body && typeof b.body === "object") ||
      String(b.image || "").trim()
  );
}

/**
 * Use CMS sections when the field exists (including an empty list).
 * Fall back to seeded defaults only when the CMS has never saved sections.
 */
export function resolvePageSections(
  sections: ContentSectionBlock[] | undefined,
  fallback: ContentSectionBlock[]
): ContentSectionBlock[] {
  if (!Array.isArray(sections)) return fallback;
  return sections.filter(sectionIsUsable);
}

/** @deprecated Use resolvePageSections — kept for imports during migration */
export function ensureMinSections(
  sections: ContentSectionBlock[] | undefined,
  fallback: ContentSectionBlock[],
  _min = 2
): ContentSectionBlock[] {
  return resolvePageSections(sections, fallback);
}
