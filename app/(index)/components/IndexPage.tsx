"use client";

import { useEffect, useState } from "react";
import type { ITimezone, ITimezoneOption } from "react-timezone-select";

import type { EventBaseType } from "../../../types/events";
import { initMixpanel } from "../../../utils/mixpanel";
import styles from "../styles/IndexPage.module.css";
import Chips from "./Chips";
import Errors from "./Errors";
import Events from "./Events";
import Footer from "./Footer";
import Header from "./Header";
import Navigation from "./Navigation";
import TimezoneSelector from "./TimezoneSelector";

type IndexPageProps = {
  date: Date;
  error: boolean;
  events: EventBaseType[];
};

export default function IndexPage({ date, error, events }: IndexPageProps) {
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
        <Errors show={error} />
        <Navigation date={date} />
        <Events events={events} offset={offset} />
        <TimezoneSelector
          value={selectedTimezone as ITimezoneOption}
          onChange={setSelectedTimezone}
        />
        <Chips />
      </main>
      <Footer />
    </>
  );
}
