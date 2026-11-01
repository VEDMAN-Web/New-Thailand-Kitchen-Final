import type { Metadata } from "next";
import { localizedStatic } from "../../lib/seoLocale";
import ContactPage from "../../component/contact/ContactPage";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

const CONTACT_TITLE = "Contact Thailand Kitchens: Get in Touch Today";
const CONTACT_DESCRIPTION =
  "Contact Thailand Kitchens to learn more about our kitchen products and layouts. We're here to help you explore the right kitchen options.";
const CONTACT_URL = `${SITE_ORIGIN}/contact`;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await localizedStatic("/contact", CONTACT_TITLE, CONTACT_DESCRIPTION);
  return {
  title: seo.title,
  description: seo.description,
  alternates: await seoAlternates("/contact"),
  openGraph: {
    type: "website",
    title: seo.title,
    description: seo.description,
    url: CONTACT_URL,
  },
  };
}

export default function Page() {
  return <ContactPage />;
}
