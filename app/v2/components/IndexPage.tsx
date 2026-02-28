"use client";

import {
  Backdrop,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GeoLocation } from "../../../lib/calculator";
import {
  type Translations,
  I18N_HASH_COOKIE_NAME,
  translationCacheKey,
} from "../../../lib/i18n";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { initMixpanel } from "../../../utils/mixpanel";
import { V2_BASE_PATH } from "../constants";
import { darkTheme, lightTheme } from "../theme";
import { useV2Theme } from "./V2ThemeRoot";
import { AngleToggle } from "./AngleToggle";
import { Errors } from "./Errors";
import { Events } from "./Events";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LocationSelector } from "./LocationSelector";
import { Navigation } from "./Navigation";
import { TranslationProvider } from "./TranslationProvider";

type IndexPageProps = {
  events: CalculatorEventType[];
  location: GeoLocation;
  year: number;
  month: number;
  lang: string;
  translations: Translations;
  sourceHash: string;
  /** Hash the client sent in cookie; when it matches sourceHash, client cache is valid. */
  clientI18nHash?: string | null;
  baseUrl: string;
  fetchError?: boolean;
};

function getStoredTranslations(lang: string): Translations | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(translationCacheKey(lang));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Translations;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function setStoredTranslations(lang: string, data: Translations): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(translationCacheKey(lang), JSON.stringify(data));
  } catch {
    // ignore quota or other errors
  }
}

function setI18nHashCookie(sourceHash: string): void {
  if (typeof document === "undefined") return;
  // biome-ignore lint/suspicious/noDocumentCookie: cookie is set in the browser for server to read on next load
  document.cookie = `${I18N_HASH_COOKIE_NAME}=${encodeURIComponent(sourceHash)};path=/;max-age=31536000;SameSite=Lax`;
}

/** Clear all translation cache when source (en.json) hash changed (cookie !== current). */
function clearTranslationCacheIfStale(
  clientI18nHash: string | null | undefined,
  currentSourceHash: string,
): void {
  if (typeof window === "undefined") return;
  if (clientI18nHash == null || clientI18nHash === currentSourceHash) return;
  const prefix = "v2:i18n:";
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(prefix)) keysToRemove.push(key);
    }
    for (const key of keysToRemove) window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export default function IndexPage({
  events,
  location,
  year,
  month,
  lang,
  translations,
  sourceHash,
  clientI18nHash,
  baseUrl,
  fetchError: initialFetchError = false,
}: IndexPageProps) {
  const { darkMode, setDarkMode } = useV2Theme();

  const theme = darkMode ? darkTheme : lightTheme;

  const [locale, setLocale] = useState(lang);
  const [currentTranslations, setCurrentTranslations] = useState(translations);
  const [monthFilter, setMonthFilter] = useState(month);
  const [yearFilter, setYearFilter] = useState(year);
  const [useAngleMode, setUseAngleMode] = useState(false);
  const [error] = useState(initialFetchError);
  const [loadingTranslations, setLoadingTranslations] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const router = useRouter();
  const loadingTextRef = useRef("Changing language…");
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDarkModeToggle = useCallback(() => {
    setDarkMode(!darkMode);
  }, [darkMode, setDarkMode]);

  // Sync from server when lang/translations change (e.g. navigation)
  useEffect(() => {
    setLocale(lang);
    setCurrentTranslations(translations);
  }, [lang, translations]);

  // When source hash changed (e.g. en.json updated), clear cache; persist non-en only + cookie
  useEffect(() => {
    clearTranslationCacheIfStale(clientI18nHash, sourceHash);
    if (lang !== "en") setStoredTranslations(lang, translations);
    setI18nHashCookie(sourceHash);
  }, [lang, sourceHash, translations, clientI18nHash]);

  useEffect(() => {
    if (loadingTranslations) {
      overlayTimerRef.current = setTimeout(() => setShowOverlay(true), 300);
    } else {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
      setShowOverlay(false);
    }
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [loadingTranslations]);

  const handleLocaleChange = useCallback(
    async (newLocale: string) => {
      const currentT = (key: string) => {
        const parts = key.split(".");
        let current: unknown = currentTranslations;
        for (const p of parts) {
          if (current == null || typeof current !== "object") return undefined;
          current = (current as Record<string, unknown>)[p];
        }
        return typeof current === "string" ? current : undefined;
      };
      loadingTextRef.current =
        currentT("loading.changingLanguage") ?? "Changing language…";

      const cached = getStoredTranslations(newLocale);
      if (cached) {
        setLocale(newLocale);
        setCurrentTranslations(cached);
        return;
      }

      setLoadingTranslations(true);
      try {
        const res = await fetch(
          `${baseUrl}/api/v2/translations?lang=${encodeURIComponent(newLocale)}`,
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { translations?: Translations };
        const next = data.translations ?? currentTranslations;
        setStoredTranslations(newLocale, next);
        setLocale(newLocale);
        setCurrentTranslations(next);
      } catch {
        // Keep current locale and translations on fetch error
      } finally {
        setLoadingTranslations(false);
      }
    },
    [baseUrl, currentTranslations],
  );

  const handleLocationChange = (_location: GeoLocation) => {
    router.refresh();
  };

  useEffect(() => {
    setYearFilter(year);
    setMonthFilter(month);
  }, [year, month]);

  useEffect(() => {
    initMixpanel();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.startDate);
      return d.getUTCFullYear() === yearFilter && d.getUTCMonth() === monthFilter;
    });
  }, [events, yearFilter, monthFilter]);

  const monthYear = useMemo(() => {
    const d = new Date(yearFilter, monthFilter, 1);
    return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }, [yearFilter, monthFilter, locale]);

  const timezone = location.timezone ?? "UTC";
  const calendarUrl = `${baseUrl}${V2_BASE_PATH}/api/calendar?lng=${location.lng}&lat=${location.lat}`;

  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: "100%" }} suppressHydrationWarning>
        <CssBaseline />
        <TranslationProvider locale={locale} translations={currentTranslations}>
          <Header
            locale={locale}
            onLocaleChange={handleLocaleChange}
            calendarUrl={calendarUrl}
            darkMode={darkMode}
            onDarkModeToggle={handleDarkModeToggle}
          />

          <Container component="main" sx={{ paddingBlockEnd: (theme) => theme.spacing(8) }}>
            <Errors show={error} />

            <Card>
              <CardContent>
                <LocationSelector value={location} onChange={handleLocationChange} />
                <Box sx={{ marginBlockStart: (theme) => theme.spacing(1.5) }}>
                  <AngleToggle checked={useAngleMode} onChange={setUseAngleMode} />
                </Box>
              </CardContent>
            </Card>

            <Navigation year={yearFilter} month={monthFilter} />

            <Typography variant="body1" color="text.secondary" sx={{ marginBlockEnd: (theme) => theme.spacing(2), textAlign: "center" }}>
              {(
                (currentTranslations as Record<string, Record<string, string>>).header?.viewing ?? ""
              ).replace("{{monthYear}}", monthYear)}
            </Typography>

            <Events events={filteredEvents} timezone={timezone} useAngleMode={useAngleMode} />
          </Container>

          <Footer />

          <Backdrop
            open={showOverlay}
            sx={{
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress color="inherit" />
            <Typography variant="body1">{loadingTextRef.current}</Typography>
          </Backdrop>
        </TranslationProvider>
      </div>
    </ThemeProvider>
  );
}
