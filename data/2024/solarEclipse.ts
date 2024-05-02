import { EventBaseType, EventType } from "../../types/events";

const solarEclipse: EventBaseType[] = [
  {
    type: EventType.SOLAR_ECLIPSE,
    peakDate: "2024-04-08T20:18+01:00",
    startDate: "2024-04-08T17:42+01:00",
    endDate: "2024-04-08T22:52+01:00",
    description: "Full",
  },
  {
    type: EventType.SOLAR_ECLIPSE,
    peakDate: "2024-10-02T20:46+01:00",
    startDate: "2024-10-02T17:42+01:00",
    endDate: "2024-10-02T23:47+01:00",
    description: "Partial",
  },
];

export default solarEclipse;
