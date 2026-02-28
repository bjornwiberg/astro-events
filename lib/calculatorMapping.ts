import type { CalculatorEventType } from "../types/calculatorEvent";
import { EventType } from "../types/events";

type ApiMphaseItem = {
  type: "mphase";
  id: string;
  time: string;
  begtime?: string;
  endtime?: string;
  pos?: number;
};

type ApiEclipseItem = {
  type: "eclipse";
  id: string;
  planet: string;
  time: string;
  pos?: number;
  lat?: number;
};

type ApiSimpleItem = {
  type: "simple";
  id: string;
  time: string;
};

type ApiResponseItem = ApiMphaseItem | ApiEclipseItem | ApiSimpleItem;

const ECLIPSE_DESCRIPTION: Record<string, string> = {
  pumb: "Penumbral",
  tot: "Total",
  par: "Partial",
};

/**
 * Round seconds to nearest minute: >=30 rounds up, <30 truncates.
 * Returns ISO string with Z suffix (e.g. "2026-01-01T13:57:00.000Z").
 */
function roundToMinute(isoLike: string): string {
  const d = new Date(isoLike.endsWith("Z") ? isoLike : `${isoLike}Z`);
  const seconds = d.getUTCSeconds();
  if (seconds >= 30) d.setUTCMinutes(d.getUTCMinutes() + 1);
  d.setUTCSeconds(0, 0);
  return d.toISOString();
}

function ensureUtcZ(time: string): string {
  const trimmed = time.trim();
  const withZ = trimmed.endsWith("Z") ? trimmed : `${trimmed}Z`;
  return roundToMinute(withZ);
}

export function mapApiIdToEventType(
  id: string,
  planet?: string,
): EventType | null {
  if (planet === "sun") return EventType.SOLAR_ECLIPSE;
  if (planet === "moo") return EventType.MOON_ECLIPSE;

  switch (id) {
    case "ts":
      return EventType.TRIPURA_SUNDARI_PEAK;
    case "fm":
      return EventType.FULL_MOON_PEAK;
    case "sr":
      return EventType.SHIVARATRI;
    case "nm":
      return EventType.NEW_MOON;
    case "se":
    case "ae":
      return EventType.EQUINOX;
    case "ss":
    case "ws":
      return EventType.SOLSTICE;
    case "sh":
      return EventType.HIATUS_SOLAR;
    default:
      return null;
  }
}

export function mapApiResponseToEvents(items: ApiResponseItem[]): CalculatorEventType[] {
  const result: CalculatorEventType[] = [];

  for (const item of items) {
    if (item.type === "mphase") {
      const type = mapApiIdToEventType(item.id);
      if (!type) continue;

      const timeZ = ensureUtcZ(item.time);

      if (item.id === "ts" || item.id === "fm") {
        result.push({
          type,
          startDate: timeZ,
          angleBegDate: item.begtime ? ensureUtcZ(item.begtime) : undefined,
          angleEndDate: item.endtime ? ensureUtcZ(item.endtime) : undefined,
        });
      } else if (item.id === "sr") {
        result.push({
          type,
          startDate: item.begtime ? ensureUtcZ(item.begtime) : timeZ,
          endDate: item.endtime ? ensureUtcZ(item.endtime) : undefined,
        });
      } else {
        result.push({
          type,
          startDate: timeZ,
        });
      }
      continue;
    }

    if (item.type === "eclipse") {
      const type = mapApiIdToEventType(item.id, item.planet);
      if (!type) continue;
      const description = ECLIPSE_DESCRIPTION[item.id];
      result.push({
        type,
        startDate: ensureUtcZ(item.time),
        description: description || undefined,
      });
      continue;
    }

    if (item.type === "simple") {
      const type = mapApiIdToEventType(item.id);
      if (!type) continue;
      result.push({
        type,
        startDate: ensureUtcZ(item.time),
      });
    }
  }

  result.sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  return result;
}
