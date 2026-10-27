import { SITE_ORIGIN } from "../../lib/siteUrl";
import { CANONICAL_CONTACT_EMAIL } from "../../lib/pageMetadata";
import { BUSINESS_PHONE_E164 } from "../../lib/businessContact";

/**
 * SEO P0-4: Organization + WebSite + one HomeAndConstructionBusiness per office.
 *
 * TODO(waiting on client): add `geo` (GeoCoordinates) and `openingHoursSpecification`
 * for each office once verified. Do not publish unverified hours, coordinates,
 * ratings or offers.
 * TODO(waiting on client): confirm the public email (see CANONICAL_CONTACT_EMAIL)
 * and that both offices are staffed public locations.
 */
export default function BusinessGraphJsonLd() {
  const org = `${SITE_ORIGIN}/#org`;
  const image = `${SITE_ORIGIN}/products/Kitchen2.png`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: "Thailand Kitchens",
        url: SITE_ORIGIN,
        logo: `${SITE_ORIGIN}/icon.png`,
        email: CANONICAL_CONTACT_EMAIL,
        telephone: BUSINESS_PHONE_E164,
        sameAs: ["https://www.facebook.com/ThailandKitchens/"],
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
        // TODO(waiting on client): geo + openingHoursSpecification
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
        // TODO(waiting on client): geo + openingHoursSpecification
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
