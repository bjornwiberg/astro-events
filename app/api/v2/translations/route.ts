import { type NextRequest, NextResponse } from "next/server";
import { corsHeaders, validateOrigin } from "../../../../lib/cors";
import {
  translationHash,
  isSupportedLocale,
} from "../../../../lib/i18n";
import { getEnglishSource, getTranslations } from "../../../../lib/translate";

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

  try {
    const translations = await getTranslations(lang);
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
    const source = getEnglishSource();
    const sourceHash = translationHash(source);
    const message = err instanceof Error ? err.message : "Translation error";
    return NextResponse.json(
      { translations: source, hash: sourceHash, error: message },
      { status: 200, headers: { ...corsHeaders(req), "Content-Type": "application/json" } },
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
