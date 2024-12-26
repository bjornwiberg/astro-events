import React from "react";

import { EventType } from "../../../types/events";

import { getIconAndNameFromType } from "../../../utils/event";

import styles from "../styles/Chips.module.css";

export default function Chips() {
  return (
    <div className={styles.chips}>
      {Object.keys(EventType).map((type) => {
        const result = getIconAndNameFromType(type);
        if (!result) return null;
        const { icon, name } = result;
        return (
          <div className={styles.chip} key={name}>
            {icon} {name}
          </div>
        );
      })}
    </div>
  );
}
