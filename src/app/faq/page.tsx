import type { Metadata } from "next";
import FaqPage from "../../component/faq/FaqPage";
import { fetchMergedFaqs } from "../../services/cmsPublic";
import JsonLd from "../../components/seo/JsonLd";
import { ensureCmsString } from "../../lib/cmsText";
import { pageSeo } from "../../lib/pageMetadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo({
    title: "FAQ | Thailand Kitchens",
    description:
      "Answers about custom Thai kitchen design, timelines, materials, and consultations.",
    path: "/faq",
  });
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
