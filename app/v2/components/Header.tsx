"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AppBar, Box, Container, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import { CalendarSubscribe } from "./CalendarSubscribe";
import { LanguagePicker } from "./LanguagePicker";

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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: isDark ? "background.paper" : "#1A1A2E",
        color: isDark ? "text.primary" : "#fff",
        borderRadius: 0,
        borderBottom: isDark ? "1px solid" : "none",
        borderColor: "divider",
        mb: 3,
      }}
    >
      <Container disableGutters>
        <Toolbar sx={{ gap: 1 }}>
          <Box component="span" sx={{ fontSize: "1.5rem", mr: 0.5 }}>
            🪐
          </Box>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, whiteSpace: "nowrap" }}>
            Astro Events
          </Typography>
          <IconButton color="inherit" onClick={onDarkModeToggle} size="small">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <LanguagePicker value={locale} onChange={onLocaleChange} variant="appbar" />
          <CalendarSubscribe calendarUrl={calendarUrl} variant="appbar" />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
