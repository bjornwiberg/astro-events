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
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { GeoLocation } from "../../../lib/calculator";
import type { Translations } from "../../../lib/i18n";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { initMixpanel } from "../../../utils/mixpanel";
import { setDarkModeCookie as setDarkModeCookieAction } from "../actions";
import { darkTheme, lightTheme } from "../theme";
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
  baseUrl: string;
  fetchError?: boolean;
  initialDark?: boolean | null;
};

export default function IndexPage({
  events,
  location,
  year,
  month,
  lang,
  translations,
  baseUrl,
  fetchError: initialFetchError = false,
  initialDark = false,
}: IndexPageProps) {
  const [darkMode, setDarkMode] = useState(Boolean(initialDark));

  const theme = darkMode ? darkTheme : lightTheme;

  const [locale, setLocale] = useState(lang);
  const [monthFilter, setMonthFilter] = useState(month);
  const [yearFilter, setYearFilter] = useState(year);
  const [useAngleMode, setUseAngleMode] = useState(false);
  const [error] = useState(initialFetchError);
  const [isPending, startTransition] = useTransition();
  const [showOverlay, setShowOverlay] = useState(false);
  const router = useRouter();
  const loadingTextRef = useRef("Changing language…");
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (initialDark !== null) return;
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(dark);
    setDarkModeCookieAction(dark);
  }, [initialDark]);

  const handleDarkModeToggle = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    setDarkModeCookieAction(next);
  }, [darkMode]);

  useEffect(() => {
    if (isPending) {
      overlayTimerRef.current = setTimeout(() => setShowOverlay(true), 300);
    } else {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
      setShowOverlay(false);
    }
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [isPending]);

  const handleLocaleChange = (newLocale: string) => {
    const currentT = (key: string) => {
      const parts = key.split(".");
      let current: unknown = translations;
      for (const p of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[p];
      }
      return typeof current === "string" ? current : undefined;
    };
    loadingTextRef.current = currentT("loading.changingLanguage") ?? "Changing language…";
    setLocale(newLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleLocationChange = (_location: GeoLocation) => {
    router.refresh();
  };

  useEffect(() => {
    setLocale(lang);
  }, [lang]);

  useEffect(() => {
    setYearFilter(year);
    setMonthFilter(month);
  }, [year, month]);

  useMemo(() => {
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
  const calendarUrl = `${baseUrl}/api/v2/calendar?lng=${location.lng}&lat=${location.lat}&year=${yearFilter}`;

  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: "100%" }} suppressHydrationWarning>
        <CssBaseline />
        <TranslationProvider locale={locale} translations={translations}>
          <Header
            locale={locale}
            onLocaleChange={handleLocaleChange}
            calendarUrl={calendarUrl}
            darkMode={darkMode}
            onDarkModeToggle={handleDarkModeToggle}
          />

          <Container sx={{ pb: 8 }}>
            <Errors show={error} />

            <Card>
              <CardContent>
                <LocationSelector value={location} onChange={handleLocationChange} />
                <Box sx={{ mt: 1.5 }}>
                  <AngleToggle checked={useAngleMode} onChange={setUseAngleMode} />
                </Box>
              </CardContent>
            </Card>

            <Navigation year={yearFilter} month={monthFilter} />

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
              {(
                (translations as Record<string, Record<string, string>>).header?.viewing ?? ""
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
