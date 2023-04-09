import type { NextApiRequest, NextApiResponse } from "next";
import { EventBaseType } from "../../types/events";
import eventsData from "../../data/events";

function getEventsFromDate(events: EventBaseType[], date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return events.filter((event) => {
    const date = new Date(event.startDate);

    return date.getFullYear() === year && date.getMonth() === month;
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
