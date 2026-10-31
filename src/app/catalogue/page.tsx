import type { Metadata } from "next";
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
  return {
  title: CATALOGUE_TITLE,
  description: CATALOGUE_DESCRIPTION,
  alternates: await seoAlternates("/catalogue"),
  openGraph: {
    type: "website",
    title: CATALOGUE_TITLE,
    description: CATALOGUE_DESCRIPTION,
    url: CATALOGUE_URL,
  },
  };
}

export default async function CataloguePage() {
  const catalogues = await fetchMergedCatalogues().catch(() => []);
  return <CataloguePageClient initialCatalogues={catalogues} />;
}
