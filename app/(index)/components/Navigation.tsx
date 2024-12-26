import Link from "next/link";

import {
  getNextLinkFromDate,
  getPreviousLinkFromDate,
  getTodayLinkFromDate,
} from "../../../utils/link";
import { track } from "../../../utils/mixpanel";

import styles from "../styles/Navigation.module.css";

type NavigationProps = {
  date: Date;
};

export default function Navigation({ date }: NavigationProps) {
  const previousLink = getPreviousLinkFromDate(date);
  const nextLink = getNextLinkFromDate(date);
  const todayLink = getTodayLinkFromDate(date);

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
