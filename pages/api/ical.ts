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
  )}00Z`;
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
      res.status(200).send(`BEGIN:VCALENDAR
PRODID:-//Björn Wiberg//astro events
X-WR-CALNAME:Astrological events
VERSION:2.0
${sortedEvents
  .reduce((events, event) => {
    const { type, peakDate, startDate, endDate, description, updatedAt } =
      event;
    let { name } = getIconAndNameFromType(event.type);

    const eventDescription = description ? `\nDESCRIPTION:${description}` : "";

    const lastModified = updatedAt
      ? `\nLAST-MODIFIED:${getTimestamp(updatedAt)}`
      : "";

    if (
      type === EventType.TRIPURA_SUNDARI_PEAK ||
      type === EventType.FULL_MOON_PEAK
    ) {
      const date = new Date(startDate);
      const { start, end } =
        type === EventType.TRIPURA_SUNDARI_PEAK
          ? getTripuraSundariDatesFromPeakDate(date)
          : getFullMoonDatesFromPeakDate(date);

      events.push(`BEGIN:VEVENT
SUMMARY:${name}${eventDescription}${lastModified}
DTSTART;TZID=Europe/Stockholm:${getTimestamp(start.toISOString())}
DTEND;TZID=Europe/Stockholm:${getTimestamp(end.toISOString())}
END:VEVENT`);

      name += " peak";
    }

    if (peakDate) {
      events.push(`BEGIN:VEVENT
SUMMARY:${name} peak${eventDescription}${lastModified}
DTSTART;TZID=Europe/Stockholm:${getTimestamp(peakDate)}
DTEND;TZID=Europe/Stockholm:${getTimestamp(peakDate)}
END:VEVENT`);
    }

    events.push(`BEGIN:VEVENT
SUMMARY:${name}${eventDescription}${lastModified}
DTSTART;TZID=Europe/Stockholm:${getTimestamp(event.startDate)}
DTEND;TZID=Europe/Stockholm:${getTimestamp(endDate ?? event.startDate)}
END:VEVENT`);

    return events;
  }, [])
  .join("\n")}
END:VCALENDAR
`);
  }
}
