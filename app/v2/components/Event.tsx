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
import { useAppContext } from "./AppProvider";

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

function getRelativeTime(date: Date, locale: string): string {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((eventMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
  const sign = Math.sign(diffDays);
  const absDays = Math.abs(diffDays);

  // For less than a week, use simple relative format ("today", "in 3 days", "2 days ago")
  if (absDays < 7) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(sign * absDays, "day");
  }

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
  const unitFmt = (v: number, u: string) =>
    new Intl.NumberFormat(locale, { style: "unit", unit: u, unitDisplay: "long" }).format(v);
  const listFmt = new Intl.ListFormat(locale, { type: "conjunction" });

  let primaryValue: number;
  let primaryUnit: Intl.RelativeTimeFormatUnit;
  let parts: string[];

  if (absDays < 60) {
    const weeks = Math.floor(absDays / 7);
    const days = absDays % 7;
    primaryValue = weeks;
    primaryUnit = "week";
    parts = [unitFmt(weeks, "week")];
    if (days > 0) parts.push(unitFmt(days, "day"));
  } else if (absDays < 365) {
    const months = Math.floor(absDays / 30);
    const weeks = Math.floor((absDays % 30) / 7);
    primaryValue = months;
    primaryUnit = "month";
    parts = [unitFmt(months, "month")];
    if (weeks > 0) parts.push(unitFmt(weeks, "week"));
  } else {
    const years = Math.floor(absDays / 365);
    const months = Math.floor((absDays % 365) / 30);
    primaryValue = years;
    primaryUnit = "year";
    parts = [unitFmt(years, "year")];
    if (months > 0) parts.push(unitFmt(months, "month"));
  }

  // Single unit with no remainder → use "auto" for natural phrasing ("next week", "last month")
  if (parts.length === 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      sign * primaryValue,
      primaryUnit,
    );
  }

  // Compound: replace the primary unit in the RTF output with the full compound string,
  // preserving locale-correct "in X" / "X ago" wrapping
  const combined = listFmt.format(parts);
  const primaryFormatted = unitFmt(primaryValue, primaryUnit);
  const fullRelative = rtf.format(sign * primaryValue, primaryUnit);

  return fullRelative.replace(primaryFormatted, combined);
}

/** Event types that are proper names and are not translated (same in all languages). */
const UNTRANSLATED_EVENT_TYPES: EventType[] = [
  EventType.SHIVARATRI,
  EventType.TRIPURA_SUNDARI_PEAK,
];

type EventProps = {
  event: CalculatorEventType;
};

export function Event({ event }: EventProps) {
  const theme = useTheme();
  const { t, locale, timezone } = useAppContext();
  const { type, startDate, endDate, peakDate, description } = event;
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
    if (type === EventType.TRIPURA_SUNDARI_PEAK) {
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

  const isPast = new Date(endDate ?? startDate) < new Date();
  const relativeTime = getRelativeTime(new Date(startDate), locale);
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
        opacity: isPast ? 0.45 : 1,
      }}
    >
      <Box sx={{ fontSize: "1.25rem", lineHeight: 1.35, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
          <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
            {title}
          </Box>
          <Box component="span" sx={{ color: "text.secondary", fontWeight: 400, marginInlineStart: (theme) => theme.spacing(0.5) }}>
            ({relativeTime})
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
