import type { Metadata } from "next";
import FaqPage from "../../component/faq/FaqPage";
import { fetchMergedFaqs } from "../../services/cmsPublic";
import { SITE_ORIGIN } from "../../lib/siteUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import JsonLd from "../../components/seo/JsonLd";
import { ensureCmsString } from "../../lib/cmsText";
import { seoAlternates } from "../../lib/pageMetadata";

const FAQ_TITLE = "Kitchen FAQ Thailand: Common Questions Answered";
const FAQ_DESCRIPTION =
  "Find answers to frequently asked questions about Thailand Kitchens, kitchen layouts, products, and choosing the right kitchen for your home.";
const FAQ_URL = `${SITE_ORIGIN}/faq`;

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: FAQ_TITLE,
  description: FAQ_DESCRIPTION,
  alternates: await seoAlternates("/faq"),
  openGraph: {
    type: "website",
    title: FAQ_TITLE,
    description: FAQ_DESCRIPTION,
    url: FAQ_URL,
  },
  };
}
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
