import { EventBaseType } from "../../../types/events";

import { Event } from "./Event";

export default function Events({
  events,
  offset,
}: {
  events: EventBaseType[];
  offset: number;
}) {
  return (
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
  );
}
