import { addMonths } from "date-fns/addMonths";
import { isSameMonth } from "date-fns/isSameMonth";
import { isSameYear } from "date-fns/isSameYear";
import { subMonths } from "date-fns/subMonths";

export function getLinkFromDate(date: Date) {
  const todaysDate = new Date();

  if (isSameYear(todaysDate, date) && isSameMonth(todaysDate, date)) return "/";
  const yearString = isSameYear(todaysDate, date)
    ? ""
    : `year=${date.getFullYear()}&`;
  return `/?${yearString}month=${date.getMonth()}`;
}

export function getTodayLinkFromDate(date: Date) {
  const todaysDate = new Date();

  if (!isSameYear(todaysDate, date) || !isSameMonth(todaysDate, date))
    return "/";

  return;
}

export function getPreviousLinkFromDate(date: Date) {
  const newDate = subMonths(date, 1);

  return getLinkFromDate(newDate);
}

export function getNextLinkFromDate(date: Date) {
  const newDate = addMonths(date, 1);

  return getLinkFromDate(newDate);
}
