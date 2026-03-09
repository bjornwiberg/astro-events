"use client";

import {
  createContext,
  Fragment,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import type { Translations } from "../../../lib/i18n";
import { isRtl } from "../../../lib/i18n";

type AppContextValue = {
  t: (key: string, vars?: Record<string, string>) => string;
  locale: string;
  dir: "ltr" | "rtl";
  timezone: string;
  isCurrentMonth: boolean;
};

const fallbackValue: AppContextValue = {
  t: (key: string, vars?: Record<string, string>) =>
    vars ? key.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? `{{${name}}}`) : key,
  locale: "en",
  dir: "ltr",
  timezone: "UTC",
  isCurrentMonth: true,
};

const AppContext = createContext<AppContextValue>(fallbackValue);

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

type AppProviderProps = {
  locale: string;
  translations: Translations;
  timezone: string;
  isCurrentMonth: boolean;
  children: ReactNode;
};

export function AppProvider({ locale, translations, timezone, isCurrentMonth, children }: AppProviderProps) {
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
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  const value = useMemo<AppContextValue>(() => ({ t, locale, dir, timezone, isCurrentMonth }), [t, locale, dir, timezone, isCurrentMonth]);

  return (
    <AppContext.Provider value={value}>
      <Fragment>{children}</Fragment>
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}
