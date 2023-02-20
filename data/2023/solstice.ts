import { EventBaseType, EventType } from "../../types/events";

const solstice: EventBaseType[] = [
  {
    type: EventType.SOLSTICE,
    startDate: new Date("2023-06-21T16:58:00+01:00"),
  },
  {
    type: EventType.SOLSTICE,
    startDate: new Date("2023-12-22T04:27:00+01:00"),
  },
];

export default solstice;
