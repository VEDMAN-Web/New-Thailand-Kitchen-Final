import type { Metadata } from "next";
import LegalPageView from "../../component/legal/LegalPageView";
import { privacyPageContent } from "../../component/legal/legalData";
import { pageSeo } from "../../lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo({
    title: "Privacy Policy | Thailand Kitchens",
    description:
      "How Thailand Kitchens collects, uses, and protects personal information. Contact hello@thailandkitchens.com for privacy requests.",
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  return <LegalPageView type="privacy" fallback={privacyPageContent} />;
}
