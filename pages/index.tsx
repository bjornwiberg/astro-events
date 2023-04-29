import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TimezoneSelect from "react-timezone-select";
import type { ITimezoneOption } from "react-timezone-select";

import styles from "../styles/Home.module.css";
import { EventBaseType, EventType } from "../types/events";
import {
  formatDate,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "../utils/date";
import { getIconAndNameFromType } from "../utils/event";
import {
  getNextLinkFromDate,
  getPreviousLinkFromDate,
  getTodayLinkFromDate,
} from "../utils/link";
import { initMixpanel, track } from "../utils/mixpanel";

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
  const [selectedTimezone, setSelectedTimezone] = useState<
    string | ITimezoneOption
  >(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    initMixpanel();
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (selectedTimezone?.offset || selectedTimezone?.offset === 0)
      // @ts-ignore
      setOffset(selectedTimezone.offset);
  }, [selectedTimezone]);

  useEffect(() => {
    const newDate = new Date();

    const month = query.month ?? newDate.getMonth();
    const year = query.year ?? newDate.getFullYear();

    newDate.setFullYear(year as number);
    newDate.setMonth(month as number);

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

  const previousLink = getPreviousLinkFromDate(currentDate);
  const nextLink = getNextLinkFromDate(currentDate);
  const todayLink = getTodayLinkFromDate(currentDate);

  const formatDateWithOffset = (date: Date) => formatDate(date, offset);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Astrological Events</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪐</text></svg>"
        />
      </Head>

      <main>
        <h1 className={styles.title}>Welcome to the Astro Events</h1>
        <p className={styles.description}>
          View the atrological events for given month
        </p>
        {!isReady || loading ? (
          <>Fetching events...</>
        ) : error ? (
          <div className={styles.error}>
            An error occured during fetching events
          </div>
        ) : (
          <>
            <h2 className={styles.month}>
              {currentDate.toLocaleDateString(undefined, { month: "long" })}{" "}
              {currentDate.getFullYear()}
            </h2>
            <div className={styles.dateInfo}>
              <Link
                className={todayLink ? "" : styles.dateInfoNoneActive}
                href={todayLink ?? ""}
                onClick={() => track("Click Today Link")}
              >
                Goto today's month
              </Link>
            </div>
            <div className={styles.navigation}>
              <Link
                className={styles.link}
                href={previousLink}
                onClick={() => track("Click Previous Link")}
              >
                &larr; Previous month
              </Link>
              <Link
                className={styles.link}
                href={nextLink}
                onClick={() => track("Click Next Link")}
              >
                Next month &rarr;
              </Link>
            </div>
            <div>
              {!Boolean(events.length) && (
                <p>No data could be found for given month</p>
              )}
              {events.map((event) => {
                const { type, startDate, endDate, description } = event;
                const { icon } = getIconAndNameFromType(type);
                let peakString: JSX.Element;
                let dateString: JSX.Element | string;

                dateString = `${formatDateWithOffset(new Date(startDate))}${
                  endDate ? ` - ${formatDateWithOffset(new Date(endDate))}` : ""
                }`;

                if (
                  type === EventType.TRIPURA_SUNDARI_PEAK ||
                  type === EventType.FULL_MOON_PEAK
                )
                  peakString = (
                    <div>{formatDateWithOffset(new Date(startDate))}</div>
                  );

                if (type === EventType.TRIPURA_SUNDARI_PEAK) {
                  const { start, end } = getTripuraSundariDatesFromPeakDate(
                    new Date(startDate)
                  );

                  dateString = `${formatDateWithOffset(
                    new Date(start)
                  )} - ${formatDateWithOffset(new Date(end))}`;
                }

                if (type === EventType.FULL_MOON_PEAK) {
                  const { start, end } = getFullMoonDatesFromPeakDate(
                    new Date(startDate)
                  );

                  dateString = `${formatDateWithOffset(
                    new Date(start)
                  )} - ${formatDateWithOffset(new Date(end))}`;
                }

                if (description) {
                  dateString = (
                    <div>
                      {dateString} (<strong>{description}</strong>)
                    </div>
                  );
                }

                return (
                  <div className={styles.event} key={startDate.toString()}>
                    <div className={styles.eventIcon}>{icon}</div>
                    <div className={styles.eventDates}>
                      {peakString}
                      {dateString}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.timezoneSelector}>
              <TimezoneSelect
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
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: felx-start;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 40px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
          bottom: 0;
          background: #fff;
          position: sticky;
          font-size: clamp(12px, 2vw, 1rem);
        }
        footer a {
          text-decoration: underline;
          color: inherit;
        }
        footer a:hover {
          text-decoration: none;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
