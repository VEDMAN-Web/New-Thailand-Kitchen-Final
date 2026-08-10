import FaqPage from "../../component/faq/FaqPage";
import { fetchMergedFaqs } from "../../services/cmsPublic";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const faqs = await fetchMergedFaqs().catch(() => []);
  return <FaqPage initialFaqs={faqs} />;
}
