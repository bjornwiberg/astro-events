"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from "react";
import type { Translations } from "../../../lib/i18n";
import { isRtl } from "../../../lib/i18n";

type TranslationContextValue = {
  t: (key: string, vars?: Record<string, string>) => string;
  locale: string;
  dir: "ltr" | "rtl";
};

const fallbackTranslation: TranslationContextValue = {
  t: (key: string, vars?: Record<string, string>) =>
    vars ? key.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`) : key,
  locale: "en",
  dir: "ltr",
};

const TranslationContext = createContext<TranslationContextValue>(fallbackTranslation);

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`);
}

type TranslationProviderProps = {
  locale: string;
  translations: Translations;
  children: ReactNode;
};

export function TranslationProvider({ locale, translations, children }: TranslationProviderProps) {
  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const raw = getNested(translations as Record<string, unknown>, key);
      const text = raw ?? key;
      return vars ? interpolate(text, vars) : text;
    },
    [translations]
  );

  const dir = useMemo(() => (isRtl(locale) ? "rtl" : "ltr"), [locale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo<TranslationContextValue>(() => ({ t, locale, dir }), [t, locale, dir]);

  return (
    <TranslationContext.Provider value={value}>
      <div dir={dir} style={{ minHeight: "100%" }}>
        {children}
      </div>
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextValue {
  return useContext(TranslationContext);
}
