import { type NextRequest, NextResponse } from "next/server";
import { corsHeaders, validateOrigin } from "../../../../lib/cors";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "AstroEvents";

export async function GET(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: corsHeaders(req) });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "search") {
    const q = searchParams.get("q");
    if (!q || !q.trim()) {
      return NextResponse.json(
        { error: "Missing q for search" },
        { status: 400, headers: corsHeaders(req) },
      );
    }
    const url = new URL(`${NOMINATIM_BASE}/search`);
    url.searchParams.set("q", q.trim());
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "10");

    try {
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.status}`);
      }
      const data = await res.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Geocode error";
      return NextResponse.json(
        { error: message },
        { status: 502, headers: corsHeaders(req) },
      );
    }
  }

  if (action === "reverse") {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (lat == null || lon == null || lat === "" || lon === "") {
      return NextResponse.json(
        { error: "Missing lat/lon for reverse" },
        { status: 400, headers: corsHeaders(req) },
      );
    }
    const url = new URL(`${NOMINATIM_BASE}/reverse`);
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");

    try {
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 3600 },
      });
      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.status}`);
      }
      const data = await res.json();
      return NextResponse.json(data, {
        status: 200,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Geocode error";
      return NextResponse.json(
        { error: message },
        { status: 502, headers: corsHeaders(req) },
      );
    }
  }

  return NextResponse.json(
    { error: "Invalid action: use action=search or action=reverse" },
    { status: 400, headers: corsHeaders(req) },
  );
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
