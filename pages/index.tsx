import Head from "next/head";
import TimezoneSelect from "react-timezone-select";
import { setMonth } from "date-fns/setMonth";
import { setYear } from "date-fns/setYear";
import type { ITimezone, ITimezoneOption } from "react-timezone-select";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { EventBaseType, EventType } from "../types/events";

import { getIconAndNameFromType } from "../utils/event";
import { initMixpanel, track } from "../utils/mixpanel";
import { Event } from "../components/Event";
import { FetchInformation } from "../components/FetchInformation";
import { Navigation } from "../components/Navigation";

import styles from "../styles/Home.module.css";

export default function Index() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<EventBaseType[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { isReady, query } = useRouter();
  const [offset, setOffset] = useState(
    (new Date().getTimezoneOffset() * -1) / 60
  );
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const displayContent = isReady && !error;

  const currentDateWithMonthAndYear = `${currentDate.toLocaleDateString(
    undefined,
    { month: "long" }
  )} ${currentDate.getFullYear()}`;

  useEffect(() => {
    initMixpanel();
  }, []);

  useEffect(() => {
    const { offset } = selectedTimezone as ITimezoneOption;

    if (offset || offset === 0) setOffset(offset);
  }, [selectedTimezone]);

  useEffect(() => {
    let newDate = new Date();

    const month = (query.month as unknown as number) ?? newDate.getMonth();
    const year = (query.year as unknown as number) ?? newDate.getFullYear();

    newDate = setYear(newDate, year);
    newDate = setMonth(newDate, month);

    setCurrentDate(newDate);
  }, [query]);

  useEffect(() => {
    if (!isReady || !mounted) return;

    const dateISO = currentDate.toISOString().split("T")[0];

    setLoading(true);
    fetch(`/api/events?date=${dateISO}`)
      .then((res) => res.json())
      .then((res) => {
        setEvents(res);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [currentDate]);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Astro Events</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>"
        />
      </Head>

      <main>
        <h1 className={styles.title}>Welcome to Astro Events</h1>
        <p className={styles.description}>
          View the atrological events for{" "}
          <strong>{currentDateWithMonthAndYear}</strong>
        </p>
        <FetchInformation
          currentDate={currentDateWithMonthAndYear}
          error={error}
          isReady={isReady}
          loading={loading}
        />
        {displayContent && (
          <>
            <Navigation currentDate={currentDate} />
            <div>
              {!Boolean(events.length) && (
                <p>No data could be found for current month</p>
              )}
              {events.map((event) => (
                <Event event={event} key={event.startDate} offset={offset} />
              ))}
            </div>
            <div className={styles.timezoneSelector}>
              <TimezoneSelect
                labelStyle="abbrev"
                value={selectedTimezone}
                onChange={(timezone) => {
                  track("Change Zimezone", timezone);
                  setSelectedTimezone(timezone);
                }}
              />
            </div>
            <div className={styles.chips}>
              {Object.keys(EventType).map((type) => {
                const { icon, name } = getIconAndNameFromType(type);
                return (
                  <div className={styles.chip} key={name}>
                    {icon} {name}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer>
        <div>
          Created by{" "}
          <a
            href="https://bjrn.nu"
            onClick={() => track("Click Footer Link")}
            rel="noopener"
            target="_blank"
          >
            Björn Wiberg
          </a>
        </div>
      </footer>

      <style jsx>{`
        main {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex: 1;
          max-inline-size: 600px;
          padding: 2rem 0;
        }
        footer {
          align-items: center;
          background: #fff;
          block-size: 40px;
          border-top: 1px solid #eaeaea;
          display: flex;
          inset-block-end: 0;
          inline-size: 100%;
          justify-content: center;
          position: sticky;
        }
        footer a {
          color: inherit;
          text-decoration: underline;
        }
        footer a:hover {
          text-decoration: none;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
          margin: 0;
          padding: 0;
        }
        body {
          font-size: clamp(14px, 2vw, 1rem);
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
