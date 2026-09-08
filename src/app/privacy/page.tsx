import type { Metadata } from "next";
import LegalPageView from "../../component/legal/LegalPageView";
import { privacyPageContent } from "../../component/legal/legalData";
import { SITE_ORIGIN } from "../../lib/siteUrl";

const PRIVACY_TITLE = "Privacy Policy | Thailand Kitchens";
const PRIVACY_DESCRIPTION = privacyPageContent.subtitle;
const PRIVACY_URL = `${SITE_ORIGIN}/privacy`;

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: PRIVACY_URL,
  },
  openGraph: {
    type: "website",
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    url: PRIVACY_URL,
  },
};

export default function PrivacyPage() {
  return <LegalPageView type="privacy" fallback={privacyPageContent} />;
}
