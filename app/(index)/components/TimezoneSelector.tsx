import TimezoneSelect from "react-timezone-select";

import { track } from "../../../utils/mixpanel";

import styles from "../styles/TimezoneSelector.module.css";

export default function TimezoneSelector({
  selectedTimezone,
  setSelectedTimezone,
}) {
  return (
    <div className={styles.timezoneSelector}>
      <TimezoneSelect
        labelStyle="abbrev"
        value={selectedTimezone}
        onChange={(timezone) => {
          track("Change Zimezone", timezone);
          setSelectedTimezone(timezone);
        }}
      />
    </div>
  );
}
