import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Providers from "../lib/react-query";
import Navbar from "../component/navBar";
import { Toaster } from "sonner";
import { fetchHomeSections, fetchMergedProducts } from "../services/cmsPublic";
import { pickCmsText } from "../lib/cmsText";
import type { Locale } from "../i18n/translations";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

function parseLocale(value: unknown): Locale {
  return value === "TH" || value === "PL" || value === "EN" ? value : "EN";
}

const localeBootScript = `
try {
  var l = localStorage.getItem('tk-locale');
  if (l !== 'EN' && l !== 'TH' && l !== 'PL') {
    var m = document.cookie.match(/(?:^|; )tk-locale=([^;]+)/);
    l = m ? decodeURIComponent(m[1]) : null;
  }
  if (l === 'EN' || l === 'TH' || l === 'PL') {
    document.documentElement.dataset.locale = l;
    document.documentElement.lang = l === 'TH' ? 'th' : l === 'PL' ? 'pl' : 'en';
  }
} catch (e) {}
`;

export async function generateMetadata(): Promise<Metadata> {
  const sections = await fetchHomeSections();
  const seo = (sections?.seo || {}) as {
    title?: unknown;
    description?: unknown;
    ogImage?: string;
  };
  const jar = await cookies();
  const locale = parseLocale(jar.get("tk-locale")?.value);
  const title = pickCmsText(seo.title, "Thailand Kitchens", locale);
  const description = pickCmsText(
    seo.description,
    "Thailand Kitchens Website",
    locale
  );
  const ogImage =
    typeof seo.ogImage === "string" ? seo.ogImage.trim() : "";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const initialLocale = parseLocale(jar.get("tk-locale")?.value);
  const htmlLang =
    initialLocale === "TH" ? "th" : initialLocale === "PL" ? "pl" : "en";

  // Server-side fetch CMS data to eliminate flicker on initial load
  const [homeSections, products] = await Promise.all([
    fetchHomeSections().catch(() => ({})),
    fetchMergedProducts().catch(() => []),
  ]);

  return (
    <html
      lang={htmlLang}
      data-locale={initialLocale}
      className={`${manrope.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script id="tk-locale-boot" strategy="beforeInteractive">
          {localeBootScript}
        </Script>
        <Providers
          initialLocale={initialLocale}
          initialCmsData={{ sections: homeSections, products }}
        >
          <Navbar />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
