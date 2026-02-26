"use client";

import { Typography } from "@mui/material";
import { useTranslation } from "./TranslationProvider";

type HeaderProps = {
  monthYear: string;
};

export function Header({ monthYear }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("header.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("header.viewing", { monthYear })}
      </Typography>
    </>
  );
}
