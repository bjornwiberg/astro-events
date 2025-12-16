import ical, { ICalCalendarMethod } from "ical-generator";
import { NextResponse } from "next/server";
import eventsData from "../../../data/events";
import { type EventBaseType, EventType } from "../../../types/events";
import {
  getDateWithOffsetAndDST,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
  isDateDST,
} from "../../../utils/date";
import { getIconAndNameFromType } from "../../../utils/event";

type NormalizedEvent = Omit<EventBaseType, "startDate" | "endDate" | "peakDate" | "updatedAt"> & {
  startDate: Date;
  endDate?: Date;
  peakDate?: Date;
  updatedAt?: Date;
};

type CalendarEvent = {
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  lastModified?: Date;
};

const normalizeDate = (dateString: string): Date => {
  const date = new Date(dateString);
  const now = new Date();
  const offset = isDateDST(now) ? 2 : 1;
  return getDateWithOffsetAndDST(date, offset);
};

const normalizeEvent = (event: EventBaseType): NormalizedEvent => ({
  ...event,
  startDate: normalizeDate(event.startDate),
  endDate: event.endDate ? normalizeDate(event.endDate) : undefined,
  peakDate: event.peakDate ? normalizeDate(event.peakDate) : undefined,
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
  const events: CalendarEvent[] = [];

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
      const nameData = getIconAndNameFromType(event.type);
      const name = nameData?.name ?? "";

      if (event.type === EventType.TRIPURA_SUNDARI_PEAK) {
        const events = createTripuraSundariEvents(event, name);
        events.forEach((eventData) => {
          calendar.createEvent(eventData);
        });
      } else if (event.type === EventType.FULL_MOON_PEAK) {
        const events = createFullMoonEvents(event, name);
        events.forEach((eventData) => {
          calendar.createEvent(eventData);
        });
      } else if ([EventType.MOON_ECLIPSE, EventType.SOLAR_ECLIPSE].includes(event.type)) {
        const events = createEclipseEvents(event, name);
        events.forEach((eventData) => {
          calendar.createEvent(eventData);
        });
      } else {
        calendar.createEvent(createRegularEvent(event, name));
      }
    });

  return calendar;
};

export async function GET() {
  try {
    const calendar = generateCalendar(eventsData);
    const response = new NextResponse(calendar.toString(), {
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": 'attachment; filename="calendar.ics"',
      },
    });
    return response;
  } catch {
    return new NextResponse(JSON.stringify({ error: "Failed to generate calendar" }), {
      status: 500,
    });
  }
}
