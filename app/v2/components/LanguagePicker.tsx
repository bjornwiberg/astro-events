"use client";

import type { HTMLAttributes } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { SUPPORTED_LOCALES } from "../../../lib/i18n";
import { track } from "../../../utils/mixpanel";
import { useAppContext } from "./AppProvider";

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

function filterLanguageOptions(
  options: string[],
  state: { inputValue: string },
): string[] {
  const q = state.inputValue.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (code) =>
      code.toLowerCase().includes(q) ||
      (NATIVE_NAMES[code] ?? "").toLowerCase().includes(q),
  );
}

export function LanguagePicker({ value, onChange, variant = "default" }: LanguagePickerProps) {
  const { t } = useAppContext();

  const handleChange = (_: unknown, newLocale: string | null) => {
    if (!newLocale) return;
    // biome-ignore lint/suspicious/noDocumentCookie: cookie is set in the browser
    document.cookie = `lang=${encodeURIComponent(newLocale)};path=/;max-age=31536000;SameSite=Lax`;
    onChange(newLocale);
    track("Change Language", { lang: newLocale });
  };

  const isAppbar = variant === "appbar";

  return (
    <Autocomplete
      id="v2-language-picker"
      size="small"
      value={value}
      onChange={handleChange}
      onOpen={() => track("Open Language Picker")}
      options={SUPPORTED_LOCALES}
      filterOptions={filterLanguageOptions}
      getOptionLabel={(code) => `${FLAGS[code] ?? "🌐"} ${NATIVE_NAMES[code] ?? code}`}
      noOptionsText={t("language.noResults")}
      isOptionEqualToValue={(opt, v) => opt === v}
      sx={{
        minWidth: isAppbar ? 180 : 260,
        ...(isAppbar
          ? {
              color: "#fff",
              ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.6)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#fff" },
              ".MuiSvgIcon-root": { color: "#fff" },
              "& .MuiInputBase-input": { color: "#fff" },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.7)" },
            }
          : {}),
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={isAppbar ? undefined : t("language.label")}
          placeholder={t("language.searchPlaceholder")}
        />
      )}
      renderOption={(props, code) => {
        const { key: _key, ...rest } = props as HTMLAttributes<HTMLLIElement> & { key?: string };
        return (
          <li key={code} {...rest}>
            <span style={{ marginInlineEnd: 8 }}>{FLAGS[code] ?? "🌐"}</span>
            {NATIVE_NAMES[code] ?? code}
          </li>
        );
      }}
    />
  );
}
