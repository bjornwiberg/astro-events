"use client";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Box,
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
import { useAppContext } from "./AppProvider";
import { hasUnseenSteps, startTour } from "./Tour";

type CalendarSubscribeProps = {
  calendarUrl: string;
  variant?: "default" | "appbar";
};

export function CalendarSubscribe({ calendarUrl, variant = "default" }: CalendarSubscribeProps) {
  const { t, dir } = useAppContext();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = () => {
    track("Calendar Subscribe Open");
    setOpen(true);
    setCopied(false);
    if (hasUnseenSteps("calendar-dialog")) {
      window.setTimeout(() => startTour("calendar-dialog"), 350);
    }
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
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label={t("calendarSubscribe.title")}
          data-tour="calendar"
        >
          <CalendarMonthIcon />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          startIcon={<CalendarMonthIcon />}
          onClick={handleOpen}
          size="medium"
          data-tour="calendar"
        >
          {t("calendarSubscribe.title")}
        </Button>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ dir }}>
        <DialogTitle>
          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}
          >
            <span>{t("calendarSubscribe.title")}</span>
            <IconButton
              size="small"
              onClick={() => startTour("calendar-dialog", { replay: true })}
              aria-label={t("tour.replayCalendarTour")}
            >
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ marginBlockEnd: (theme) => theme.spacing(0.5) }}
          >
            {t("calendarSubscribe.url")}
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={calendarUrl}
            data-tour="calendar-url"
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position={dir === "rtl" ? "start" : "end"}>
                    <IconButton
                      onClick={handleCopy}
                      aria-label={t("calendarSubscribe.copy")}
                      data-tour="calendar-copy"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          {copied && (
            <Typography
              variant="caption"
              sx={{
                color: "success.main",
                marginBlockStart: (theme) => theme.spacing(0.5),
                display: "block",
              }}
            >
              {t("calendarSubscribe.copied")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("calendarSubscribe.close")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
