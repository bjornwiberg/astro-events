"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { SUPPORTED_LOCALES } from "../../../lib/i18n";
import { track } from "../../../utils/mixpanel";

const FLAGS: Record<string, string> = {
  en: "🇬🇧",
  ar: "🇸🇦",
  de: "🇩🇪",
  es: "🇪🇸",
  fr: "🇫🇷",
  he: "🇮🇱",
  hi: "🇮🇳",
  it: "🇮🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  pt: "🇵🇹",
  ru: "🇷🇺",
  zh: "🇨🇳",
  fa: "🇮🇷",
  ur: "🇵🇰",
  nl: "🇳🇱",
  pl: "🇵🇱",
  tr: "🇹🇷",
  vi: "🇻🇳",
  th: "🇹🇭",
  id: "🇮🇩",
  sv: "🇸🇪",
  da: "🇩🇰",
  no: "🇳🇴",
  fi: "🇫🇮",
  el: "🇬🇷",
  ro: "🇷🇴",
  hu: "🇭🇺",
  cs: "🇨🇿",
  bg: "🇧🇬",
  uk: "🇺🇦",
  ca: "🇪🇸",
  hr: "🇭🇷",
  sk: "🇸🇰",
  sl: "🇸🇮",
  sr: "🇷🇸",
  lt: "🇱🇹",
  lv: "🇱🇻",
  et: "🇪🇪",
  ms: "🇲🇾",
  tl: "🇵🇭",
  bn: "🇧🇩",
  ta: "🇮🇳",
  te: "🇮🇳",
  mr: "🇮🇳",
  gu: "🇮🇳",
  kn: "🇮🇳",
  ml: "🇮🇳",
  pa: "🇮🇳",
};

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
  variant?: "default" | "appbar";
};

export function LanguagePicker({ value, onChange, variant = "default" }: LanguagePickerProps) {
  const handleChange = (newLocale: string) => {
    // biome-ignore lint/suspicious/noDocumentCookie: cookie is set in the browser
    document.cookie = `lang=${encodeURIComponent(newLocale)};path=/;max-age=31536000;SameSite=Lax`;
    onChange(newLocale);
    track("Change Language", { lang: newLocale });
  };

  const isAppbar = variant === "appbar";

  return (
    <FormControl size="small" sx={{ minWidth: isAppbar ? 120 : 160 }}>
      {!isAppbar && <InputLabel id="language-picker-label">Language</InputLabel>}
      <Select
        labelId={isAppbar ? undefined : "language-picker-label"}
        label={isAppbar ? undefined : "Language"}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onOpen={() => track("Open Language Picker")}
        renderValue={(v) => (
          <>
            <span style={{ marginRight: 6 }}>{FLAGS[v] ?? "🌐"}</span>
            {NATIVE_NAMES[v] ?? v}
          </>
        )}
        sx={
          isAppbar
            ? {
                color: "#fff",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.6)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
                ".MuiSvgIcon-root": { color: "#fff" },
              }
            : undefined
        }
      >
        {SUPPORTED_LOCALES.map((code) => (
          <MenuItem key={code} value={code}>
            <span style={{ marginRight: 8 }}>{FLAGS[code] ?? "🌐"}</span>
            {NATIVE_NAMES[code] ?? code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
