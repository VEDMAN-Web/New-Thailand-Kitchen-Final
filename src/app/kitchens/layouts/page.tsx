import SeoHubLandingPage from "../../../components/seo/SeoHubLandingPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function KitchenLayoutsHubPage() {
  return <SeoHubLandingPage hubKey="kitchens" kitchensSubKey="layouts" />;
}
