import { type NextRequest, NextResponse } from "next/server";
import { corsHeaders, validateOrigin } from "../../../../lib/cors";
import {
  translationHash,
  isSupportedLocale,
  type Translations,
} from "../../../../lib/i18n";
import en from "../../../../locales/en.json";

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
    const matches: string[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(placeholderRe.source, "g");
    while ((m = re.exec(s)) !== null) matches.push(m[0]);
    return matches;
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

export async function GET(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders(req) });
  }

  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";
  if (!isSupportedLocale(lang)) {
    return NextResponse.json(
      { error: "Unsupported language" },
      { status: 400, headers: corsHeaders(req) },
    );
  }

  const source = en as unknown as Record<string, unknown>;
  const sourceHash = translationHash(source as Translations);

  if (lang === "en") {
    return NextResponse.json(
      { translations: source, hash: sourceHash },
      {
        status: 200,
        headers: {
          ...corsHeaders(req),
          "Content-Type": "application/json",
          "Cache-Control": `private, max-age=86400, s-maxage=86400, stale-while-revalidate=86400`,
        },
      },
    );
  }

  try {
    const entries = flatten(source);
    const strings = entries.map((e) => e.value);
    const translated = await translateStrings(strings, lang);
    const translatedEntries = entries.map((e, i) => ({
      path: e.path,
      value: translated[i] ?? e.value,
    }));
    const translations = unflatten(translatedEntries);
    const hash = translationHash(translations);

    return NextResponse.json(
      { translations, hash },
      {
        status: 200,
        headers: {
          ...corsHeaders(req),
          "Content-Type": "application/json",
          "Cache-Control": `private, max-age=86400, s-maxage=86400, stale-while-revalidate=86400`,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation error";
    return NextResponse.json(
      { error: message },
      { status: 502, headers: corsHeaders(req) },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
