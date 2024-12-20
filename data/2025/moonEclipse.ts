import { EventBaseType, EventType } from "../../types/events";

const moonEclipse: EventBaseType[] = [
  {
    type: EventType.MOON_ECLIPSE,
    startDate: "2025-03-14T07:55+01:00",
    description: "Partial",
  },
  {
    type: EventType.MOON_ECLIPSE,
    startDate: "2025-09-07T20:09+01:00",
    description: "Full",
  },
];

export default moonEclipse;
