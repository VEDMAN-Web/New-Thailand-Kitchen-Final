import { SITE_ORIGIN } from "../../lib/siteUrl";
import {
  CANONICAL_CONTACT_EMAIL,
  HOMEPAGE_SEO_DESCRIPTION,
} from "../../lib/pageMetadata";
import {
  BUSINESS_FACEBOOK_URL,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_PHONE_E164,
  BUSINESS_WHATSAPP_URL,
} from "../../lib/businessContact";

/**
 * SEO P0-4: Organization + WebSite + one HomeAndConstructionBusiness per office.
 *
 * Offices (confirmed): Pattaya and Koh Samui.
 * Hours: Monday-Saturday 09:00-18:00.
 * No geo coordinates (none verified). Do not publish ratings or offers.
 */
export default function BusinessGraphJsonLd() {
  const org = `${SITE_ORIGIN}/#org`;
  // Neutral branded logo from /public (no stock or product photos).
  const image = `${SITE_ORIGIN}/logo1.png`;
  const openingHoursSpecification = [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ];
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: "Thailand Kitchens",
        url: SITE_ORIGIN,
        logo: `${SITE_ORIGIN}/icon.png`,
        description: HOMEPAGE_SEO_DESCRIPTION,
        email: CANONICAL_CONTACT_EMAIL,
        telephone: BUSINESS_PHONE_E164,
        // Verified Facebook, Instagram and WhatsApp profiles.
        sameAs: [BUSINESS_FACEBOOK_URL, BUSINESS_INSTAGRAM_URL, BUSINESS_WHATSAPP_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: "Thailand Kitchens",
        url: SITE_ORIGIN,
        publisher: { "@id": org },
        inLanguage: "en",
      },
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${SITE_ORIGIN}/#pattaya`,
        name: "Thailand Kitchens – Pattaya",
        parentOrganization: { "@id": org },
        url: `${SITE_ORIGIN}/locations/pattaya`,
        image,
        telephone: BUSINESS_PHONE_E164,
        email: CANONICAL_CONTACT_EMAIL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "82, 48-49 Chaiyaphruek 2 Rd",
          addressLocality: "Pattaya City, Bang Lamung District",
          addressRegion: "Chon Buri",
          postalCode: "20150",
          addressCountry: "TH",
        },
        areaServed: ["Pattaya", "Chonburi", "Bangkok"],
        openingHoursSpecification,
      },
      {
        "@type": "HomeAndConstructionBusiness",
        "@id": `${SITE_ORIGIN}/#samui`,
        name: "Thailand Kitchens – Koh Samui",
        parentOrganization: { "@id": org },
        url: `${SITE_ORIGIN}/locations/koh-samui`,
        image,
        telephone: BUSINESS_PHONE_E164,
        email: CANONICAL_CONTACT_EMAIL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Route 4169",
          addressLocality: "Mae Nam, Ko Samui",
          addressRegion: "Surat Thani",
          postalCode: "84330",
          addressCountry: "TH",
        },
        areaServed: ["Koh Samui", "Surat Thani"],
        openingHoursSpecification,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
