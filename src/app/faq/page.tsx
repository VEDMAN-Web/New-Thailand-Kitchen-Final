import type { Metadata } from "next";
import FaqPage from "../../component/faq/FaqPage";
import { fetchMergedFaqs } from "../../services/cmsPublic";
import { SITE_ORIGIN } from "../../lib/siteUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import JsonLd from "../../components/seo/JsonLd";
import { ensureCmsString } from "../../lib/cmsText";

const FAQ_TITLE = "Most Frequent Questions | Thailand Kitchens";
const FAQ_DESCRIPTION =
  "Find answers to the most common questions about custom modular kitchen design, installation timelines, pricing, materials, and after-sales support.";
const FAQ_URL = `${SITE_ORIGIN}/faq`;

export const metadata: Metadata = {
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  alternates: {
    canonical: FAQ_URL,
  },
  openGraph: {
    type: "website",
    title: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    url: FAQ_URL,
  },
};
export default async function Page() {
  const faqs = await fetchMergedFaqs().catch(() => []);
  const faqJsonLdItems = faqs
    .map((f) => ({
      question: ensureCmsString(f.question),
      answer: ensureCmsString(f.answer),
    }))
    .filter((f) => f.question && f.answer);
  return [
    faqJsonLdItems.length > 0 ? (
      <JsonLd key="faq-jsonld" type="FAQPage" data={{ items: faqJsonLdItems }} />
    ) : null,
    <FaqPage key="faq-page" initialFaqs={faqs} />,
  ];
}
