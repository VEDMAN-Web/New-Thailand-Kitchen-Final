import type { Metadata } from "next";
import SeoHubLandingPage, {
  generateHubMetadata,
} from "../../../components/seo/SeoHubLandingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return generateHubMetadata("kitchens", "byProperty");
}

export default function KitchenByPropertyHubPage() {
  return <SeoHubLandingPage hubKey="kitchens" kitchensSubKey="byProperty" />;
}
