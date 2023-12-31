import {
  formatDate,
  getFullMoonDatesFromPeakDate,
  getTripuraSundariDatesFromPeakDate,
} from "../utils/date";
import { getIconAndNameFromType } from "../utils/event";

import { EventBaseType, EventType } from "../types/events";

import styles from "../styles/Event.module.css";

interface EventProps {
  event: EventBaseType;
  offset: number;
}
export function Event({ event, offset }: EventProps) {
  const { type, peakDate, startDate, endDate, description } = event;
  const { icon } = getIconAndNameFromType(type);
  let peakString: JSX.Element;
  let dateString: JSX.Element | string;

  const formatDateWithOffset = (date: Date) => formatDate(date, offset);

  dateString = `${formatDateWithOffset(new Date(startDate))}${
    endDate ? ` - ${formatDateWithOffset(new Date(endDate))}` : ""
  }`;

  if (
    type === EventType.TRIPURA_SUNDARI_PEAK ||
    type === EventType.FULL_MOON_PEAK
  )
    peakString = (
      <div>
        {formatDateWithOffset(new Date(startDate))} <em>(Peak)</em>
      </div>
    );

  if (type === EventType.SOLAR_ECLIPSE || type === EventType.MOON_ECLIPSE)
    peakString = peakDate ? (
      <div>
        {formatDateWithOffset(new Date(peakDate))} <em>(Maximum)</em>
      </div>
    ) : (
      <></>
    );

  if (type === EventType.TRIPURA_SUNDARI_PEAK) {
    const { start, end } = getTripuraSundariDatesFromPeakDate(
      new Date(startDate)
    );

    dateString = `${formatDateWithOffset(
      new Date(start)
    )} - ${formatDateWithOffset(new Date(end))}`;
  }

  if (type === EventType.FULL_MOON_PEAK) {
    const { start, end } = getFullMoonDatesFromPeakDate(new Date(startDate));

    dateString = `${formatDateWithOffset(
      new Date(start)
    )} - ${formatDateWithOffset(new Date(end))}`;
  }

  if (description) {
    dateString = (
      <div>
        {dateString} (<strong>{description}</strong>)
      </div>
    );
  }

  return (
    <div className={styles.event} key={startDate.toString()}>
      <div className={styles.eventIcon}>{icon}</div>
      <div className={styles.eventDates}>
        {peakString}
        {dateString}
      </div>
    </div>
  );
}
