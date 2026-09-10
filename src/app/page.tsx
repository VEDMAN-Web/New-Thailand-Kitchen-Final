import type { Metadata } from "next";
import { ogImageUrl } from "../lib/siteUrl";
import HomePage from "../component/HomePage";
import { fetchHomeSections, fetchMergedProducts, cataloguesFromHomeSections } from "../services/cmsPublic";
import { pickCmsText } from "../lib/cmsText";
import { pageSeo, SITE_SEO_LOCALE } from "../lib/pageMetadata";

const HOMEPAGE_TITLE = "Thailand Kitchens | Custom Thai Kitchen Design";
const HOMEPAGE_DESCRIPTION =
  "Discover custom Thai kitchen design and cabinetry, crafted with timeless materials and made for beautiful everyday living.";
export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomeSections().catch(() => ({}));
  const sections = home as {
    seo?: Record<string, unknown>;
    hero?: Record<string, unknown>;
  };
  const seo = sections.seo || {};
  const hero = sections.hero || {};
  const title = pickCmsText(seo.title, HOMEPAGE_TITLE, SITE_SEO_LOCALE);
  const description = pickCmsText(
    seo.description,
    HOMEPAGE_DESCRIPTION,
    SITE_SEO_LOCALE
  );
  const image = ogImageUrl(
    typeof seo.ogImage === "string"
      ? seo.ogImage
      : typeof hero.image === "string"
        ? hero.image
        : ""
  );

  return pageSeo({
    title,
    description,
    path: "/",
    image,
  });
}


export default async function Home() {
  const [initialProducts, home] = await Promise.all([
    fetchMergedProducts().catch(() => []),
    fetchHomeSections().catch(() => ({})),
  ]);
  const initialCatalogues = cataloguesFromHomeSections(home);

  return (
    <main className="w-full">
      <HomePage
        initialProducts={initialProducts}
        initialCatalogues={initialCatalogues}
      />
    </main>
  );
}
