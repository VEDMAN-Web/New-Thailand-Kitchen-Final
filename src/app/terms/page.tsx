import type { Metadata } from "next";
import LegalPageView from "../../component/legal/LegalPageView";
import { termsPageContent } from "../../component/legal/legalData";
import { pageSeo } from "../../lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo({
    title: "Terms & Conditions | Thailand Kitchens",
    description:
      "Terms of use for Thailand Kitchens consultations, quotations, and kitchen projects.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return <LegalPageView type="terms" fallback={termsPageContent} />;
}
