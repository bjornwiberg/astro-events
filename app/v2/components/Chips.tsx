"use client";

import { Box, Chip, Typography } from "@mui/material";
import { useTranslation } from "./TranslationProvider";
import { EventType } from "../../../types/events";
import { getIconAndNameFromType } from "../../../utils/event";

export function Chips() {
  const { t } = useTranslation();
  const types = Object.values(EventType);
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}>
      {types.map((type) => {
        const data = getIconAndNameFromType(type);
        if (!data) return null;
        const label = t(`eventTypes.${type}`) || data.name;
        return (
          <Chip
            key={type}
            size="small"
            label={`${data.icon} ${label}`}
            variant="outlined"
            sx={{ fontSize: "0.75rem" }}
          />
        );
      })}
    </Box>
  );
}
