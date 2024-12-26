"use client";

import type { ITimezone, ITimezoneOption } from "react-timezone-select";
import { useEffect, useState } from "react";

import { EventBaseType } from "../../../types/events";
import { initMixpanel } from "../../../utils/mixpanel";

import Chips from "./Chips";
import Errors from "./Errors";
import Events from "./Events";
import Footer from "./Footer";
import Header from "./Header";
import Navigation from "./Navigation";
import TimezoneSelector from "./TimezoneSelector";

import styles from "../styles/IndexPage.module.css";

interface ClientPageProps {
  date: Date;
  error: boolean;
  events: EventBaseType[];
}

export default function IndexPage({ date, error, events }: ClientPageProps) {
  const [mounted, setMounted] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>("UTC");

  useEffect(() => {
    setMounted(true);
    initMixpanel();
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedTimezone(browserTimezone);
    setOffset(new Date().getTimezoneOffset() / -60);
  }, []);

  useEffect(() => {
    const { offset } = selectedTimezone as ITimezoneOption;
    if (offset || offset === 0) setOffset(offset);
  }, [selectedTimezone]);

  if (!mounted) return null;

  return (
    <>
      <main className={styles.main}>
        <Header date={date} />
        <Errors error={error} />
        <Navigation currentDate={date} />
        <Events events={events} offset={offset} />
        <TimezoneSelector
          selectedTimezone={selectedTimezone}
          setSelectedTimezone={setSelectedTimezone}
        />
        <Chips />
      </main>
      <Footer />
    </>
  );
}
