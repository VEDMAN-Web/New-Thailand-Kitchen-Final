import type { Metadata } from "next";
import ContactPage from "../../component/contact/ContactPage";
import { SITE_ORIGIN } from "../../lib/siteUrl";
import { seoAlternates } from "../../lib/pageMetadata";

const CONTACT_TITLE = "Connect With Us | Thailand Kitchens";
const CONTACT_DESCRIPTION =
  "We believe in the soul of teak wood and the precision of ancient joining techniques. Every kitchen we craft is a bridge between Thai heritage and modern living.";
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
