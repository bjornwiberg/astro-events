import type { EventBaseType } from "../../types/events";
import { EventType } from "../../types/events";

const moonEclipse: EventBaseType[] = [
	{
		type: EventType.MOON_ECLIPSE,
		peakDate: "2024-03-25T08:13+01:00",
		startDate: "2024-03-25T05:53+01:00",
		endDate: "2024-03-25T10:32+01:00",
		description: "Shadow",
	},
	{
		type: EventType.MOON_ECLIPSE,
		peakDate: "2024-09-18T04:45+01:00",
		startDate: "2024-09-18T02:41+01:00",
		endDate: "2024-09-18T06:47+01:00",
		description: "Partial",
	},
];

export default moonEclipse;
