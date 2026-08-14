"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { translations, type Locale, type TranslationKey } from "./translations";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Always true after cookie/boot sync — kept for API compatibility. */
  ready: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const STORAGE_KEY = "tk-locale";

function isLocale(value: unknown): value is Locale {
  return value === "EN" || value === "TH" || value === "PL";
}

function readDomLocale(): Locale | null {
  if (typeof document === "undefined") return null;
  const raw = document.documentElement.dataset.locale;
  return isLocale(raw) ? raw : null;
}

function readStoredLocale(): Locale | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isLocale(saved) ? saved : null;
  } catch {
    return null;
  }
}

function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang =
    locale === "TH" ? "th" : locale === "PL" ? "pl" : "en";
  document.documentElement.dataset.locale = locale;
}

function softSwap(el: HTMLElement | null, commit: () => void) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!el || reduce) {
    commit();
    return;
  }

  el.style.transition = "opacity 150ms ease";
  el.style.opacity = "0.45";
  window.setTimeout(() => {
    commit();
    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });
  }, 120);
}

export function LanguageProvider({
  children,
  initialLocale = "EN",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  // Cookie (SSR) → boot script dataset → EN. Avoids EN→TH hydration flash.
  const [locale, setLocaleState] = useState<Locale>(
    () => readDomLocale() || (isLocale(initialLocale) ? initialLocale : "EN")
  );
  const [, startTransition] = useTransition();
  const fadeRef = useRef<HTMLDivElement>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    const saved = readDomLocale() || readStoredLocale() || initialLocale || "EN";
    if (saved !== localeRef.current) {
      setLocaleState(saved);
    }
    applyDocumentLocale(saved);
  }, [initialLocale]);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (next === localeRef.current) return;

    softSwap(fadeRef.current, () => {
      startTransition(() => {
        setLocaleState(next);
      });
      persistLocale(next);
      applyDocumentLocale(next);
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text: string =
        translations[locale][key] ?? translations.EN[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return text;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, ready: true }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      <div ref={fadeRef} className="min-h-screen tk-content-fade" suppressHydrationWarning>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return ctx;
}
