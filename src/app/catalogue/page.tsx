import Footer from "../../component/Footer/footer";
import { fetchMergedCatalogues } from "../../services/cmsPublic";
import CataloguePageClient from "./CataloguePageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CataloguePage() {
  const catalogues = await fetchMergedCatalogues().catch(() => []);
  return <CataloguePageClient initialCatalogues={catalogues} />;
}
