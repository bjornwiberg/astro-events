import {
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "./date";

/**
 * Format a UTC date string in the given IANA timezone.
 * Handles DST automatically for all timezones worldwide.
 */
export function formatDateInTimezone(
  utcDateString: string,
  timezone: string,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(utcDateString));
}

export { getTripuraSundariDatesFromPeakDate, getFullMoonDatesFromPeakDate };
