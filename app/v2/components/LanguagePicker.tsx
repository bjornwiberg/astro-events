"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { track } from "../../../utils/mixpanel";
import { SUPPORTED_LOCALES } from "../../../lib/i18n";

const NATIVE_NAMES: Record<string, string> = {
  en: "English",
  ar: "العربية",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  he: "עברית",
  hi: "हिन्दी",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  pt: "Português",
  ru: "Русский",
  zh: "中文",
  fa: "فارسی",
  ur: "اردو",
  nl: "Nederlands",
  pl: "Polski",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Bahasa Indonesia",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  el: "Ελληνικά",
  ro: "Română",
  hu: "Magyar",
  cs: "Čeština",
  bg: "Български",
  uk: "Українська",
  ca: "Català",
  hr: "Hrvatski",
  sk: "Slovenčina",
  sl: "Slovenščina",
  sr: "Српски",
  lt: "Lietuvių",
  lv: "Latviešu",
  et: "Eesti",
  ms: "Bahasa Melayu",
  tl: "Tagalog",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  mr: "मराठी",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  pa: "ਪੰਜਾਬੀ",
};

type LanguagePickerProps = {
  value: string;
  onChange: (locale: string) => void;
};

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  const handleChange = (newLocale: string) => {
    document.cookie = `lang=${encodeURIComponent(newLocale)};path=/;max-age=31536000;SameSite=Lax`;
    onChange(newLocale);
    track("Change Language", { lang: newLocale });
  };

  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel id="language-picker-label">Language</InputLabel>
      <Select
        labelId="language-picker-label"
        label="Language"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onOpen={() => track("Open Language Picker")}
      >
        {SUPPORTED_LOCALES.map((code) => (
          <MenuItem key={code} value={code}>
            {NATIVE_NAMES[code] ?? code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
