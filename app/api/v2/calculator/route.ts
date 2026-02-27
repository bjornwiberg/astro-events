import { type NextRequest, NextResponse } from "next/server";
import { corsHeaders, validateOrigin } from "../../../../lib/cors";
import { fetchCalculatorEvents } from "../../../../lib/calculator";
import { getCookieValue, parseLocationCookie } from "../../../../lib/cookies";

export async function GET(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders(req) });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  if (!Number.isInteger(year)) {
    return NextResponse.json(
      { error: "Invalid year" },
      { status: 400, headers: corsHeaders(req) },
    );
  }

  const location = parseLocationCookie(
    getCookieValue(req.headers.get("cookie"), "location"),
  );
  const lng = location?.lng;
  const lat = location?.lat;

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
