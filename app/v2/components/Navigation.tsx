"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonGroup } from "@mui/material";
import { useTranslation } from "./TranslationProvider";
import { track } from "../../../utils/mixpanel";
import { addMonths, subMonths, isSameMonth, isSameYear } from "date-fns";

type NavigationProps = {
  year: number;
  month: number;
};

export function Navigation({ year, month }: NavigationProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const isToday = isSameYear(now, new Date(year, month, 1)) && isSameMonth(now, new Date(year, month, 1));

  const go = (y: number, m: number) => {
    router.push(`/v2?year=${y}&month=${m}`);
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
    go(currentYear, currentMonth);
  };

  return (
    <ButtonGroup variant="outlined" size="medium" sx={{ mt: 2, mb: 2 }}>
      <Button onClick={handlePrev} startIcon={<span aria-hidden>←</span>}>
        {t("nav.previousMonth")}
      </Button>
      {!isToday && (
        <Button onClick={handleToday}>{t("nav.today")}</Button>
      )}
      <Button onClick={handleNext} endIcon={<span aria-hidden>→</span>}>
        {t("nav.nextMonth")}
      </Button>
    </ButtonGroup>
  );
}
