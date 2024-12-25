"use client";

import Head from "next/head";
import TimezoneSelect from "react-timezone-select";
import { setMonth } from "date-fns";
import { setYear } from "date-fns";
import type { ITimezone, ITimezoneOption } from "react-timezone-select";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

  const searchParams = useSearchParams();

  const [offset, setOffset] = useState(
    (new Date().getTimezoneOffset() * -1) / 60
  );
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const displayContent = !error;

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

  const month =
    (searchParams?.get("month") as unknown as number) ?? new Date().getMonth();
  const year =
    (searchParams?.get("year") as unknown as number) ??
    new Date().getFullYear();

  useEffect(() => {
    const newDate = setYear(setMonth(new Date(), month), year);

    setCurrentDate(newDate);
  }, [month, year]);

  useEffect(() => {
    if (!mounted) return;

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

  // prevent hyration error
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <main>
        <h1 className={styles.title}>Welcome to Astro Events</h1>
        <p className={styles.description}>
          View the atrological events for{" "}
          <strong>{currentDateWithMonthAndYear}</strong>
        </p>
        <FetchInformation
          currentDate={currentDateWithMonthAndYear}
          error={error}
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
                <Event
                  event={event}
                  key={`${event.startDate}_${event.type}`}
                  offset={offset}
                />
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
                const result = getIconAndNameFromType(type);
                if (!result) return null;
                const { icon, name } = result;
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
