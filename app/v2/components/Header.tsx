"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Box, Container, IconButton, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { CalendarSubscribe } from "./CalendarSubscribe";
import { LanguagePicker } from "./LanguagePicker";
import { useTranslation } from "./TranslationProvider";

type HeaderProps = {
  locale: string;
  onLocaleChange: (locale: string) => void;
  calendarUrl: string;
  darkMode: boolean;
  onDarkModeToggle: () => void;
};

export function Header({
  locale,
  onLocaleChange,
  calendarUrl,
  darkMode,
  onDarkModeToggle,
}: HeaderProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <header className="v2-header">
      <Container disableGutters>
        <Toolbar sx={{ gap: 1 }}>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="span" sx={{ fontSize: "1.5rem" }}>
              🪐
            </Box>
            <Typography
            className={isMobile ? "visually-hidden": ""}
              variant="h6"
              component="h1"
            >
              Astro Events
            </Typography>
          </Box>
          <IconButton
            color="inherit"
            onClick={onDarkModeToggle}
            size="small"
            aria-label={t("aria.toggleDarkMode")}
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <LanguagePicker value={locale} onChange={onLocaleChange} variant="appbar" />
          <CalendarSubscribe calendarUrl={calendarUrl} variant="appbar" />
        </Toolbar>
      </Container>
    </header>
  );
}
