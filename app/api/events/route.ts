import { type NextRequest, NextResponse } from "next/server";
import eventsData from "../../../data/events";
import type { EventBaseType } from "../../../types/events";

function getEventsFromDate(events: EventBaseType[], date: Date) {
  const year = date.getFullYear();
  const month = date.getUTCMonth();

  return events.filter((event) => {
    const eventDate = new Date(event.startDate);

    return eventDate.getFullYear() === year && eventDate.getUTCMonth() === month;
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const events = getEventsFromDate(eventsData, new Date(date as string));
  const sortedEvents = events.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

  return NextResponse.json(sortedEvents, { status: 200 });
}
