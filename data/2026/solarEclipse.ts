import { type EventBaseType, EventType } from "../../types/events";

const solarEclipse: EventBaseType[] = [
  {
    type: EventType.SOLAR_ECLIPSE,
    startDate: "2026-02-17T14:12:00+02:00",
    description: "Annular",
  },
  {
    type: EventType.SOLAR_ECLIPSE,
    startDate: "2026-08-12T20:46:00+02:00",
    description: "Full",
  },
];

export default solarEclipse;
