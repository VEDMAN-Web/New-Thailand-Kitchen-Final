/**
 * Full Thailand Kitchen SEO taxonomy — slug + categoryType + optional parentSlug.
 * Upserted by repairThailandTaxonomy() on server boot / sync script.
 */
const { L } = require("../utils/localized");

function cat(
  slug,
  categoryType,
  titleEn,
  titleTh,
  titlePl,
  descEn,
  opts = {}
) {
  return {
    slug,
    categoryType,
    title: L(titleEn, titleTh || titleEn, titlePl || titleEn),
    description: L(
      descEn,
      opts.descTh || descEn,
      opts.descPl || descEn
    ),
    image: opts.image || "/products/Kitchen2.png",
    metaTitle: String(opts.metaTitle || `${titleEn} | Thailand Kitchens`).slice(
      0,
      60
    ),
    metaDescription: String(
      opts.metaDescription || descEn
    ).slice(0, 160),
    indexable: opts.indexable !== false,
    parentSlug: opts.parentSlug || null,
  };
}

const THAILAND_TAXONOMY = [
  // —— Kitchen layouts ——
  cat("u-shape", "layout", "U Shape", "รูปตัว U", "Kształt U", "U-shaped kitchen layouts for efficient work triangles."),
  cat("l-shape", "layout", "L Shape", "รูปตัว L", "Kształt L", "L-shaped kitchen layouts for corner spaces."),
  cat("t-shape", "layout", "T Shape", "รูปตัว T", "Kształt T", "T-shaped kitchen layouts with peninsula seating."),
  cat("straight", "layout", "Straight", "ตรง", "Prosty", "Straight-run galley kitchens for compact homes."),
  cat("islands", "layout", "Islands", "ไอส์แลนด์", "Wyspy", "Island kitchen layouts for open-plan living.", {
    image: "/products/Kitchen1.png",
  }),

  // —— Kitchen styles ——
  cat("modern", "style", "Modern", "โมเดิร์น", "Nowoczesny", "Contemporary modular kitchens with clean lines.", {
    image: "/products/Kitchen5.png",
  }),
  cat("contemporary", "style", "Contemporary", "ร่วมสมัย", "Współczesny", "Warm contemporary kitchens blending wood and stone."),
  cat("minimalist", "style", "Minimalist", "มินิมอล", "Minimalistyczny", "Handleless minimalist kitchens with hidden storage."),
  cat("traditional-thai", "style", "Traditional Thai", "ไทยดั้งเดิม", "Tradycyjny tajski", "Teak-forward kitchens inspired by Thai craft."),

  // —— Property types ——
  cat("condo", "property-type", "Condo", "คอนโด", "Apartamentowiec", "Kitchen solutions for condominiums and high-rises."),
  cat("villa", "property-type", "Villa", "วิลล่า", "Willa", "Custom kitchens for villas and detached homes."),
  cat("townhouse", "property-type", "Townhouse", "ทาวน์เฮาส์", "Szeregowiec", "Space-efficient kitchens for townhouses."),
  cat("apartment", "property-type", "Apartment", "อพาร์ตเมนต์", "Apartament", "Compact kitchen designs for apartments."),

  // —— Locations ——
  cat("bangkok", "location", "Bangkok", "กรุงเทพฯ", "Bangkok", "Custom kitchens and built-ins across Bangkok."),
  cat("phuket", "location", "Phuket", "ภูเก็ต", "Phuket", "Kitchen design and installation in Phuket."),
  cat("chiang-mai", "location", "Chiang Mai", "เชียงใหม่", "Chiang Mai", "Bespoke kitchens in Chiang Mai."),
  cat("pattaya", "location", "Pattaya", "พัทยา", "Pattaya", "Kitchen projects in Pattaya and Chonburi."),
  cat("koh-samui", "location", "Koh Samui", "เกาะสมุย", "Koh Samui", "Island kitchens crafted in our Samui atelier."),

  // —— Standalone services ——
  cat(
    "kitchen-design",
    "service",
    "Kitchen Design",
    "ออกแบบครัว",
    "Projekt kuchni",
    "End-to-end kitchen design consultations and 3D planning."
  ),
  cat(
    "kitchen-installation",
    "service",
    "Kitchen Installation",
    "ติดตั้งครัว",
    "Montaż kuchni",
    "Professional kitchen cabinet installation and finishing."
  ),
  cat(
    "kitchen-renovation",
    "service",
    "Kitchen Renovation",
    "ปรับปรุงครัว",
    "Renowacja kuchni",
    "Full kitchen renovation — design, supply and install."
  ),
  cat(
    "built-in-wardrobes",
    "service",
    "Built-In Wardrobes",
    "ตู้เสื้อผ้าบิวท์อิน",
    "Szafy na wymiar",
    "Custom wardrobes and closet systems."
  ),

  // —— Location × service (nested URLs) ——
  cat(
    "kitchen-renovation",
    "service",
    "Kitchen Renovation Bangkok",
    "ปรับปรุงครัว กรุงเทพ",
    "Renowacja kuchni Bangkok",
    "Kitchen renovation services for Bangkok homes.",
    { parentSlug: "bangkok", metaTitle: "Kitchen Renovation Bangkok | Thailand Kitchens" }
  ),
  cat(
    "kitchen-design",
    "service",
    "Kitchen Design Bangkok",
    "ออกแบบครัว กรุงเทพ",
    "Projekt kuchni Bangkok",
    "Kitchen design studio serving Bangkok.",
    { parentSlug: "bangkok" }
  ),
  cat(
    "kitchen-renovation",
    "service",
    "Kitchen Renovation Phuket",
    "ปรับปรุงครัว ภูเก็ต",
    "Renowacja kuchni Phuket",
    "Kitchen renovation on Phuket island.",
    { parentSlug: "phuket" }
  ),
  cat(
    "kitchen-design",
    "service",
    "Kitchen Design Koh Samui",
    "ออกแบบครัว เกาะสมุย",
    "Projekt kuchni Koh Samui",
    "Samui atelier kitchen design services.",
    { parentSlug: "koh-samui" }
  ),

  // —— Materials ——
  cat("teak-wood", "material", "Teak Wood", "ไม้สัก", "Drewno tekowe", "Premium teak cabinetry and solid wood fronts."),
  cat("marble-quartz", "material", "Marble & Quartz", "หินอ่อนและควอตซ์", "Marmur i kwarc", "Stone worktops and quartz surfaces."),
  cat("matte-lacquer", "material", "Matte Lacquer", "แล็กเกอร์ด้าน", "Lakier matowy", "Fingerprint-resistant matte lacquer finishes."),
  cat("brass-hardware", "material", "Brass Hardware", "ฮาร์ดแวร์ทองเหลือง", "Mosiężne okucia", "Artisanal brass pulls and hinges."),

  // —— Built-in furniture ——
  cat("wardrobes", "built-in-furniture", "Wardrobes", "ตู้เสื้อผ้า", "Szafy", "Floor-to-ceiling built-in wardrobes."),
  cat("vanities", "built-in-furniture", "Vanities", "เคาน์เตอร์ห้องน้ำ", "Szafki łazienkowe", "Bathroom vanities and storage."),
  cat(
    "entertainment-units",
    "built-in-furniture",
    "Entertainment Units",
    "ชุดทีวีบิวท์อิน",
    "Zabudowy RTV",
    "Media walls and entertainment cabinetry."
  ),
];

module.exports = { THAILAND_TAXONOMY };
