import { headers } from "next/headers";

import { EventBaseType } from "../../types/events";
import { SearchParams } from "../../types/searchParams";

import { getDateFromSearchParams } from "../../utils/date";

import IndexPage from "./components/IndexPage";

const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

async function getEvents(dateISO: string) {
  const host = (await headers()).get("host");
  const res = await fetch(`${protocol}://${host}/api/events?date=${dateISO}`);

  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  let events: EventBaseType[] = [];
  let error = false;

  const searchParams = await props.searchParams;
  const date = getDateFromSearchParams(searchParams);
  const dateISO = date.toISOString().split("T")[0];

  try {
    events = await getEvents(dateISO);
  } catch {
    error = true;
  }

  return <IndexPage date={date} error={error} events={events} />;
}
