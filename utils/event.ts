import { EventType } from "../types/events";

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
