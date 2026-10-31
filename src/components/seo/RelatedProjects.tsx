import Link from "next/link";
import Image from "next/image";
import { pickCmsText } from "../../lib/cmsText";
import type { Locale } from "../../i18n/translations";
import { tx } from "../../i18n/translations";

export type RelatedProjectItem = {
  id: string;
  image: string;
  title: string;
  description?: string;
  href?: string;
};

export default function RelatedProjects({
  items,
  heading,
  locale = "EN",
}: {
  items: RelatedProjectItem[];
  heading?: string;
  locale?: Locale;
}) {
  if (!items.length) return null;
  const title = heading ?? tx(locale, "hub.relatedProjects");

  return (
    <section className="w-full bg-[#F5F3EF] border-t border-[#E8E4DC]">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-12 lg:py-16">
        <h2 className="font-sans font-extrabold text-2xl min-[425px]:text-3xl md:text-4xl lg:text-5xl text-[#1A2332] mb-5 sm:mb-8 break-words">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item) => {
            const inner = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E8E4DC]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  ) : null}
                </div>
                <div className="pt-3">
                  <p className="text-sm font-semibold text-[#1A2332]">{item.title}</p>
                  {item.description ? (
                    <p className="text-sm text-[#5C6370] mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </>
            );
            return item.href ? (
              <Link key={item.id} href={item.href} className="block group">
                {inner}
              </Link>
            ) : (
              <div key={item.id}>{inner}</div>
            );
          })}
        </div>
        <p className="mt-5 sm:mt-8">
          <Link
            href="/gallery"
            className="text-sm font-semibold text-[#1A2332] underline underline-offset-4"
          >
            View gallery
          </Link>
        </p>
      </div>
    </section>
  );
}

export function projectTitleFromCms(
  item: {
    projectTitle?: string;
    title?: unknown;
  },
  locale: Locale = "EN"
): string {
  if (item.projectTitle?.trim()) return item.projectTitle.trim();
  return pickCmsText(item.title, "Project", locale);
}
