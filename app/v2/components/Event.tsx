"use client";

import { Box, Typography, useTheme } from "@mui/material";
import type { CalculatorEventType } from "../../../types/calculatorEvent";
import { EventType } from "../../../types/events";
import {
  formatDateInTimezone,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "../../../utils/dateNew";
import { getIconAndNameFromType } from "../../../utils/event";
import { useTranslation } from "./TranslationProvider";

const EVENT_COLORS: Record<EventType, string> = {
  [EventType.EQUINOX]: "#4ade80",
  [EventType.SOLSTICE]: "#fbbf24",
  [EventType.HIATUS_SOLAR]: "#f59e0b",
  [EventType.TRIPURA_SUNDARI_PEAK]: "#f43f5e",
  [EventType.FULL_MOON_PEAK]: "#6366b8",
  [EventType.SHIVARATRI]: "#d4af37",
  [EventType.NEW_MOON]: "#94a3b8",
  [EventType.MOON_ECLIPSE]: "#a78bfa",
  [EventType.SOLAR_ECLIPSE]: "#fb923c",
};

/** Event types that are proper names and are not translated (same in all languages). */
const UNTRANSLATED_EVENT_TYPES: EventType[] = [
  EventType.SHIVARATRI,
  EventType.TRIPURA_SUNDARI_PEAK,
];

type EventProps = {
  event: CalculatorEventType;
  timezone: string;
  useAngleMode: boolean;
};

export function Event({ event, timezone, useAngleMode }: EventProps) {
  const theme = useTheme();
  const { t, locale } = useTranslation();
  const { type, startDate, endDate, peakDate, description, angleBegDate, angleEndDate } = event;
  const iconData = getIconAndNameFromType(type);
  const icon = iconData?.icon ?? "";
  const title = iconData?.name
    ? UNTRANSLATED_EVENT_TYPES.includes(type)
      ? iconData.name
      : t(`eventTypes.${type}`) || iconData.name
    : "";

  const fmt = (utc: string) => formatDateInTimezone(utc, timezone, locale);

  let dateRange: string;
  let peak: string | undefined;
  const descKey = description ? `event.descriptions.${description}` : "";
  const translatedDesc = descKey ? (t(descKey) !== descKey ? t(descKey) : description) : "";
  const note = description ? `(${translatedDesc})` : undefined;

  if (type === EventType.TRIPURA_SUNDARI_PEAK || type === EventType.FULL_MOON_PEAK) {
    peak = `${fmt(startDate)} — ${t("event.peak")}`;
    if (useAngleMode && angleBegDate && angleEndDate) {
      dateRange = `${fmt(angleBegDate)} – ${fmt(angleEndDate)}`;
    } else if (type === EventType.TRIPURA_SUNDARI_PEAK) {
      const { start, end } = getTripuraSundariDatesFromPeakDate(new Date(startDate));
      dateRange = `${fmt(start.toISOString())} – ${fmt(end.toISOString())}`;
    } else {
      const { start, end } = getFullMoonDatesFromPeakDate(new Date(startDate));
      dateRange = `${fmt(start.toISOString())} – ${fmt(end.toISOString())}`;
    }
  } else if (type === EventType.SOLAR_ECLIPSE || type === EventType.MOON_ECLIPSE) {
    if (peakDate) {
      peak = `${fmt(peakDate)} — ${t("event.maximum")}`;
    }
    dateRange = fmt(startDate);
    if (endDate) dateRange += ` – ${fmt(endDate)}`;
  } else {
    dateRange = fmt(startDate);
    if (endDate) dateRange += ` – ${fmt(endDate)}`;
  }

  const color = EVENT_COLORS[type] ?? theme.palette.primary.main;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        paddingBlock: (theme) => theme.spacing(0.75),
        paddingInline: (theme) => theme.spacing(2),
        minWidth: 0,
        borderInlineStart: "3px solid",
        borderColor: color,
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.015)" : "rgba(0, 0, 0, 0.012)",
        borderRadius: 0,
      }}
    >
      <Box sx={{ fontSize: "1.25rem", lineHeight: 1.35, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
            {title}
          </Box>
          {note && (
            <Box component="span" sx={{ color, fontStyle: "italic", marginInlineStart: (theme) => theme.spacing(0.5) }}>
              {note}
            </Box>
          )}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", marginBlockStart: (theme) => theme.spacing(0.25), lineHeight: 1.4 }}
        >
          {dateRange}
        </Typography>
        {peak && (
          <Typography variant="caption" sx={{ display: "block", marginBlockStart: (theme) => theme.spacing(0.25), lineHeight: 1.4, color }}>
            {peak}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
