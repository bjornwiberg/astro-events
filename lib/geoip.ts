import type { GeoLocation } from "./calculator";

const IP_API_BASE = "http://ip-api.com/json";
const DEFAULT_LOCATION: GeoLocation = {
  lng: 13.0007,
  lat: 55.6053,
  city: "Malmö",
  timezone: "Europe/Stockholm",
};

type IpApiResponse = {
  status: "success" | "fail";
  lat?: number;
  lon?: number;
  city?: string;
  timezone?: string;
  message?: string;
};

export async function getLocationFromIp(
  forwardedFor?: string | null,
): Promise<GeoLocation> {
  const ip = forwardedFor?.split(",")[0]?.trim() || undefined;
  if (!ip || ip === "127.0.0.1" || ip === "::1") {
    return DEFAULT_LOCATION;
  }

  try {
    const res = await fetch(
      `${IP_API_BASE}/${encodeURIComponent(ip)}?fields=status,lat,lon,city,timezone`,
      {
        next: { revalidate: 3600 },
      },
    );
    const data = (await res.json()) as IpApiResponse;
    if (data.status !== "success" || data.lat == null || data.lon == null) {
      return DEFAULT_LOCATION;
    }
    return {
      lng: data.lon,
      lat: data.lat,
      city: data.city,
      timezone: data.timezone || "UTC",
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

export { DEFAULT_LOCATION };
