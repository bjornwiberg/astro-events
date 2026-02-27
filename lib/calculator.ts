import type { CalculatorEventType } from "../types/calculatorEvent";
import { mapApiResponseToEvents } from "./calculatorMapping";

const DEFAULT_LOCATION = { lng: 13.0007, lat: 55.6053 }; // Malmö

export type GeoLocation = {
  lng: number;
  lat: number;
  city?: string;
  timezone?: string;
};

export async function fetchCalculatorEvents(
  year: number,
  lng: number = DEFAULT_LOCATION.lng,
  lat: number = DEFAULT_LOCATION.lat,
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
      tmb: `${year}-01-01T00:00:00`,
      tmf: `${year}-12-31T00:00:00`,
      modules: {
        eclipse: true,
        season: true,
        mphase: true,
      },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Calculator API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as unknown;
  const items = Array.isArray(data) ? data : [];
  return mapApiResponseToEvents(items as Parameters<typeof mapApiResponseToEvents>[0]);
}

export { DEFAULT_LOCATION };
