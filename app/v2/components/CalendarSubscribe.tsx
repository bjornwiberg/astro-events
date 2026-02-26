"use client";

import { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment, TextField } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from "./TranslationProvider";
import { track } from "../../../utils/mixpanel";

type CalendarSubscribeProps = {
  calendarUrl: string;
};

export function CalendarSubscribe({ calendarUrl }: CalendarSubscribeProps) {
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
      <Button
        variant="outlined"
        startIcon={<CalendarMonthIcon />}
        onClick={handleOpen}
        size="medium"
      >
        {t("calendarSubscribe.title")}
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("calendarSubscribe.title")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            label="URL"
            value={calendarUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy} aria-label={t("calendarSubscribe.copy")}>
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
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
