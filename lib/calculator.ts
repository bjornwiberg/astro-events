import { unstable_cache } from "next/cache";
import type { CalculatorEventType } from "../types/calculatorEvent";
import { mapApiResponseToEvents } from "./calculatorMapping";

const DEFAULT_LOCATION = { lng: 13.0007, lat: 55.6053 }; // Malmö
const SUBSCRIPTION_YEARS_BACK = 1;
const SUBSCRIPTION_YEARS_FORWARD = 3;
const CACHE_REVALIDATE_SECONDS = 2 * 24 * 3600; // 2 days (~avg time between PR merges to main)

/** Round to 1 decimal so nearby coords share the same cache/API result. */
function roundGeoCoord(value: number): number {
  return Math.round(value * 10) / 10;
}

export type GeoLocation = {
  lng: number;
  lat: number;
  city?: string;
  timezone?: string;
};

/** Fetch events from calculator API for an arbitrary date range (one request). */
export async function fetchCalculatorEventsByRange(
  lng: number,
  lat: number,
  tmb: string,
  tmf: string
): Promise<CalculatorEventType[]> {
  const baseUrl = process.env.CALCULATOR_API_URL;
  const apiKey = process.env.CALCULATOR_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("CALCULATOR_API_URL and CALCULATOR_API_KEY must be set");
  }

  const url = new URL(baseUrl);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      lng,
      lat,
      tmb,
      tmf,
      modules: {
        eclipse: true,
        season: true,
        mphase: true,
      },
    }),
    next: { revalidate: CACHE_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Calculator API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as unknown;
  const items = Array.isArray(data) ? data : [];
  return mapApiResponseToEvents(items as Parameters<typeof mapApiResponseToEvents>[0]);
}

/** Single-year fetch (kept for backward compatibility). */
export async function fetchCalculatorEvents(
  year: number,
  lng: number = DEFAULT_LOCATION.lng,
  lat: number = DEFAULT_LOCATION.lat
): Promise<CalculatorEventType[]> {
  return fetchCalculatorEventsByRange(lng, lat, `${year}-01-01T00:00:00`, `${year}-12-31T23:59:59`);
}

/** Subscription window: 1 year back, 3 years forward from current year. Cached by (lng, lat, startYear, endYear). */
function getSubscriptionYearRange(): { startYear: number; endYear: number } {
  const y = new Date().getFullYear();
  return {
    startYear: y - SUBSCRIPTION_YEARS_BACK,
    endYear: y + SUBSCRIPTION_YEARS_FORWARD,
  };
}

/** Cached events for calendar subscription and page: 4-year window, 2-day revalidate. Uses lng/lat rounded to 1 decimal so nearby locations share the same cache. */
export async function getCachedSubscriptionEvents(
  lng: number,
  lat: number
): Promise<CalculatorEventType[]> {
  const lngRounded = roundGeoCoord(lng);
  const latRounded = roundGeoCoord(lat);
  const { startYear, endYear } = getSubscriptionYearRange();
  const tmb = `${startYear}-01-01T00:00:00`;
  const tmf = `${endYear}-12-31T23:59:59`;

  return unstable_cache(
    () => fetchCalculatorEventsByRange(lngRounded, latRounded, tmb, tmf),
    [
      "calc-subscription",
      String(lngRounded),
      String(latRounded),
      String(startYear),
      String(endYear),
    ],
    { revalidate: CACHE_REVALIDATE_SECONDS }
  )();
}

export { DEFAULT_LOCATION };
