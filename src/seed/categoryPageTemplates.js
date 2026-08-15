/**
 * Default landing-page sections for kitchen category types.
 * Keep in sync with thailand-kitchen-frontend/src/lib/pageSectionDefaults.ts
 * and thailand-kitchen-admin-frontend/src/lib/categoryPageTemplates.ts
 */
const { L } = require("../utils/localized");

const IMG = {
  k1: "/products/Kitchen1.png",
  k2: "/products/Kitchen2.png",
  k3: "/products/Kitchen3.png",
  k4: "/products/Kitchen4.png",
  k5: "/products/Kitchen5.png",
  k6: "/products/Kitchen6.png",
  f2: "/features/image2.png",
};

function hashPick(seed, items) {
  let h = 0;
  const s = String(seed || "");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return items[h % items.length];
}

function titleEn(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return String(value.en || value.th || value.pl || "").trim();
  }
  return String(value || "").trim();
}

function descriptionEn(value) {
  return titleEn(value);
}

/**
 * Build default sections for a category (layout / style / property-type / material / service).
 */
function buildDefaultCategorySections({
  title,
  description,
  image,
  categoryType,
  slug,
} = {}) {
  const titleText = titleEn(title) || "This collection";
  const type = String(categoryType || "service");
  const seed = `${type}:${slug || titleText}`;
  const imageA = String(image || "").trim() || hashPick(seed, [IMG.k1, IMG.k2, IMG.k3, IMG.k5]);
  const imageB = hashPick(`${seed}:b`, [IMG.k3, IMG.k4, IMG.k6, IMG.f2]);
  const lead =
    descriptionEn(description).split(/\n/)[0]?.trim() ||
    `${titleText} — designed and installed by Thailand Kitchens.`;

  if (type === "layout") {
    return [
      {
        heading: L(`${titleText} planning principles`),
        body: L("Work triangle|Storage depth|Appliance zones|Traffic clearance"),
        layout: "cards",
        image: imageA,
      },
      {
        heading: L(`Is ${titleText} right for your room?`),
        body: L(lead),
        image: imageB,
        layout: "image-right",
      },
      {
        heading: L(`We refine ${titleText} to your walls`),
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
        heading: L(`The ${titleText} look`),
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
        heading: L(`“Living with ${titleText} feels effortless.”`),
        body: L("Client notes from style-focused kitchen projects."),
        layout: "quote",
        image: "",
      },
    ];
  }

  if (type === "property-type") {
    return [
      {
        heading: L(`Kitchens for ${titleText} living`),
        body: L(lead),
        image: imageA,
        layout: "wide",
      },
      {
        heading: L(`What ${titleText} owners usually need`),
        body: L(
          "Storage strategy|Island vs peninsula|Service access|Guest-ready hosting"
        ),
        layout: "cards",
        image: "",
      },
      {
        heading: L(`Designed for how ${titleText} homes work`),
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
        heading: L(`Working with ${titleText}`),
        body: L(
          "Finish character|Climate performance|Maintenance|Pairing with cabinetry"
        ),
        layout: "checklist",
        image: imageA,
      },
      {
        heading: L(lead),
        body: L(
          `See and feel ${titleText} in context — we sample finishes against your lighting and existing materials before production.`
        ),
        image: imageB,
        layout: "wide",
      },
      {
        heading: L(`“${titleText} changed how the whole kitchen feels.”`),
        body: L("From recent material-led projects across Thailand."),
        layout: "quote",
        image: "",
      },
    ];
  }

  if (type === "service") {
    return [
      {
        heading: L(`How ${titleText} works`),
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
          `Talk to us about ${titleText} for your home or project — timelines, budget ranges, and next steps.`
        ),
        layout: "band",
        image: "",
      },
    ];
  }

  if (type === "built-in-furniture") {
    return [
      {
        heading: L(`How we deliver ${titleText}`),
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

  return [
    {
      heading: L(titleText),
      body: L(lead),
      image: imageA,
      layout: "image-left",
    },
  ];
}

function defaultFooterCta(title) {
  const titleText = titleEn(title) || "kitchen";
  return {
    footerCtaHeading: L(`Ready to plan your ${titleText.toLowerCase()}?`),
    footerCtaBody: L(
      "Speak with our design team for a free consultation and tailored quote."
    ),
  };
}

function defaultEyebrowForType(categoryType) {
  switch (String(categoryType || "")) {
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
    default:
      return L("Explore");
  }
}

function sectionsAreEmpty(sections) {
  return !Array.isArray(sections) || sections.length === 0;
}

module.exports = {
  IMG,
  buildDefaultCategorySections,
  defaultFooterCta,
  defaultEyebrowForType,
  sectionsAreEmpty,
  titleEn,
};
