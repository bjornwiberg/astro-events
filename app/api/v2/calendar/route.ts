import ical, { ICalCalendarMethod } from "ical-generator";
import { type NextRequest, NextResponse } from "next/server";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { EventType } from "../../../types/events";
import { fetchCalculatorEvents } from "../../../lib/calculator";
import { getIconAndNameFromType } from "../../../utils/event";
import {
  getTripuraSundariDatesFromPeakDate,
  getFullMoonDatesFromPeakDate,
} from "../../../utils/dateNew";

function generateV2Calendar(events: CalculatorEventType[]) {
  const calendar = ical({
    name: "Astro Events",
    timezone: "UTC",
    method: ICalCalendarMethod.REQUEST,
  });

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  for (const event of sorted) {
    const nameData = getIconAndNameFromType(event.type);
    const name = nameData?.name ?? event.type;

    if (event.type === EventType.TRIPURA_SUNDARI_PEAK) {
      calendar.createEvent({
        summary: `${name} peak`,
        start: new Date(event.startDate),
        end: new Date(event.startDate),
      });
      const { start, end } = getTripuraSundariDatesFromPeakDate(new Date(event.startDate));
      calendar.createEvent({
        summary: name,
        start,
        end,
      });
    } else if (event.type === EventType.FULL_MOON_PEAK) {
      calendar.createEvent({
        summary: `${name} peak`,
        start: new Date(event.startDate),
        end: new Date(event.startDate),
      });
      const { start, end } = getFullMoonDatesFromPeakDate(new Date(event.startDate));
      calendar.createEvent({
        summary: name,
        start,
        end,
      });
    } else if (event.type === EventType.SOLAR_ECLIPSE || event.type === EventType.MOON_ECLIPSE) {
      if (event.peakDate) {
        calendar.createEvent({
          summary: `${name} maximum`,
          start: new Date(event.peakDate),
          end: new Date(event.peakDate),
        });
      }
      calendar.createEvent({
        summary: name,
        description: event.description,
        start: new Date(event.startDate),
        end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      });
    } else {
      calendar.createEvent({
        summary: name,
        description: event.description,
        start: new Date(event.startDate),
        end: event.endDate ? new Date(event.endDate) : new Date(event.startDate),
      });
    }
  }

  return calendar;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lngParam = searchParams.get("lng");
  const latParam = searchParams.get("lat");
  const yearParam = searchParams.get("year");

  const lng = lngParam != null ? parseFloat(lngParam) : 13.0007;
  const lat = latParam != null ? parseFloat(latParam) : 55.6053;
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (!Number.isFinite(lng) || !Number.isFinite(lat) || !Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid lng, lat or year" }, { status: 400 });
  }

  try {
    const events = await fetchCalculatorEvents(year, lng, lat);
    const calendar = generateV2Calendar(events);
    return new NextResponse(calendar.toString(), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="astro-events.ics"',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calendar error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
