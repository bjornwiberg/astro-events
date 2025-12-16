import type { EventBaseType } from "../../types/events";
import { EventType } from "../../types/events";

const solstice: EventBaseType[] = [
	{
		type: EventType.SOLSTICE,
		startDate: "2026-06-21T11:25:00+02:00",
	},
	{
		type: EventType.SOLSTICE,
		startDate: "2026-12-21T22:50:00+02:00",
	},
];

export default solstice;
