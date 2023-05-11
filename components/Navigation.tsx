import Link from "next/link";
import {
  getNextLinkFromDate,
  getPreviousLinkFromDate,
  getTodayLinkFromDate,
} from "../utils/link";
import { track } from "../utils/mixpanel";

import styles from "../styles/Navigation.module.css";

export function Navigation({ currentDate }: { currentDate: Date }) {
  const previousLink = getPreviousLinkFromDate(currentDate);
  const nextLink = getNextLinkFromDate(currentDate);
  const todayLink = getTodayLinkFromDate(currentDate);

  return (
    <div className={styles.navigation}>
      <Link
        className={styles.link}
        href={previousLink}
        onClick={() => track("Click Previous Link")}
      >
        &larr; <span className={styles.desktop}>Previous month</span>
      </Link>
      {todayLink && (
        <Link
          className={`${styles.link} ${
            todayLink ? "" : styles["link-inactive"]
          }`}
          href={todayLink ?? ""}
          onClick={() => track("Click Today Link")}
        >
          Today's month
        </Link>
      )}
      <Link
        className={styles.link}
        href={nextLink}
        onClick={() => track("Click Next Link")}
      >
        <span className={styles.desktop}>Next month</span> &rarr;
      </Link>
    </div>
  );
}
