"use client";

import styles from "../styles/Header.module.css";

type HeaderProps = {
  date: Date;
};

export default function Header({ date }: HeaderProps) {
  const currentDateWithMonthAndYear = `${date.toLocaleDateString(undefined, {
    month: "long",
  })} ${date.getFullYear()}`;

  return (
    <>
      <h1 className={styles.title}>Welcome to Astro Events</h1>
      <p>
        Viewing astrological events for <strong>{currentDateWithMonthAndYear}</strong>
      </p>
    </>
  );
}
