"use client";

import { Grid, Typography } from "@mui/material";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { Event } from "./Event";
import { useAppContext } from "./AppProvider";

type EventsProps = {
  events: CalculatorEventType[];
};

export function Events({ events }: EventsProps) {
  const { t } = useAppContext();

  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ paddingBlock: (theme) => theme.spacing(2) }}>
        {t("events.noEventsThisMonth")}
      </Typography>
    );
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <Grid container spacing={2}>
      {sorted.map((event) => (
        <Grid
          size={{ xs: 12, md: 6 }}
          key={`${event.type}-${event.startDate}`}
          sx={{ display: "flex", minWidth: 0 }}
        >
          <Event event={event} />
        </Grid>
      ))}
    </Grid>
  );
}
