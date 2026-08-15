import type { Metadata } from "next";
import SeoHubLandingPage, {
  generateHubMetadata,
} from "../../components/seo/SeoHubLandingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return generateHubMetadata("services");
}

export default function ServicesHubPage() {
  return <SeoHubLandingPage hubKey="services" />;
}
