import Link from "next/link";
import type { Locale } from "../../i18n/translations";
import type { CmsCategory } from "../../services/cmsPublic";
import { pickCmsText } from "../../lib/cmsText";
import { categoryPublicPath } from "../../lib/categoryRoutes";
import {
  categoryPriceRange,
  formatBahtRange,
  priceLabels,
} from "../../lib/priceRange";

type Props = {
  categories: CmsCategory[];
  /** Category types to show, in this order (e.g. ["layout", "style", "property-type"]). */
  types: string[];
  locale: Locale;
  /** Hide the big heading when the page already has one about prices. */
  compact?: boolean;
};

/** Cards of typical prices, read from each category's "Prices" section in the CMS. */
export default function PriceGuide({ categories, types, locale, compact }: Props) {
  const labels = priceLabels(locale);
  const groups = types
    .map((type) => ({
      type,
      items: categories
        .filter((c) => c.categoryType === type && !c.parentId)
        .map((c) => ({
          category: c,
          price: categoryPriceRange(c.sections as { label?: unknown; body?: unknown }[]),
        }))
        .filter((x): x is { category: CmsCategory; price: NonNullable<typeof x.price> } =>
          Boolean(x.price)
        )
        .sort((a, b) => a.price.low - b.price.low),
    }))
    .filter((g) => g.items.length);

  if (!groups.length) return null;

  return (
    <section className="text-left">
      <p className={`text-[10px] sm:text-xs font-semibold text-[#B38B6D] mb-2 ${locale === "TH" ? "" : "tracking-[0.2em] uppercase"}`}>
        {labels.guideEyebrow}
      </p>
      {compact ? null : (
        <h2 className="font-sans font-extrabold text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl text-[#1A2332] mb-3 sm:mb-4 leading-tight break-words">
          {labels.guideTitle}
        </h2>
      )}
      <p className="text-sm sm:text-base text-[#5C6370] leading-7 max-w-3xl mb-6 sm:mb-8">
        {labels.guideIntro}
      </p>
      <div className="space-y-6 sm:space-y-8">
        {groups.map((group) => (
          <div key={group.type}>
            {groups.length > 1 ? (
              <h3 className="text-base sm:text-lg font-semibold text-[#1A2332] mb-3">
                {labels.groups[group.type] || group.type}
              </h3>
            ) : null}
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {group.items.map(({ category, price }) => (
                <li key={category.id}>
                  <Link
                    href={categoryPublicPath(category)}
                    className="flex h-full items-center justify-between gap-3 rounded-2xl bg-white border border-[#E8E4DC] px-4 py-4 sm:px-5 sm:py-5 transition hover:border-[#B38B6D] hover:shadow-[0_8px_24px_rgba(26,35,50,0.08)]"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm sm:text-base font-semibold text-[#1A2332] break-words">
                        {pickCmsText(category.title, "", locale)}
                      </span>
                      <span className="mt-1 block text-sm sm:text-base font-bold text-[#B38B6D] whitespace-nowrap">
                        {formatBahtRange(price, locale)}
                      </span>
                    </span>
                    <span aria-hidden className="shrink-0 text-[#B38B6D]">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
