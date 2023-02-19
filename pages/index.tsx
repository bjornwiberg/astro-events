import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TimezoneSelect from "react-timezone-select";
import type { ITimezoneOption } from "react-timezone-select";

import eventsData from "../data/events";
import styles from "../styles/Home.module.css";
import { EventBaseType, EventType } from "../types/events";
import {
  formatDate,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "../utils/date";
import {
  getEventsFromDate,
  getEventTypesFromEvents,
  getIconAndNameFromType,
} from "../utils/event";
import {
  getNextLinkFromDate,
  getPreviousLinkFromDate,
  getTodayLinkFromDate,
} from "../utils/link";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { query } = useRouter();
  const [offset, setOffset] = useState(
    (new Date().getTimezoneOffset() * -1) / 60
  );
  const [selectedTimezone, setSelectedTimezone] = useState<
    string | ITimezoneOption
  >(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    // @ts-ignore
    if (selectedTimezone?.offset || selectedTimezone?.offset === 0)
      // @ts-ignore
      setOffset(selectedTimezone.offset);
  }, [selectedTimezone]);

  const currentDate = new Date();
  const month = query.month ?? currentDate.getMonth();
  const year = query.year ?? currentDate.getFullYear();

  currentDate.setFullYear(year as number);
  currentDate.setMonth(month as number);

  const eventsFromDate = getEventsFromDate(eventsData, currentDate);

  const events = getEventTypesFromEvents(eventsFromDate);

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
        <h2 className={styles.month}>
          {currentDate.toLocaleDateString(undefined, { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </h2>
        <div className={styles.dateInfo}>
          {todayLink ? (
            <Link href={todayLink}>Goto today's month</Link>
          ) : (
            <span className={styles.dateInfoNoneActive}>
              Goto today's month
            </span>
          )}
        </div>
        <div className={styles.navigation}>
          <Link href={previousLink} className={styles.link}>
            &larr; Previous month
          </Link>
          <Link href={nextLink} className={styles.link}>
            Next month &rarr;
          </Link>
        </div>
        <div>
          {!Boolean(Object.keys(events).length) && (
            <h3>No data could be found for given month</h3>
          )}
          {Object.keys(events).map((type) => {
            const { icon } = getIconAndNameFromType(type);

            const currentEvents: EventBaseType[] = events[type];

            return (
              <div className={styles.event} key={type}>
                <div className={styles.eventIcon}>{icon}</div>
                <div className={styles.eventDates}>
                  {currentEvents.map((event) => {
                    const { startDate, endDate, description } = event;
                    let dateString = `${formatDateWithOffset(startDate)}${
                      endDate ? ` - ${formatDateWithOffset(endDate)}` : ""
                    }`;
                    let peakString: JSX.Element;

                    if (
                      type === EventType.TRIPURA_SUNDARI_PEAK ||
                      type === EventType.FULL_MOON_PEAK
                    )
                      peakString = (
                        <>
                          {formatDateWithOffset(startDate)}
                          <br />
                        </>
                      );

                    if (type === EventType.TRIPURA_SUNDARI_PEAK) {
                      const { start, end } = getTripuraSundariDatesFromPeakDate(
                        event.startDate
                      );

                      dateString = `${formatDateWithOffset(
                        start
                      )} - ${formatDateWithOffset(end)}`;
                    }

                    if (type === EventType.FULL_MOON_PEAK) {
                      const { start, end } = getFullMoonDatesFromPeakDate(
                        event.startDate
                      );

                      dateString = `${formatDateWithOffset(
                        start
                      )} - ${formatDateWithOffset(end)}`;
                    }

                    return (
                      <div key={event.startDate.toString()}>
                        {peakString}
                        {dateString}
                        {description ? (
                          <>
                            {" "}
                            (<strong>{description}</strong>)
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.timezoneSelector}>
          <TimezoneSelect
            value={selectedTimezone}
            onChange={setSelectedTimezone}
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
      </main>

      <footer>
        <div>
          Created by{" "}
          <a href="https://bjrn.nu" target="_blank" rel="noopener noreferrer">
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
          height: 50px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer a {
          text-decoration: none;
          color: inherit;
        }
        footer a:hover {
          text-decoration: underline;
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
