import ical, { ICalCalendarMethod } from "ical-generator";
import type { NextApiRequest, NextApiResponse } from "next";
import eventsData from "../../data/events";
import { EventType, EventBaseType } from "../../types/events";
import { getIconAndNameFromType } from "../../utils/event";
import {
  getDateWithOffsetAndDST,
  getTripuraSundariDatesFromPeakDate,
  getFullMoonDatesFromPeakDate,
  isDateDST,
} from "../../utils/date";

interface NormalizedEvent
  extends Omit<
    EventBaseType,
    "startDate" | "endDate" | "peakDate" | "updatedAt"
  > {
  startDate: Date;
  endDate?: Date;
  peakDate?: Date;
  updatedAt?: Date;
}

const normalizeDate = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  const now = new Date();
  const offset = isDateDST(now) ? 2 : 1;
  return getDateWithOffsetAndDST(date, offset);
};

const normalizeEvent = (event: EventBaseType): NormalizedEvent => ({
  ...event,
  startDate: normalizeDate(event.startDate),
  endDate: normalizeDate(event.endDate),
  peakDate: normalizeDate(event.peakDate),
  updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
});

const createEventData = (event: NormalizedEvent, name: string) => ({
  summary: name,
  description: event.description,
  lastModified: event.updatedAt,
});

const createRegularEvent = (event: NormalizedEvent, name: string) => ({
  ...createEventData(event, name),
  start: event.startDate,
  end: event.endDate || event.startDate,
});

const createTripuraSundariEvents = (event: NormalizedEvent, name: string) => {
  const { start, end } = getTripuraSundariDatesFromPeakDate(event.startDate);

  return [
    {
      ...createEventData(event, `${name} peak`),
      start: event.startDate,
      end: event.startDate,
    },
    {
      ...createEventData(event, name),
      start,
      end,
    },
  ];
};

const createFullMoonEvents = (event: NormalizedEvent, name: string) => {
  const { start, end } = getFullMoonDatesFromPeakDate(event.startDate);

  return [
    {
      ...createEventData(event, `${name} peak`),
      start: event.startDate,
      end: event.startDate,
    },
    {
      ...createEventData(event, name),
      start,
      end,
    },
  ];
};

const createEclipseEvents = (event: NormalizedEvent, name: string) => {
  const events = [];

  if (event.peakDate) {
    events.push({
      ...createEventData(event, `${name} maximum`),
      start: event.peakDate,
      end: event.peakDate,
    });
  }

  events.push({
    ...createEventData(event, name),
    start: event.startDate,
    end: event.endDate || event.startDate,
  });

  return events;
};

const generateCalendar = (events: EventBaseType[]) => {
  const calendar = ical({
    name: "Astrological events",
    timezone: "Europe/Stockholm",
    method: ICalCalendarMethod.REQUEST,
  });

  events
    .map(normalizeEvent)
    .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
    .forEach((event) => {
      const { name } = getIconAndNameFromType(event.type);

      if (event.type === EventType.TRIPURA_SUNDARI_PEAK) {
        const events = createTripuraSundariEvents(event, name);
        events.forEach((eventData) => calendar.createEvent(eventData));
      } else if (event.type === EventType.FULL_MOON_PEAK) {
        const events = createFullMoonEvents(event, name);
        events.forEach((eventData) => calendar.createEvent(eventData));
      } else if (
        [EventType.MOON_ECLIPSE, EventType.SOLAR_ECLIPSE].includes(event.type)
      ) {
        const events = createEclipseEvents(event, name);
        events.forEach((eventData) => calendar.createEvent(eventData));
      } else {
        calendar.createEvent(createRegularEvent(event, name));
      }
    });

  return calendar;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const calendar = generateCalendar(eventsData);
    res.setHeader("Content-Type", "text/calendar");
    res.setHeader("Content-Disposition", 'attachment; filename="calendar.ics"');
    res.status(200).send(calendar.toString());
  } catch (error) {
    res.status(500).json({ error: "Failed to generate calendar" });
  }
}
