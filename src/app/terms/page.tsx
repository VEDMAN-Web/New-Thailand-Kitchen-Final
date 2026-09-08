import type { Metadata } from "next";
import LegalPageView from "../../component/legal/LegalPageView";
import { termsPageContent } from "../../component/legal/legalData";
import { SITE_ORIGIN } from "../../lib/siteUrl";

const TERMS_TITLE = "Terms & Conditions | Thailand Kitchens";
const TERMS_DESCRIPTION = termsPageContent.subtitle;
const TERMS_URL = `${SITE_ORIGIN}/terms`;

export const metadata: Metadata = {
  title: TERMS_TITLE,
  description: TERMS_DESCRIPTION,
  alternates: {
    canonical: TERMS_URL,
  },
  openGraph: {
    type: "website",
    title: TERMS_TITLE,
    description: TERMS_DESCRIPTION,
    url: TERMS_URL,
  },
};

export default function TermsPage() {
  return <LegalPageView type="terms" fallback={termsPageContent} />;
}
