"use client";

import { FormControlLabel, Switch } from "@mui/material";
import { useTranslation } from "./TranslationProvider";
import { track } from "../../../utils/mixpanel";

type AngleToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function AngleToggle({ checked, onChange }: AngleToggleProps) {
  const { t } = useTranslation();

  const handleChange = (_: React.ChangeEvent<HTMLInputElement>, value: boolean) => {
    track("Toggle Angle Mode", { useAngleMode: value });
    onChange(value);
  };

  return (
    <FormControlLabel
      control={<Switch checked={checked} onChange={handleChange} color="primary" />}
      label={t("angleToggle.label")}
    />
  );
}
