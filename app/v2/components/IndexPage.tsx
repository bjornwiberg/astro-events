"use client";

import { ThemeProvider } from "@mui/material/styles";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect, useTransition } from "react";
import { v2Theme } from "../theme";
import { TranslationProvider } from "./TranslationProvider";
import { LanguagePicker } from "./LanguagePicker";
import { Navigation } from "./Navigation";
import { LocationSelector } from "./LocationSelector";
import { Header } from "./Header";
import { AngleToggle } from "./AngleToggle";
import { Events } from "./Events";
import { Chips } from "./Chips";
import { Footer } from "./Footer";
import { Errors } from "./Errors";
import { CalendarSubscribe } from "./CalendarSubscribe";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import type { GeoLocation } from "../../../lib/calculator";
import type { Translations } from "../../../lib/i18n";
import { initMixpanel } from "../../../utils/mixpanel";

type IndexPageProps = {
  events: CalculatorEventType[];
  location: GeoLocation;
  year: number;
  month: number;
  lang: string;
  translations: Translations;
  baseUrl: string;
  fetchError?: boolean;
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
}: IndexPageProps) {
  const [locale, setLocale] = useState(lang);
  const [monthFilter, setMonthFilter] = useState(month);
  const [yearFilter, setYearFilter] = useState(year);
  const [useAngleMode, setUseAngleMode] = useState(false);
  const [error, setError] = useState(initialFetchError);
  const [isPending, startTransition] = useTransition();
  const [showOverlay, setShowOverlay] = useState(false);
  const router = useRouter();
  const loadingTextRef = useRef("Changing language…");
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <ThemeProvider theme={v2Theme}>
      <TranslationProvider locale={locale} translations={translations}>
        <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
          <Header monthYear={monthYear} />
          <Errors show={error} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", my: 2 }}>
            <LanguagePicker value={locale} onChange={handleLocaleChange} />
            <LocationSelector value={location} onChange={handleLocationChange} />
            <AngleToggle checked={useAngleMode} onChange={setUseAngleMode} />
            <CalendarSubscribe calendarUrl={calendarUrl} />
          </Box>
          <Navigation year={yearFilter} month={monthFilter} />
          <Events
            events={filteredEvents}
            timezone={timezone}
            useAngleMode={useAngleMode}
          />
          <Chips />
          <Footer />
          <Backdrop
            open={showOverlay}
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1, flexDirection: "column", gap: 2 }}
          >
            <CircularProgress color="inherit" />
            <Typography variant="body1">{loadingTextRef.current}</Typography>
          </Backdrop>
        </main>
      </TranslationProvider>
    </ThemeProvider>
  );
}
