import { type EventBaseType, EventType } from "../../types/events";

const solarEclipse: EventBaseType[] = [
  {
    type: EventType.SOLAR_ECLIPSE,
    startDate: "2023-04-20T06:17+01:00",
    description: "Full",
  },
  {
    type: EventType.SOLAR_ECLIPSE,
    startDate: "2023-10-14T20:00+01:00",
    description: "Partial",
  },
];

export default solarEclipse;
