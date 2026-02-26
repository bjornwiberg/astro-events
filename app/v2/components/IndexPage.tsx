"use client";

import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
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
};

export default function IndexPage({
  events,
  location,
  year,
  month,
  lang,
  translations,
  baseUrl,
}: IndexPageProps) {
  const [locale, setLocale] = useState(lang);
  const [monthFilter, setMonthFilter] = useState(month);
  const [yearFilter, setYearFilter] = useState(year);
  const [useAngleMode, setUseAngleMode] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
    router.refresh();
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
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [yearFilter, monthFilter]);

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
        </main>
      </TranslationProvider>
    </ThemeProvider>
  );
}
