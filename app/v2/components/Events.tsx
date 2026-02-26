"use client";

import { Box, Typography } from "@mui/material";
import { Event } from "./Event";
import type { CalculatorEventType } from "../../types/calculatorEvent";

type EventsProps = {
  events: CalculatorEventType[];
  timezone: string;
  useAngleMode: boolean;
};

export function Events({ events, timezone, useAngleMode }: EventsProps) {
  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        No events this month.
      </Typography>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  return (
    <Box component="ul" sx={{ listStyle: "none", pl: 0, m: 0 }}>
      {sorted.map((event, i) => (
        <Box component="li" key={`${event.type}-${event.startDate}-${i}`}>
          <Event event={event} timezone={timezone} useAngleMode={useAngleMode} />
        </Box>
      ))}
    </Box>
  );
}
