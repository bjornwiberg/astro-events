import TimezoneSelect, { ITimezoneOption } from "react-timezone-select";

import { track } from "../../../utils/mixpanel";

import styles from "../styles/TimezoneSelector.module.css";

type TimezoneSelectorProps = {
  onChange: (timezone: ITimezoneOption) => void;
  value: ITimezoneOption;
};

export default function TimezoneSelector({
  onChange: onChange,
  value,
}: TimezoneSelectorProps) {
  return (
    <div className={styles.timezoneSelector}>
      <TimezoneSelect
        labelStyle="abbrev"
        value={value}
        onChange={(timezone) => {
          track("Change Zimezone", timezone);
          onChange(timezone);
        }}
      />
    </div>
  );
}
