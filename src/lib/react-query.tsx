"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../i18n/LanguageProvider";
import type { Locale } from "../i18n/translations";
import { CmsProvider } from "./CmsHomeContext";
import SmoothScrollProvider from "../component/SmoothScrollProvider";

const queryClient = new QueryClient();

export default function Providers({
  children,
  initialLocale = "EN",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider initialLocale={initialLocale}>
        <CmsProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </CmsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
