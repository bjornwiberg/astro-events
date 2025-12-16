import type { EventBaseType } from "../../types/events";
import { EventType } from "../../types/events";

const moonEclipse: EventBaseType[] = [
	{
		type: EventType.MOON_ECLIPSE,
		startDate: "2026-03-03T13:34:00+02:00",
		description: "Partial",
	},
	{
		type: EventType.MOON_ECLIPSE,
		startDate: "2026-08-28T07:13:00+02:00",
		description: "Partial",
	},
];

export default moonEclipse;
