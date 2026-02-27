"use client";

import { Alert, Typography } from "@mui/material";
import { useTranslation } from "./TranslationProvider";

type ErrorsProps = {
  show: boolean;
};

export function Errors({ show }: ErrorsProps) {
  const { t } = useTranslation();
  if (!show) return null;
  return (
    <Alert severity="error" sx={{ my: 2 }}>
      <Typography variant="body2">{t("errors.fetchEvents")}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {t("errors.fetchEventsHint")}
      </Typography>
    </Alert>
  );
}
