import type { Metadata } from "next";
import ContactPage from "../../component/contact/ContactPage";
import { pageSeo } from "../../lib/pageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo({
    title: "Contact | Thailand Kitchens",
    description:
      "Request a kitchen consultation with Thailand Kitchens in Pattaya and Koh Samui.",
    path: "/contact",
  });
}

export default function Page() {
  return <ContactPage />;
}
