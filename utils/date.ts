import { addHours } from "date-fns/addHours";
import { format } from "date-fns/format";
import { subHours } from "date-fns/subHours";

export function isDateDST(d: Date) {
  const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== d.getTimezoneOffset();
}

export function getDateWithOffsetAndDST(date: Date, utcOffsetHrs: number) {
  const baseTzOffset = utcOffsetHrs * 60;
  const tzOffset = date.getTimezoneOffset();
  const d = new Date(date.valueOf() + (baseTzOffset + tzOffset) * 60 * 1000);

  return isDateDST(new Date()) ? subHours(d, 1) : d;
}

export function formatDate(date: Date) {
  return format(date, "E dd MMM HH:mm");
}

export function getTripuraSundariDatesFromPeakDate(date: Date) {
  /*
   * TS period the pattern is as follows:
   *
   * If the minutes of the peak is between 30 mins and 59 - (For example 17:40)
   * You would go to 17:30 and the amorous fusion period is 8 hours before and after this (17:30 - 09:30 next day)
   *
   * If the minutes of the peak is between 00 and 29 minutes (for example 22:11)
   * You would go to 22:00 and the amorous fusion period is 8 hours before and after this (14:00 - 06:00 next day)
   *
   */
  const newDate = new Date(date);
  const minutes = date.getMinutes();
  const extraMinutes = minutes >= 30 ? 30 : 0;
  newDate.setMinutes(extraMinutes);

  return {
    start: subHours(newDate, 8),
    end: addHours(newDate, 8),
  };
}

export function getFullMoonDatesFromPeakDate(date: Date) {
  return {
    start: subHours(date, 18),
    end: addHours(date, 18),
  };
}
