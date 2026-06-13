import type { EventBaseType } from "../../types/events";
import type { SearchParams } from "../../types/searchParams";

import { getDateFromSearchParams } from "../../utils/date";

import eventsData from "../../data/events";
import IndexPage from "./components/IndexPage";

// Read the local events data directly in the server component instead of doing a
// server-side self-fetch to /api/events. The self-fetch broke under `output:
// 'standalone'` (NODE_ENV=production forced https against an http server) and would
// also hairpin through Cloudflare in the container. Same filter as the route handler.
function getEventsForMonth(events: EventBaseType[], date: Date): EventBaseType[] {
  const year = date.getFullYear();
  const month = date.getUTCMonth();

  return events
    .filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === year && eventDate.getUTCMonth() === month;
    })
    .sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const date = getDateFromSearchParams(searchParams);

  let events: EventBaseType[] = [];
  let error = false;

  try {
    events = getEventsForMonth(eventsData, date);
  } catch {
    error = true;
  }

  return <IndexPage date={date} error={error} events={events} />;
}
