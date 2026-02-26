"use client";

import { Box, Link, Typography } from "@mui/material";
import { useTranslation } from "./TranslationProvider";
import { track } from "../../../utils/mixpanel";

export function Footer() {
  const { t } = useTranslation();
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 4,
        borderTop: 1,
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {t("footer.createdBy", { author: "Björn Wiberg" })}{" "}
        <Link
          href="https://bjrn.nu"
          target="_blank"
          rel="noopener"
          onClick={() => track("Click Footer Link")}
          color="inherit"
          underline="hover"
        >
          bjrn.nu
        </Link>
      </Typography>
    </Box>
  );
}
