import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Manrope } from "next/font/google";
import Providers from "../lib/react-query";
import Navbar from "../component/navBar";
import Footer from "../component/Footer/footer";
import { Toaster } from "sonner";
import { SITE_ORIGIN, ogImageUrl } from "../lib/siteUrl";
import { pickCmsText } from "../lib/cmsText";
import { fetchHomeSections, fetchMergedProducts, fetchMergedCategories } from "../services/cmsPublic";
import JsonLd from "../components/seo/JsonLd";
import { getServerLocale } from "../lib/serverLocale";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const localeBootScript = `
try {
  // Priority: cookie (server-side source of truth) → localStorage → default
  var m = document.cookie.match(/(?:^|; )tk-locale=([^;]+)/);
  var l = m ? decodeURIComponent(m[1]) : null;
  
  if (l !== 'EN' && l !== 'TH' && l !== 'PL') {
    l = localStorage.getItem('tk-locale');
  }
  
  if (l === 'EN' || l === 'TH' || l === 'PL') {
    document.documentElement.dataset.locale = l;
    document.documentElement.lang = l === 'TH' ? 'th' : l === 'PL' ? 'pl' : 'en';
    // Sync back to cookie and localStorage
    document.cookie = 'tk-locale=' + l + '; path=/; max-age=31536000; SameSite=Lax';
    localStorage.setItem('tk-locale', l);
  }
} catch (e) {}
`;

const FALLBACK_TITLE = "Thailand Kitchens";
const FALLBACK_DESCRIPTION =
  "Custom Thai kitchen design and cabinetry — timeless craftsmanship for every home.";

/**
 * Site-wide default metadata (title/description/OG image), sourced from the
 * admin panel's Header & SEO fields when set. This is the fallback every page
 * inherits unless it defines its own generateMetadata — so any page without
 * page-specific metadata still gets a real title/description/image instead of
 * a blank/generic social preview.
 */
export async function generateMetadata(): Promise<Metadata> {
  const home = await fetchHomeSections().catch(() => ({}) as Record<string, unknown>);
  const seo = (home as { seo?: Record<string, unknown> })?.seo || {};
  const hero = (home as { hero?: Record<string, unknown> })?.hero || {};

  const locale = await getServerLocale();
  const title = pickCmsText(seo.title, FALLBACK_TITLE, locale);
  const description = pickCmsText(seo.description, FALLBACK_DESCRIPTION, locale);
  const image = ogImageUrl(
    (seo.ogImage as string) || (hero.image as string) || ""
  );

  return {
    metadataBase: new URL(SITE_ORIGIN),
    // No `template` here — child pages already append " | Thailand Kitchens"
    // to their own titles, and Next.js applies a parent template even to a
    // child's plain-string title, which would double up the suffix.
    title,
    description,
    openGraph: {
      type: "website",
      siteName: FALLBACK_TITLE,
      title,
      description,
      url: SITE_ORIGIN,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || "";
  const serverLocale = await getServerLocale();

  // Fetch initial CMS data to prevent content flash on first paint
  const [sections, products, categories] = await Promise.all([
    fetchHomeSections().catch(() => ({})),
    fetchMergedProducts().catch(() => []),
    fetchMergedCategories().catch(() => []),
  ]);

    const footerSection = (sections as { footer?: Record<string, unknown> })?.footer || {};
  const seoSection = (sections as { seo?: Record<string, unknown> })?.seo || {};
  const localBusinessDescription = pickCmsText(seoSection.description, FALLBACK_DESCRIPTION, serverLocale);

  const initialCmsData = {
    sections,
    products,
    categories,
  };

  return (
    <html
      lang="en"
      data-locale="EN"
      className={manrope.variable}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <JsonLd
          type="Organization"
          data={{
            name: "Thailand Kitchens",
            url: SITE_ORIGIN,
            logo: `${SITE_ORIGIN}/icon.png`,
          }}
        />
        <JsonLd
          type="WebSite"
          data={{
            name: "Thailand Kitchens",
            url: SITE_ORIGIN,
          }}
        />
        <JsonLd
          type="LocalBusiness"
          data={{
            name: "Thailand Kitchens",
            description: localBusinessDescription,
            url: SITE_ORIGIN,
            image: `${SITE_ORIGIN}/icon.png`,
            telephone: (footerSection.phone as string) || undefined,
            areaServed: (footerSection.address as string) || undefined,
          }}
          />
        <Script
          id="tk-locale-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: localeBootScript }}
        />
        {ga4Id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="tk-ga4" strategy="afterInteractive">
              {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');
              `}
            </Script>
          </>
        ) : null}
        <Providers initialLocale={serverLocale} initialCmsData={initialCmsData}>
          <Navbar />
          {children}
          <Footer />
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
