import FaqPage from "../../component/faq/FaqPage";
import { fetchMergedFaqs } from "../../services/cmsPublic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import JsonLd from "../../components/seo/JsonLd";
export default async function Page() {
  const faqs = await fetchMergedFaqs().catch(() => []);
  const faqJsonLdItems = faqs.filter((f) => f.question && f.answer).map((f) => ({ question: String(f.question), answer: String(f.answer) }));
  return [
    faqJsonLdItems.length > 0 ? (
      <JsonLd key="faq-jsonld" type="FAQPage" data={{ items: faqJsonLdItems }} /> ) : null,
    <FaqPage key="faq-page" initialFaqs={faqs} />,
    ];
}
