import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
import LegalPageView from "../../component/legal/LegalPageView";
import { privacyPageContent } from "../../component/legal/legalData";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

const PRIVACY_TITLE = "Privacy Policy | Thailand Kitchens";
const PRIVACY_DESCRIPTION = privacyPageContent.subtitle;
const PRIVACY_URL = `${SITE_ORIGIN}/privacy`;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await localizedStatic("/privacy", PRIVACY_TITLE, PRIVACY_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/privacy"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: PRIVACY_URL,
  },
  };
}

export default function PrivacyPage() {
  return <LegalPageView type="privacy" fallback={privacyPageContent} />;
}
