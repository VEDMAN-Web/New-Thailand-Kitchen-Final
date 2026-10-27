import type { Metadata } from "next";
import { ogImageUrl } from "../lib/siteUrl";
import HomePage from "../component/HomePage";
import { fetchHomeSections, fetchMergedProducts, cataloguesFromHomeSections } from "../services/cmsPublic";
import { pickCmsText } from "../lib/cmsText";
import {
  pageSeo,
  SITE_SEO_LOCALE,
  HOMEPAGE_SEO_TITLE,
  HOMEPAGE_SEO_DESCRIPTION,
  withoutSeoPlaceholder,
} from "../lib/pageMetadata";

const HOMEPAGE_TITLE = HOMEPAGE_SEO_TITLE;
const HOMEPAGE_DESCRIPTION = HOMEPAGE_SEO_DESCRIPTION;
export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomeSections().catch(() => ({}));
  const sections = home as {
    seo?: Record<string, unknown>;
    hero?: Record<string, unknown>;
  };
  const seo = sections.seo || {};
  const hero = sections.hero || {};
  const title = withoutSeoPlaceholder(
    pickCmsText(seo.title, HOMEPAGE_TITLE, SITE_SEO_LOCALE),
    HOMEPAGE_TITLE
  );
  const description = withoutSeoPlaceholder(
    pickCmsText(seo.description, HOMEPAGE_DESCRIPTION, SITE_SEO_LOCALE),
    HOMEPAGE_DESCRIPTION
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
