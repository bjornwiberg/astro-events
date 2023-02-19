import Head from "next/head";
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import isSameMonth from "date-fns/isSameMonth";
import isSameYear from "date-fns/isSameYear";
import Link from "next/link";
import { useRouter } from "next/router";
import format from "date-fns/format";

import eventsData from "../data/events";
import styles from "../styles/Home.module.css";
import { EventBaseType, EventType } from "../types/events";

function getEventTypesFromEvents(events: EventBaseType[]) {
  const returnEvents = {};

  events.forEach((event) => {
    if (returnEvents?.[event.type]) returnEvents[event.type].push(event);

    returnEvents[event.type] = [event];
  });

  return returnEvents;
}

function getEventsFromDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return eventsData.filter((event) => {
    return (
      event.startDate.getFullYear() === year &&
      event.startDate.getMonth() === month
    );
  });
}

function getEventTypeFromEvents(events, type: string) {
  if (events?.[type]) {
    return events[type]
      .map(({ startDate, endDate, description }) => {
        return `${format(startDate, "E dd MMM - HH:kk")}${
          endDate ? ` - ${format(endDate, "E dd MMM - HH:kk")}` : ""
        }${description ? ` (${description})` : ""}`;
      })
      .join(", ");
  }
  return null;
}

function getIconAndNameFromType(type: string) {
  switch (type) {
    case EventType.EQUINOX:
      return {
        icon: "🌱",
        name: "Equinox",
      };
    case EventType.SOLSTICE:
      return {
        icon: "🌞",
        name: "Solstice",
      };
    case EventType.HIATUS_SOLAR:
      return {
        icon: "🔆",
        name: "Hiatus Solar",
      };
    case EventType.TRIPURA_SUNDARI_PEAK:
      return {
        icon: "❤️",
        name: "Tripura Sundari",
      };
    case EventType.FULL_MOON_PEAK:
      return {
        icon: "🌕",
        name: "Full moon",
      };
    case EventType.SHIVARATRI:
      return {
        icon: "🔱",
        name: "Shivaratri",
      };
    case EventType.NEW_MOON:
      return {
        icon: "🌑",
        name: "New moon",
      };
    case EventType.MOON_ECLIPSE:
      return {
        icon: "🌒",
        name: "Moon eclipse",
      };
    case EventType.SOLAR_ECLIPSE:
      return {
        icon: "🌚",
        name: "Solar eclipse",
      };
  }
}

function getLinkFromDate(date: Date) {
  const todaysDate = new Date();

  if (isSameYear(todaysDate, date) && isSameMonth(todaysDate, date)) return "/";
  const yearString = isSameYear(todaysDate, date)
    ? ""
    : `year=${date.getFullYear()}&`;
  return `/?${yearString}month=${date.getMonth()}`;
}

function getTodayLinkFromDate(date: Date) {
  const todaysDate = new Date();

  if (!isSameYear(todaysDate, date) || !isSameMonth(todaysDate, date))
    return "/";

  return;
}

function getPreviousLinkFromDate(date: Date) {
  const newDate = subMonths(date, 1);

  return getLinkFromDate(newDate);
}

function getNextLinkFromDate(date: Date) {
  const newDate = addMonths(date, 1);

  return getLinkFromDate(newDate);
}

export default function Home() {
  const { query } = useRouter();

  const month = query.month ?? new Date().getMonth();
  const year = query.year ?? new Date().getFullYear();

  const currentDate = new Date();

  currentDate.setFullYear(year as number);
  currentDate.setMonth(month as number);

  const eventsFromDate = getEventsFromDate(currentDate);

  const events = getEventTypesFromEvents(eventsFromDate);

  const previousLink = getPreviousLinkFromDate(currentDate);
  const nextLink = getNextLinkFromDate(currentDate);
  const todayLink = getTodayLinkFromDate(currentDate);

  return (
    <div className={styles.container}>
      <Head>
        <title>Astrological Events</title>
        <link rel="icon" href="/favicon.ico" />
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

            return (
              <div className={styles.event}>
                {icon} {getEventTypeFromEvents(events, type)}
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
          height: 100px;
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
