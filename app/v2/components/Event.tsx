"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { EventType } from "../../../types/events";
import {
  formatDateInTimezone,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "../../../utils/dateNew";
import { getIconAndNameFromType } from "../../../utils/event";
import { useTranslation } from "./TranslationProvider";

type EventProps = {
  event: CalculatorEventType;
  timezone: string;
  useAngleMode: boolean;
};

export function Event({ event, timezone, useAngleMode }: EventProps) {
  const { t, locale } = useTranslation();
  const { type, startDate, endDate, peakDate, description, angleBegDate, angleEndDate } = event;
  const iconData = getIconAndNameFromType(type);
  const icon = iconData?.icon ?? "";
  const name = iconData?.name ? t(`eventTypes.${type}`) || iconData.name : "";

  const fmt = (utc: string) => formatDateInTimezone(utc, timezone, locale);

  let peakString: React.ReactNode = null;
  let dateString: string;

  if (type === EventType.TRIPURA_SUNDARI_PEAK || type === EventType.FULL_MOON_PEAK) {
    peakString = (
      <Typography variant="caption" color="text.secondary">
        {fmt(startDate)} — {t("event.peak")}
      </Typography>
    );
    if (useAngleMode && angleBegDate && angleEndDate) {
      dateString = `${fmt(angleBegDate)} – ${fmt(angleEndDate)}`;
    } else if (type === EventType.TRIPURA_SUNDARI_PEAK) {
      const { start, end } = getTripuraSundariDatesFromPeakDate(new Date(startDate));
      dateString = `${fmt(start.toISOString())} – ${fmt(end.toISOString())}`;
    } else {
      const { start, end } = getFullMoonDatesFromPeakDate(new Date(startDate));
      dateString = `${fmt(start.toISOString())} – ${fmt(end.toISOString())}`;
    }
  } else if (type === EventType.SOLAR_ECLIPSE || type === EventType.MOON_ECLIPSE) {
    if (peakDate) {
      peakString = (
        <Typography variant="caption" color="text.secondary">
          {fmt(peakDate)} — {t("event.maximum")}
        </Typography>
      );
    }
    dateString = fmt(startDate);
    if (endDate) dateString += ` – ${fmt(endDate)}`;
  } else {
    dateString = fmt(startDate);
    if (endDate) dateString += ` – ${fmt(endDate)}`;
  }

  return (
    <Card
      sx={{
        height: { xs: "auto", md: "120px" },
        width: "100%",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Box
          sx={{
            fontSize: "1.5rem",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dateString}
            {description && (
              <>
                {" "}
                (<strong>{description}</strong>)
              </>
            )}
          </Typography>
          {peakString}
        </Box>
      </CardContent>
    </Card>
  );
}
