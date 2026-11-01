import type { Locale } from "../i18n/translations";

/**
 * Typical prices are kept in the CMS as text, so editors can change them in the admin:
 * - a product's "Typical price" feature highlight ("฿360,000–480,000 for a typical …")
 * - a category's "Prices" section ("A U-shaped kitchen … typically costs ฿250,000–600,000 …").
 * The first baht range in the English text is the price shown on cards and in the price guide.
 */
export type PriceRange = { low: number; high: number };

const RANGE = /฿\s?(\d[\d,]*\d|\d)\s?[–-]\s?(\d[\d,]*\d|\d)/;

function englishText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return String((value as { en?: unknown }).en || "");
  }
  return "";
}

export function parsePriceRange(text: unknown): PriceRange | null {
  const match = englishText(text).match(RANGE);
  if (!match) return null;
  const low = Number(match[1].replace(/,/g, ""));
  const high = Number(match[2].replace(/,/g, ""));
  if (!low || !high || high < low) return null;
  return { low, high };
}

/** Price from a product's "Typical price" feature highlight. */
export function productPriceRange(
  features: { title?: unknown; description?: unknown }[] | undefined
): PriceRange | null {
  const feature = (features || []).find((f) =>
    /^typical price$/i.test(englishText(f.title).trim())
  );
  return feature ? parsePriceRange(feature.description) : null;
}

export function isPriceFeature(feature: { title?: unknown }): boolean {
  return /^typical price$/i.test(englishText(feature.title).trim());
}

/** Price from a category's "Prices" section. */
export function categoryPriceRange(
  sections: { label?: unknown; body?: unknown }[] | undefined
): PriceRange | null {
  const section = (sections || []).find((s) =>
    /^prices$/i.test(englishText(s.label).trim())
  );
  return section ? parsePriceRange(section.body) : null;
}

function groupDigits(n: number, locale: Locale): string {
  return String(Math.round(n)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    locale === "PL" ? " " : ","
  );
}

export function formatBahtRange(range: PriceRange, locale: Locale): string {
  const low = groupDigits(range.low, locale);
  const high = groupDigits(range.high, locale);
  if (locale === "PL") return `${low}–${high} THB`;
  if (locale === "TH") return `${low}–${high} บาท`;
  return `฿${low}–${high}`;
}

export function formatBahtFrom(range: PriceRange, locale: Locale): string {
  const low = groupDigits(range.low, locale);
  if (locale === "PL") return `od ${low} THB`;
  if (locale === "TH") return `เริ่มต้น ${low} บาท`;
  return `From ฿${low}`;
}

const LABELS: Record<
  Locale,
  {
    typicalPrice: string;
    priceIncludes: string;
    guideEyebrow: string;
    guideTitle: string;
    guideIntro: string;
    groups: Record<string, string>;
  }
> = {
  EN: {
    typicalPrice: "Typical price",
    priceIncludes:
      "Includes cabinets, worktop and installation. Appliances are extra; the exact price is confirmed after we measure.",
    guideEyebrow: "Price guide",
    guideTitle: "Typical kitchen prices in Thailand",
    guideIntro:
      "Typical project prices including cabinets, worktop and installation. Appliances, sink and tap are extra, and the exact price is confirmed after we measure the room.",
    groups: {
      layout: "By layout",
      style: "By style",
      "property-type": "By property",
      "built-in-furniture": "Built-in furniture",
      material: "Materials",
    },
  },
  PL: {
    typicalPrice: "Orientacyjna cena",
    priceIncludes:
      "Obejmuje szafki, blat i montaż. Sprzęt AGD osobno; dokładną cenę potwierdzamy po pomiarze.",
    guideEyebrow: "Cennik",
    guideTitle: "Orientacyjne ceny kuchni w Tajlandii",
    guideIntro:
      "Typowe ceny projektów z szafkami, blatem i montażem. Sprzęt AGD, zlew i bateria są liczone osobno, a dokładną cenę potwierdzamy po pomiarze pomieszczenia.",
    groups: {
      layout: "Według układu",
      style: "Według stylu",
      "property-type": "Według nieruchomości",
      "built-in-furniture": "Meble na wymiar",
      material: "Materiały",
    },
  },
  TH: {
    typicalPrice: "ราคาโดยประมาณ",
    priceIncludes:
      "รวมตู้ ท็อป และค่าติดตั้ง ไม่รวมเครื่องใช้ไฟฟ้า ราคาจริงยืนยันหลังวัดพื้นที่",
    guideEyebrow: "ราคา",
    guideTitle: "ราคาครัวโดยประมาณในประเทศไทย",
    guideIntro:
      "ราคาโครงการโดยทั่วไป รวมตู้ ท็อป และค่าติดตั้ง ไม่รวมเครื่องใช้ไฟฟ้า ซิงก์ และก๊อกน้ำ ราคาจริงจะยืนยันหลังจากวัดพื้นที่หน้างาน",
    groups: {
      layout: "ตามผังครัว",
      style: "ตามสไตล์",
      "property-type": "ตามประเภทที่อยู่อาศัย",
      "built-in-furniture": "เฟอร์นิเจอร์บิลท์อิน",
      material: "วัสดุ",
    },
  },
};

export function priceLabels(locale: Locale) {
  return LABELS[locale] || LABELS.EN;
}
