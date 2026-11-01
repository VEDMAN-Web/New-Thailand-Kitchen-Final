import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
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
  const seo = await localizedStatic("/faq", FAQ_TITLE, FAQ_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/faq"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
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
