"use client";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { track } from "../../../utils/mixpanel";
import { useTranslation } from "./TranslationProvider";

type CalendarSubscribeProps = {
  calendarUrl: string;
  variant?: "default" | "appbar";
};

export function CalendarSubscribe({ calendarUrl, variant = "default" }: CalendarSubscribeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    track("Calendar Subscribe Open");
    setOpen(true);
    setCopied(false);
  };

  const handleClose = () => {
    track("Calendar Subscribe Close");
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(calendarUrl);
      setCopied(true);
      track("Calendar Subscribe Copy");
    } catch {
      // ignore
    }
  };

  return (
    <>
      {variant === "appbar" ? (
        <IconButton color="inherit" onClick={handleOpen} aria-label={t("calendarSubscribe.title")}>
          <CalendarMonthIcon />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          startIcon={<CalendarMonthIcon />}
          onClick={handleOpen}
          size="medium"
        >
          {t("calendarSubscribe.title")}
        </Button>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("calendarSubscribe.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
            {t("calendarSubscribe.url")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={calendarUrl}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy} aria-label={t("calendarSubscribe.copy")}>
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {copied && (
            <span style={{ fontSize: 12, color: "success.main", marginTop: 4 }}>
              {t("calendarSubscribe.copied")}
            </span>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("calendarSubscribe.close")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
