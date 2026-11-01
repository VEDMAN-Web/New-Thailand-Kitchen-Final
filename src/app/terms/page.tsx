import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
import LegalPageView from "../../component/legal/LegalPageView";
import { termsPageContent } from "../../component/legal/legalData";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

const TERMS_TITLE = "Terms & Conditions | Thailand Kitchens";
const TERMS_DESCRIPTION = termsPageContent.subtitle;
const TERMS_URL = `${SITE_ORIGIN}/terms`;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await localizedStatic("/terms", TERMS_TITLE, TERMS_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/terms"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: TERMS_URL,
  },
  };
}

export default function TermsPage() {
  return <LegalPageView type="terms" fallback={termsPageContent} />;
}
