import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import eventsData from "../data/events";
import styles from "../styles/Home.module.css";
import { EventType } from "../types/events";
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
  const { query } = useRouter();

  const month = query.month ?? new Date().getMonth();
  const year = query.year ?? new Date().getFullYear();

  const currentDate = new Date();

  currentDate.setFullYear(year as number);
  currentDate.setMonth(month as number);

  const eventsFromDate = getEventsFromDate(eventsData, currentDate);

  const events = getEventTypesFromEvents(eventsFromDate);

  const previousLink = getPreviousLinkFromDate(currentDate);
  const nextLink = getNextLinkFromDate(currentDate);
  const todayLink = getTodayLinkFromDate(currentDate);

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
        <h2>
          {currentDate.toLocaleDateString(undefined, { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </h2>
        {todayLink && <Link href={todayLink}>Goto today's month</Link>}
        <div className={styles.chips}>
          {Object.keys(EventType).map((type) => {
            const { icon, name } = getIconAndNameFromType(type);
            return (
              <div className={styles.chip}>
                {icon} {name}
              </div>
            );
          })}
        </div>
        <div className={styles.grid}>
          <Link href={previousLink} className={styles.card}>
            <h3>&larr; Previous month</h3>
            <p>Get previous months events</p>
          </Link>

          <Link href={nextLink} className={styles.card}>
            <h3>Next month &rarr;</h3>
            <p>Get next months events</p>
          </Link>
        </div>
        <div>
          {!Boolean(Object.keys(events).length) && (
            <h3>No data could be found for given month</h3>
          )}
          {Object.entries(events).map(([type, event]) => {
            const { icon, name } = getIconAndNameFromType(type);

            const currentEvents = events[type];

            return (
              <div className={styles.event}>
                <div>{icon}</div>
                <div className={styles.eventDates}>
                  {currentEvents.map((event) => {
                    const { startDate, endDate, description } = event;
                    let dateString = `${formatDate(startDate)}${
                      endDate ? ` - ${formatDate(endDate)}` : ""
                    }`;
                    let peakString: JSX.Element;

                    if (
                      type === EventType.TRIPURA_SUNDARI_PEAK ||
                      type === EventType.FULL_MOON_PEAK
                    )
                      peakString = (
                        <>
                          {formatDate(startDate)}
                          <br />
                        </>
                      );

                    if (type === EventType.TRIPURA_SUNDARI_PEAK) {
                      const { start, end } = getTripuraSundariDatesFromPeakDate(
                        event.startDate
                      );

                      dateString = `${formatDate(start)} - ${formatDate(end)}`;
                    }

                    if (type === EventType.FULL_MOON_PEAK) {
                      const { start, end } = getFullMoonDatesFromPeakDate(
                        event.startDate
                      );

                      dateString = `${formatDate(start)} - ${formatDate(end)}`;
                    }

                    return (
                      <div>
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
          padding: 5rem 0;
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
