import { EventBaseType, EventType } from "../../types/events";

const solarEclipse: EventBaseType[] = [
  {
    type: EventType.SOLAR_ECLIPSE,
    startDate: new Date("2022-04-30T22:41+01:00"),
    description: "Partial",
  },
  {
    type: EventType.SOLAR_ECLIPSE,
    startDate: new Date("2022-10-25T13:00+01:00"),
    description: "Partial",
  },
];

export default solarEclipse;
