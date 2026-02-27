"use client";

import { Box, Typography } from "@mui/material";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { EventType } from "../../../types/events";
import { getIconAndNameFromType } from "../../../utils/event";
import {
  formatDateInTimezone,
  getTripuraSundariDatesFromPeakDate,
  getFullMoonDatesFromPeakDate,
} from "../../../utils/dateNew";
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
      <Typography component="div" variant="body2" color="text.secondary">
        {fmt(startDate)} <em>({t("event.peak")})</em>
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
        <Typography component="div" variant="body2" color="text.secondary">
          {fmt(peakDate)} <em>({t("event.maximum")})</em>
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
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", py: 0.5 }}>
      <Box component="span" sx={{ fontSize: "1.25rem", lineHeight: 1.2 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {name}
        </Typography>
        {peakString}
        <Typography variant="body2" color="text.secondary">
          {dateString}
          {description && (
            <>
              {" "}
              (<strong>{description}</strong>)
            </>
          )}
        </Typography>
      </Box>
    </Box>
  );
}
