"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../i18n/LanguageProvider";
import { CmsProvider } from "./CmsHomeContext";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CmsProvider>{children}</CmsProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
