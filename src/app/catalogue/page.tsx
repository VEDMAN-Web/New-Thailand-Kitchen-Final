import type { Metadata } from "next";
import { fetchMergedCatalogues } from "../../services/cmsPublic";
import CataloguePageClient from "./CataloguePageClient";
import { pageSeo } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo({
    title: "Kitchen Catalogues | Thailand Kitchens",
    description:
      "Download the Classic, Minimal, and Modern 2026 kitchen catalogues from Thailand Kitchens.",
    path: "/catalogue",
  });
}

export default async function CataloguePage() {
  const catalogues = await fetchMergedCatalogues().catch(() => []);
  return <CataloguePageClient initialCatalogues={catalogues} />;
}
