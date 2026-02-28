"use client";

import { Grid, Typography } from "@mui/material";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { Event } from "./Event";
import { useTranslation } from "./TranslationProvider";

type EventsProps = {
  events: CalculatorEventType[];
  timezone: string;
  useAngleMode: boolean;
};

export function Events({ events, timezone, useAngleMode }: EventsProps) {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
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
          <Event event={event} timezone={timezone} useAngleMode={useAngleMode} />
        </Grid>
      ))}
    </Grid>
  );
}
