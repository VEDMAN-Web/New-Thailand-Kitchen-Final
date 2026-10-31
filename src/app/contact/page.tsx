import type { Metadata } from "next";
import ContactPage from "../../component/contact/ContactPage";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

const CONTACT_TITLE = "Contact Thailand Kitchens: Get in Touch Today";
const CONTACT_DESCRIPTION =
  "Contact Thailand Kitchens to learn more about our kitchen products and layouts. We're here to help you explore the right kitchen options.";
const CONTACT_URL = `${SITE_ORIGIN}/contact`;

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  alternates: await seoAlternates("/contact"),
  openGraph: {
    type: "website",
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: CONTACT_URL,
  },
  };
}

export default function Page() {
  return <ContactPage />;
}
