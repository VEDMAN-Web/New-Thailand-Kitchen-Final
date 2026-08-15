import type { Metadata } from "next";
import SeoHubLandingPage, {
  generateHubMetadata,
} from "../../components/seo/SeoHubLandingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return generateHubMetadata("materials");
}

export default function MaterialsHubPage() {
  return <SeoHubLandingPage hubKey="materials" />;
}
