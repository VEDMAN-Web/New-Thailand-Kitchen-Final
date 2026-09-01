import type { Metadata } from "next";
import { SITE_ORIGIN } from "../lib/siteUrl";
import HomePage from "../component/HomePage";
import { fetchMergedProducts } from "../services/cmsPublic";
// Homepage-only canonical tag. Deliberately not added to the shared root
// layout's generateMetadata() -- several other top-level pages (blog,
// catalogue, contact, faq, gallery, guides, privacy, products, terms) also
// have no page-level generateMetadata and would inherit a wrong canonical
// if it lived there. Next.js merges this with the layout's metadata, so
// title/description/OG/twitter tags are unaffected.
export const metadata: Metadata = {
  alternates: {
    canonical: SITE_ORIGIN,
  },
};


export default async function Home() {
  const initialProducts = await fetchMergedProducts().catch(() => []);

  return (
    <main className="w-full">
      <HomePage initialProducts={initialProducts} />
    </main>
  );
}
