"use client";

import { ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { v2Theme } from "../theme";
import { TranslationProvider } from "./TranslationProvider";
import { LanguagePicker } from "./LanguagePicker";
import { Navigation } from "./Navigation";
import { LocationSelector } from "./LocationSelector";
import type { CalculatorEventType } from "../../types/calculatorEvent";
import type { GeoLocation } from "../../lib/calculator";
import type { Translations } from "../../lib/i18n";
import { initMixpanel } from "../../utils/mixpanel";

type IndexPageProps = {
  events: CalculatorEventType[];
  location: GeoLocation;
  year: number;
  month: number;
  lang: string;
  translations: Translations;
};

export default function IndexPage({
  events,
  location,
  year,
  month,
  lang,
  translations,
}: IndexPageProps) {
  const [locale, setLocale] = useState(lang);
  const [monthFilter, setMonthFilter] = useState(month);
  const [yearFilter, setYearFilter] = useState(year);
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

  return (
    <ThemeProvider theme={v2Theme}>
      <TranslationProvider locale={locale} translations={translations}>
        <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
          <h1>Astro Events (v2)</h1>
          <p>
            {yearFilter} – month {monthFilter + 1} · {location.city ?? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`}
          </p>
          <LanguagePicker value={locale} onChange={handleLocaleChange} />
          <LocationSelector value={location} onChange={handleLocationChange} />
          <Navigation year={yearFilter} month={monthFilter} />
          <pre style={{ fontSize: 12, overflow: "auto" }}>
            {filteredEvents.length} events this month
          </pre>
        </main>
      </TranslationProvider>
    </ThemeProvider>
  );
}
