import type { NextApiRequest, NextApiResponse } from "next";
import { EventBaseType } from "../../types/events";
import eventsData from "../../data/events";

function getEventsFromDate(events: EventBaseType[], date: Date) {
  const year = date.getFullYear();
  const month = date.getUTCMonth();

  return events.filter((event) => {
    const eventDate = new Date(event.startDate);

    return (
      eventDate.getFullYear() === year && eventDate.getUTCMonth() === month
    );
  });
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventBaseType[]>
) {
  const date = req.query.date;
  const events = getEventsFromDate(eventsData, new Date(date as string));
  const sortedEvents = events.sort((a, b) =>
    a.startDate > b.startDate ? 1 : -1
  );

  res.status(200).json(sortedEvents);
}
