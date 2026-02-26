import { type NextRequest, NextResponse } from "next/server";
import { corsHeaders, validateOrigin } from "../../../../lib/cors";
import { fetchCalculatorEvents } from "../../../../lib/calculator";

function parseLocationCookie(cookieHeader: string | null): {
  lng?: number;
  lat?: number;
} {
  if (!cookieHeader) return {};
  const match = cookieHeader.match(/location=([^;]+)/);
  if (!match) return {};
  try {
    const decoded = decodeURIComponent(match[1]);
    const parsed = JSON.parse(decoded) as { lng?: number; lat?: number };
    if (
      typeof parsed.lng === "number" &&
      typeof parsed.lat === "number" &&
      Number.isFinite(parsed.lng) &&
      Number.isFinite(parsed.lat)
    ) {
      return { lng: parsed.lng, lat: parsed.lat };
    }
  } catch {
    // ignore
  }
  return {};
}

export async function GET(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders(req) });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json(
      { error: "Invalid year" },
      { status: 400, headers: corsHeaders(req) },
    );
  }

  const { lng, lat } = parseLocationCookie(req.headers.get("cookie") ?? null);

  try {
    const events = await fetchCalculatorEvents(year, lng, lat);
    return NextResponse.json(events, {
      status: 200,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Calculator error";
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
