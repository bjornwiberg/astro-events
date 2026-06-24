"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineOutlined";
import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { track } from "../../../utils/mixpanel";
import { useAppContext } from "./AppProvider";
import { InfoDialog } from "./InfoDialog";
import { startTour } from "./Tour";

export function Footer() {
  const { t } = useAppContext();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <Box
        component="footer"
        sx={{
          position: "fixed",
          bottom: 0,
          insetInline: 0,
          paddingBlock: (theme) => theme.spacing(1),
          paddingInline: (theme) => theme.spacing(1),
          bgcolor: "background.paper",
          borderBlockStart: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.appBar - 1,
          transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box />
        <Typography
          variant="caption"
          color="text.secondary"
          onClick={() => {
            setInfoOpen(true);
            track("Click Footer Info");
          }}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            borderBottom: "1px solid transparent",
            "&:hover": { borderBottomColor: "text.disabled" },
          }}
        >
          {t("footer.supportProject")}
          <FavoriteIcon sx={{ fontSize: 12, color: "secondary.main" }} />
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <IconButton
            size="small"
            onClick={() => startTour("intro", { replay: true })}
            aria-label={t("tour.replayAppTour")}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
