"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useAppContext } from "./AppProvider";
import { track } from "../../../utils/mixpanel";
import { InfoDialog } from "./InfoDialog";

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
          paddingBlock: (theme) => theme.spacing(1.5),
          bgcolor: "background.paper",
          borderBlockStart: "1px solid",
          borderColor: "divider",
          zIndex: (theme) => theme.zIndex.appBar - 1,
          textAlign: "center",
          transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
        }}
      >
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
      </Box>
      <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
