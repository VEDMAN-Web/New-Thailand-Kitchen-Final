"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../i18n/LanguageProvider";
import type { Locale } from "../i18n/translations";
import { CmsProvider, type HomeSections } from "./CmsHomeContext";
import SmoothScrollProvider from "../component/SmoothScrollProvider";
import type { ProductItem } from "../component/products/productData";

const queryClient = new QueryClient();

export default function Providers({
  children,
  initialLocale = "EN",
  initialCmsData,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
  initialCmsData?: {
    sections?: HomeSections;
    products?: ProductItem[];
  };
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLocale={initialLocale}>
        <CmsProvider
          initialSections={initialCmsData?.sections}
          initialProducts={initialCmsData?.products}
        >
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </CmsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
