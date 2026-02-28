"use client";

import { Box, Link, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useTranslation } from "./TranslationProvider";
import { track } from "../../../utils/mixpanel";

export function Footer() {
  const { t } = useTranslation();
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        insetInline: 0,
        paddingBlock: (theme) => theme.spacing(1.5),
        bgcolor: "background.paper",
        borderBlockStart: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.appBar - 1,
        textAlign: "center",
        transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
        {t("footer.createdBy", { author: "" })}
        <FavoriteIcon sx={{ fontSize: 12, color: "secondary.main" }} />
        <Link
          href="https://bjrn.nu"
          target="_blank"
          rel="noopener"
          onClick={() => track("Click Footer Link")}
          color="text.primary"
          underline="hover"
          fontWeight={600}
        >
          Björn Wiberg
        </Link>
      </Typography>
    </Box>
  );
}
