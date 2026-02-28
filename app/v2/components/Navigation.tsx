"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { Box, Button, IconButton } from "@mui/material";
import { addMonths, isSameMonth, isSameYear, subMonths } from "date-fns";
import { useRouter } from "next/navigation";
import { track } from "../../../utils/mixpanel";
import { V2_BASE_PATH } from "../constants";
import { useTranslation } from "./TranslationProvider";

type NavigationProps = {
  year: number;
  month: number;
};

export function Navigation({ year, month }: NavigationProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const now = new Date();
  const isToday =
    isSameYear(now, new Date(year, month, 1)) && isSameMonth(now, new Date(year, month, 1));

  // m is 0–11 (internal); use params only when not viewing current month (like v1)
  const go = (y: number, m: number) => {
    const isCurrentMonth =
      isSameYear(now, new Date(y, m, 1)) && isSameMonth(now, new Date(y, m, 1));
    const path = isCurrentMonth ? V2_BASE_PATH : `${V2_BASE_PATH}?year=${y}&month=${m + 1}`;
    router.push(path);
  };

  const handlePrev = () => {
    const d = subMonths(new Date(year, month, 1), 1);
    track("Click Previous Link", { year: d.getFullYear(), month: d.getMonth() });
    go(d.getFullYear(), d.getMonth());
  };

  const handleNext = () => {
    const d = addMonths(new Date(year, month, 1), 1);
    track("Click Next Link", { year: d.getFullYear(), month: d.getMonth() });
    go(d.getFullYear(), d.getMonth());
  };

  const handleToday = () => {
    track("Click Today Link");
    router.push(V2_BASE_PATH);
  };

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 2, mb: 2 }}
    >
      <IconButton
        onClick={handlePrev}
        aria-label={t("nav.previousMonth")}
        sx={{ width: 48, height: 48 }}
      >
        <ChevronLeftIcon fontSize="medium" />
      </IconButton>
      <Button
        variant="outlined"
        size="large"
        startIcon={<TodayIcon />}
        onClick={handleToday}
        disabled={isToday}
        sx={{ flexShrink: 0 }}
      >
        {t("nav.today")}
      </Button>
      <IconButton
        onClick={handleNext}
        aria-label={t("nav.nextMonth")}
        sx={{ width: 48, height: 48 }}
      >
        <ChevronRightIcon fontSize="medium" />
      </IconButton>
    </Box>
  );
}
