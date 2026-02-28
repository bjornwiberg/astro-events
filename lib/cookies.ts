import type { GeoLocation } from "./calculator";

/**
 * Get the value of a cookie by name from a Cookie header string.
 */
export function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1].trim() : null;
}

/**
 * Parse a location cookie value (or the raw Cookie header for "location") into GeoLocation.
 * Use getCookieValue(header, "location") when you have the full Cookie header.
 */
export function parseLocationCookie(cookieValue: string | null | undefined): GeoLocation | null {
  if (cookieValue == null || cookieValue === "") return null;
  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded) as {
      lng?: number;
      lat?: number;
      city?: string;
      timezone?: string;
    };
    if (
      typeof parsed.lng === "number" &&
      typeof parsed.lat === "number" &&
      Number.isFinite(parsed.lng) &&
      Number.isFinite(parsed.lat)
    ) {
      return {
        lng: parsed.lng,
        lat: parsed.lat,
        city: parsed.city,
        timezone: parsed.timezone,
      };
    }
  } catch {
    // ignore
  }
  return null;
}
