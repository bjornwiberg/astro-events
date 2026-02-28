export type Translations = Record<string, string | Record<string, string>>;

const SUPPORTED_LANGUAGES = [
  "en",
  "ar",
  "de",
  "es",
  "fr",
  "he",
  "hi",
  "it",
  "ja",
  "ko",
  "pt",
  "ru",
  "zh",
  "fa",
  "ur",
  "nl",
  "pl",
  "tr",
  "vi",
  "th",
  "id",
  "sv",
  "da",
  "no",
  "fi",
  "el",
  "ro",
  "hu",
  "cs",
  "bg",
  "uk",
  "ca",
  "hr",
  "sk",
  "sl",
  "sr",
  "lt",
  "lv",
  "et",
  "ms",
  "tl",
  "bn",
  "ta",
  "te",
  "mr",
  "gu",
  "kn",
  "ml",
  "pa",
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number];

export const SUPPORTED_LOCALES: readonly string[] = SUPPORTED_LANGUAGES;

/** Simple hash for cache key (djb2). */
export function translationHash(obj: Translations): string {
  const s = JSON.stringify(obj);
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

/** localStorage key for translated JSON (per lang). Hash is in cookie for invalidation. */
export function translationCacheKey(lang: string): string {
  return `v2:i18n:${lang}`;
}

/** Cookie name for the source (en.json) hash so the server can check if client cache is still valid. */
export const I18N_HASH_COOKIE_NAME = "v2_i18n_hash";

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(locale);
}

/** RTL locales (ar, he, fa, ur). */
export const RTL_LOCALES = new Set<string>(["ar", "he", "fa", "ur"]);

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

/** Resolve locale from lang cookie or Accept-Language header. */
export function getPreferredLocale(
  langCookie: string | null | undefined,
  acceptLanguage: string | null | undefined,
): string {
  if (langCookie && isSupportedLocale(langCookie)) return langCookie;
  if (!acceptLanguage) return "en";
  const first = acceptLanguage.split(",")[0]?.trim();
  if (!first) return "en";
  const code = first.split(";")[0]?.trim().slice(0, 2).toLowerCase();
  return code && isSupportedLocale(code) ? code : "en";
}
