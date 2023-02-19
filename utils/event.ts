import { EventBaseType, EventType } from "../types/events";
import { formatDate } from "./date";

export function getEventTypesFromEvents(events: EventBaseType[]) {
  const returnEvents = {};

  events.forEach((event) => {
    returnEvents?.[event.type]
      ? returnEvents[event.type].push(event)
      : (returnEvents[event.type] = [event]);
  });

  return returnEvents;
}

export function getEventsFromDate(events: EventBaseType[], date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return events.filter((event) => {
    return (
      event.startDate.getFullYear() === year &&
      event.startDate.getMonth() === month
    );
  });
}

function getEventTypeFromEvents(events, type: string) {
  if (events?.[type]) {
    return events[type]
      .map(({ startDate, endDate, description }) => {
        return `${formatDate(startDate)}${
          endDate ? ` - ${formatDate(endDate)}` : ""
        }${description ? ` (${description})` : ""}`;
      })
      .join(", ");
  }
  return null;
}

export function getIconAndNameFromType(type: string) {
  switch (type) {
    case EventType.EQUINOX:
      return {
        icon: "🌱",
        name: "Equinox",
      };
    case EventType.SOLSTICE:
      return {
        icon: "🌞",
        name: "Solstice",
      };
    case EventType.HIATUS_SOLAR:
      return {
        icon: "🔆",
        name: "Hiatus Solar",
      };
    case EventType.TRIPURA_SUNDARI_PEAK:
      return {
        icon: "❤️",
        name: "Tripura Sundari",
      };
    case EventType.FULL_MOON_PEAK:
      return {
        icon: "🌕",
        name: "Full moon",
      };
    case EventType.SHIVARATRI:
      return {
        icon: "🔱",
        name: "Shivaratri",
      };
    case EventType.NEW_MOON:
      return {
        icon: "🌑",
        name: "New moon",
      };
    case EventType.MOON_ECLIPSE:
      return {
        icon: "🌒",
        name: "Moon eclipse",
      };
    case EventType.SOLAR_ECLIPSE:
      return {
        icon: "🌚",
        name: "Solar eclipse",
      };
  }
}
