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
  isDateDST,
} from "../../utils/date";

function getTimestamp(dateString: string) {
  const date = new Date(dateString);
  const offset = isDateDST(new Date()) ? 2 : 1;
  const dateWithOffset = getDateWithOffsetAndDST(date, offset);

  return `${format(dateWithOffset, "yyyyMMdd")}T${format(
    dateWithOffset,
    "HHmm",
    {
      locale: sv,
    }
  )}00`;
}

const stringToUuid = (str: string) => {
  str = str.replace("-", "");
  return "xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx".replace(
    /[x]/g,
    function (c, p) {
      return str[p % str.length];
    }
  );
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  console.log({ req });
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
      rows.push("END:VTIMEZONE");

      sortedEvents.forEach(
        ({ type, peakDate, startDate, endDate, description, updatedAt }) => {
          const descriptionAndLastModified: string[] = [];
          const { name } = getIconAndNameFromType(type);
          let summary = `SUMMARY:${name}`;

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
            rows.push(`UID:${stringToUuid(getTimestamp(start.toISOString()))}`);
            rows.push(`DTSTAMP:${getTimestamp(start.toISOString())}`);
            rows.push(summary);
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
            rows.push(`UID:${stringToUuid(getTimestamp(start.toISOString()))}`);
            rows.push(`DTSTAMP:${getTimestamp(start.toISOString())}`);
            rows.push(summary);
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

          if (
            type === EventType.TRIPURA_SUNDARI_PEAK ||
            type === EventType.FULL_MOON_PEAK ||
            peakDate
          ) {
            summary += " peak";
          }

          if (peakDate) {
            rows.push("BEGIN:VEVENT");
            rows.push(`UID:${stringToUuid(getTimestamp(peakDate))}`);
            rows.push(`DTSTAMP:${getTimestamp(peakDate)}`);
            rows.push(summary);
            rows.concat(descriptionAndLastModified);
            rows.push(
              `DTSTART;TZID=Europe/Stockholm:${getTimestamp(peakDate)}`
            );
            rows.push("END:VEVENT");
          }

          rows.push("BEGIN:VEVENT");
          rows.push(`UID:${stringToUuid(getTimestamp(startDate))}`);
          rows.push(`DTSTAMP:${getTimestamp(startDate)}`);
          rows.push(summary);
          rows.concat(descriptionAndLastModified);
          rows.push(`DTSTART;TZID=Europe/Stockholm:${getTimestamp(startDate)}`);
          if (endDate)
            rows.push(`DTEND;TZID=Europe/Stockholm:${getTimestamp(endDate)}`);
          rows.push("END:VEVENT");
        }
      );

      rows.push("END:VCALENDAR");

      res.status(200).send(rows.join("\n"));
    //       res.status(200).send(`BEGIN:VCALENDAR
    // VERSION:2.0
    // PRODID:-//caldav.icloud.com//CALDAVJ 2413B278//EN
    // X-WR-CALNAME:Astrological events
    // X-APPLE-CALENDAR-COLOR:#CC73E1

    // BEGIN:VEVENT
    // CREATED:20231231T155956Z
    // DTEND;TZID=Europe/Stockholm:20240507T015400
    // DTSTAMP:20231231T160044Z
    // DTSTART;TZID=Europe/Stockholm:20240507T000200
    // LAST-MODIFIED:20231231T155956Z
    // SUMMARY:Shivaratri
    // UID:013D82AD-D95F-4C1C-9128-614F826E6207
    // END:VEVENT

    // BEGIN:VEVENT
    // CREATED:20231231T155959Z
    // DTEND;TZID=Europe/Stockholm:20240508T052200
    // DTSTAMP:20231231T160021Z
    // DTSTART;TZID=Europe/Stockholm:20240508T052200
    // LAST-MODIFIED:20231231T155959Z
    // SEQUENCE:0
    // SUMMARY:New moon
    // UID:9EB8A237-E211-426C-BFBB-B81AF06EBEBC
    // END:VEVENT

    // BEGIN:VTIMEZONE
    // TZID:Europe/Stockholm
    // X-LIC-LOCATION:Europe/Stockholm
    // BEGIN:STANDARD
    // DTSTART:18790101T000000
    // RDATE:18790101T000000
    // TZNAME:SET
    // TZOFFSETFROM:+011212
    // TZOFFSETTO:+010014
    // END:STANDARD
    // BEGIN:STANDARD
    // DTSTART:19000101T000000
    // RDATE:19000101T000000
    // RDATE:19800101T000000
    // TZNAME:CET
    // TZOFFSETFROM:+010014
    // TZOFFSETTO:+0100
    // END:STANDARD
    // BEGIN:DAYLIGHT
    // DTSTART:19160514T230000
    // RDATE:19160514T230000
    // RDATE:19800406T020000
    // TZNAME:CEST
    // TZOFFSETFROM:+0100
    // TZOFFSETTO:+0200
    // END:DAYLIGHT
    // BEGIN:STANDARD
    // DTSTART:19161001T010000
    // RDATE:19161001T010000
    // TZNAME:CET
    // TZOFFSETFROM:+0200
    // TZOFFSETTO:+0100
    // END:STANDARD
    // BEGIN:STANDARD
    // DTSTART:19800928T030000
    // RRULE:FREQ=YEARLY;UNTIL=19950924T010000Z;BYMONTH=9;BYDAY=-1SU
    // TZNAME:CET
    // TZOFFSETFROM:+0200
    // TZOFFSETTO:+0100
    // END:STANDARD
    // BEGIN:DAYLIGHT
    // DTSTART:19810329T020000
    // RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
    // TZNAME:CEST
    // TZOFFSETFROM:+0100
    // TZOFFSETTO:+0200
    // END:DAYLIGHT
    // BEGIN:STANDARD
    // DTSTART:19961027T030000
    // RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
    // TZNAME:CET
    // TZOFFSETFROM:+0200
    // TZOFFSETTO:+0100
    // END:STANDARD
    // END:VTIMEZONE

    // END:VCALENDAR
    // `);
  }
}
