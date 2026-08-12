import SeoHubLandingPage from "../../components/seo/SeoHubLandingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LocationsHubPage() {
  return <SeoHubLandingPage hubKey="locations" />;
}
