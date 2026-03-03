"use client";

import { Box, Link, Typography } from "@mui/material";
import { track } from "../../../utils/mixpanel";
import { useTranslation } from "./TranslationProvider";

export function V1Banner() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        width: "100%",
        py: 0.75,
        px: 2,
        bgcolor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.primary.main
            : theme.palette.background.paper,
        color: (theme) =>
          theme.palette.mode === "light" ? "#fff" : theme.palette.text.secondary,
        borderBottom: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "light"
            ? "transparent"
            : "rgba(255, 255, 255, 0.08)",
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      <Typography variant="caption">
        {t("v1Banner.text")}{" "}
        <Link
          href="/"
          onClick={() => track("Click Back to V1 Banner")}
          sx={{ color: "inherit", fontWeight: 700 }}
          underline="always"
        >
          {t("v1Banner.link")}
        </Link>
      </Typography>
    </Box>
  );
}
