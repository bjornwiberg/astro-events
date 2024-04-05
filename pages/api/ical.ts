import type { NextApiRequest, NextApiResponse } from "next";
import { sv } from "date-fns/locale";
import { format } from "date-fns";
import eventsData from "../../data/events";
import { getIconAndNameFromType } from "../../utils/event";
import { EventType } from "../../types/events";
import {
  getDateWithOffsetAndDST,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "../../utils/date";

function getTimestamp(dateString: string) {
  const date = new Date(dateString);
  const dateWithOffset = getDateWithOffsetAndDST(date, 1);

  return `${format(dateWithOffset, "yyyyMMdd")}T${format(
    dateWithOffset,
    "HHmm",
    {
      locale: sv,
    }
  )}00`;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  switch (req.method) {
    case "OPTION":
      res.status(200).appendHeader("DAV", "calendar-access");
    case "GET":
      const sortedEvents = eventsData.sort((a, b) =>
        a.startDate > b.startDate ? 1 : -1
      );
      const rows: string[] = [];

      rows.push("BEGIN:VCALENDAR");
      rows.push("PRODID:-//Björn Wiberg//astro events");
      rows.push("X-WR-CALNAME:Astrological events");
      rows.push("VERSION:2.0");
      rows.push("BEGIN:VTIMEZONE");
      rows.push("TZID:Europe/Stockholm");
      rows.push("BEGIN:STANDARD");
      rows.push("DTSTART;TZID=Europe/Stockholm:20220101T214900");
      rows.push("TZOFFSETFROM:0000");
      rows.push("TZOFFSETTO:+0100");
      rows.push("TZNAME:EST");
      rows.push("END:STANDARD");

      sortedEvents.forEach(
        ({ type, peakDate, startDate, endDate, description, updatedAt }) => {
          const descriptionAndLastModified: string[] = [];
          const { name } = getIconAndNameFromType(type);

          if (description) {
            descriptionAndLastModified.push(`DESCRIPTION:${description}`);
          }
          if (updatedAt) {
            descriptionAndLastModified.push(
              `LAST-MODIFIED:${getTimestamp(updatedAt)}`
            );
          }

          if (type === EventType.TRIPURA_SUNDARI_PEAK) {
            const date = new Date(startDate);
            const { start, end } = getTripuraSundariDatesFromPeakDate(date);

            rows.push("BEGIN:VEVENT");
            rows.push(`SUMMARY:${name} peak`);
            rows.concat(descriptionAndLastModified);
            rows.push(
              `DTSTART;TZID=Europe/Stockholm:${getTimestamp(
                start.toISOString()
              )}`
            );
            rows.push(
              `DTEND;TZID=Europe/Stockholm:${getTimestamp(end.toISOString())}`
            );
            rows.push("END:VEVENT");
          }

          if (type === EventType.FULL_MOON_PEAK) {
            const date = new Date(startDate);
            const { start, end } = getFullMoonDatesFromPeakDate(date);

            rows.push("BEGIN:VEVENT");
            rows.push(`SUMMARY:${name} peak`);
            rows.concat(descriptionAndLastModified);
            rows.push(
              `DTSTART;TZID=Europe/Stockholm:${getTimestamp(
                start.toISOString()
              )}`
            );
            rows.push(
              `DTEND;TZID=Europe/Stockholm:${getTimestamp(end.toISOString())}`
            );
            rows.push("END:VEVENT");
          }

          if (peakDate) {
            rows.push("BEGIN:VEVENT");
            rows.push(`SUMMARY:${name} peak`);
            rows.concat(descriptionAndLastModified);
            rows.push(
              `DTSTART;TZID=Europe/Stockholm:${getTimestamp(peakDate)}`
            );
            rows.push("END:VEVENT");
          }

          rows.push("BEGIN:VEVENT");
          rows.push(`SUMMARY:${name}`);
          rows.concat(descriptionAndLastModified);
          rows.push(`DTSTART;TZID=Europe/Stockholm:${getTimestamp(startDate)}`);
          if (endDate)
            rows.push(`DTSTART;TZID=Europe/Stockholm:${getTimestamp(endDate)}`);
          rows.push("END:VEVENT");
        }
      );

      rows.push("END:VTIMEZONE");
      rows.push("END:VCALENDAR");

      res.status(200).send(rows.join("\n"));
  }
}
