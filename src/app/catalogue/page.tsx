import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
import { fetchMergedCatalogues } from "../../services/cmsPublic";
import CataloguePageClient from "./CataloguePageClient";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATALOGUE_TITLE = "Free Kitchen Catalogue | Thailand Kitchens";
const CATALOGUE_DESCRIPTION =
  "Download our latest kitchen catalogue instantly — no contact form required. Browse layouts, finishes, and materials from Thailand Kitchens.";
const CATALOGUE_URL = `${SITE_ORIGIN}/catalogue`;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await localizedStatic("/catalogue", CATALOGUE_TITLE, CATALOGUE_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/catalogue"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: CATALOGUE_URL,
  },
  };
}

export default async function CataloguePage() {
  const catalogues = await fetchMergedCatalogues().catch(() => []);
  return <CataloguePageClient initialCatalogues={catalogues} />;
}
