"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { en, type Translation } from "./en";
import { zh } from "./zh";
import { ja } from "./ja";

type Locale = "en" | "zh" | "ja";

const dictionaries: Record<Locale, Translation> = { en, zh, ja };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translation;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("locale");
  if (stored && (stored === "en" || stored === "zh" || stored === "ja")) {
    return stored as Locale;
  }
  const browserLang = navigator.language.slice(0, 2);
  if (browserLang === "zh" || browserLang === "ja") return browserLang;
  return "en";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useTranslation must be used within LocaleProvider");
  return ctx;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}

export type { Locale, Translation };
