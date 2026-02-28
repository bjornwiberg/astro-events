import type { Translations } from "./i18n";
import en from "../locales/en.json";

function flatten(
  obj: Record<string, unknown>,
  prefix = "",
): { path: string; value: string }[] {
  const out: { path: string; value: string }[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      out.push({ path, value: v });
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...flatten(v as Record<string, unknown>, path));
    }
  }
  return out;
}

function unflatten(entries: { path: string; value: string }[]): Translations {
  const out: Translations = {};
  for (const { path, value } of entries) {
    const parts = path.split(".");
    let current: Record<string, unknown> = out as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!(p in current)) (current as Record<string, unknown>)[p] = {};
      current = (current as Record<string, unknown>)[p] as Record<string, unknown>;
    }
    (current as Record<string, unknown>)[parts[parts.length - 1]] = value;
  }
  return out;
}

const LANG_CODE_MAP: Record<string, string> = {
  zh: "zh-Hans",
  no: "nb",
};

async function translateStrings(
  strings: string[],
  target: string,
): Promise<string[]> {
  const baseUrl = process.env.LIBRE_TRANSLATE_URL;
  const apiKey = process.env.LIBRE_TRANSLATE_API_KEY;
  if (!baseUrl) {
    return strings;
  }
  const mappedTarget = LANG_CODE_MAP[target] ?? target;
  const url = `${baseUrl.replace(/\/$/, "")}/translate`;
  const body: { q: string[]; source: string; target: string; api_key?: string } = {
    q: strings,
    source: "en",
    target: mappedTarget,
  };
  if (apiKey) body.api_key = apiKey;

  const placeholderRe = /\{\{(\w+)\}\}/g;
  const placeholders = strings.map((s) => {
    const re = new RegExp(placeholderRe.source, "g");
    return Array.from(s.matchAll(re), (m) => m[0]);
  });
  const hasPlaceholders = placeholders.some((p) => p.length > 0);
  const masked = strings.map((s, i) => {
    let out = s;
    placeholders[i].forEach((ph, j) => {
      out = out.replace(ph, `<var id="p${j}" />`);
    });
    return out;
  });

  body.q = masked;
  if (hasPlaceholders) (body as Record<string, unknown>).format = "html";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    throw new Error(`LibreTranslate error: ${res.status}`);
  }
  const data = (await res.json()) as { translatedText: string[] };
  const translated = data.translatedText || masked;
  return translated.map((s, i) => {
    let out = s;
    placeholders[i].forEach((ph, j) => {
      const re = new RegExp(`<var\\s+id=["']p${j}["']\\s*\\/?>(?:</var>)?`, "i");
      out = out.replace(re, ph);
    });
    return out;
  });
}

const CACHE_TTL = 24 * 60 * 60 * 1000;
const translationCache = new Map<string, { data: Translations; ts: number }>();

export function getEnglishSource(): Translations {
  return en as unknown as Translations;
}

/**
 * Get translations for a language. Uses an in-memory server-side cache
 * so LibreTranslate is only called once per language per server lifetime
 * (or once per TTL expiry). Falls back to English on error.
 */
export async function getTranslations(lang: string): Promise<Translations> {
  const source = en as unknown as Translations;
  if (lang === "en") return source;

  const cached = translationCache.get(lang);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const entries = flatten(source as unknown as Record<string, unknown>);
    const strings = entries.map((e) => e.value);
    const translated = await translateStrings(strings, lang);
    const translatedEntries = entries.map((e, i) => ({
      path: e.path,
      value: translated[i] ?? e.value,
    }));
    const translations = unflatten(translatedEntries);
    translationCache.set(lang, { data: translations, ts: Date.now() });
    return translations;
  } catch {
    return source;
  }
}
