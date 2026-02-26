import { cookies, headers } from "next/headers";
import type { CalculatorEventType } from "../../types/calculatorEvent";
import type { GeoLocation } from "../../lib/calculator";
import { fetchCalculatorEvents } from "../../lib/calculator";
import { getLocationFromIp } from "../../lib/geoip";
import { isSupportedLocale } from "../../lib/i18n";
import type { Translations } from "../../lib/i18n";
import IndexPage from "./components/IndexPage";

const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

function parseLocationCookie(cookieValue: string | undefined): GeoLocation | null {
  if (!cookieValue) return null;
  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded) as {
      lng?: number;
      lat?: number;
      city?: string;
      timezone?: string;
    };
    if (
      typeof parsed.lng === "number" &&
      typeof parsed.lat === "number" &&
      Number.isFinite(parsed.lng) &&
      Number.isFinite(parsed.lat)
    ) {
      return {
        lng: parsed.lng,
        lat: parsed.lat,
        city: parsed.city,
        timezone: parsed.timezone,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function parseAcceptLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return "en";
  const first = acceptLanguage.split(",")[0]?.trim();
  if (!first) return "en";
  const code = first.split(";")[0]?.trim().slice(0, 2).toLowerCase();
  return code && isSupportedLocale(code) ? code : "en";
}

async function loadTranslations(
  lang: string,
  host: string,
): Promise<Translations> {
  if (lang === "en") {
    const en = (await import("../../locales/en.json")).default;
    return en as Translations;
  }
  const url = `${protocol}://${host}/api/v2/translations?lang=${encodeURIComponent(lang)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return (await import("../../locales/en.json")).default as Translations;
  const data = (await res.json()) as { translations?: Translations };
  return data.translations ?? ((await import("../../locales/en.json")).default as Translations);
}

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function V2Page(props: PageProps) {
  const cookieStore = await cookies();
  const h = await headers();
  const langCookie = cookieStore.get("lang")?.value ?? null;
  const forwardedFor = h.get("x-forwarded-for");
  const host = h.get("host") ?? "localhost:3000";

  const location: GeoLocation =
    parseLocationCookie(cookieStore.get("location")?.value) ?? (await getLocationFromIp(forwardedFor));

  const lang = langCookie && isSupportedLocale(langCookie)
    ? langCookie
    : parseAcceptLanguage(h.get("accept-language"));

  const searchParams = await props.searchParams;
  const yearParam = searchParams.year;
  const monthParam = searchParams.month;
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
  const month = monthParam != null ? parseInt(monthParam, 10) : new Date().getMonth();
  const safeYear = Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : new Date().getFullYear();
  const safeMonth = month >= 0 && month <= 11 ? month : new Date().getMonth();

  let events: CalculatorEventType[] = [];
  try {
    events = await fetchCalculatorEvents(safeYear, location.lng, location.lat);
  } catch {
    // pass empty; client can show error
  }

  const translations = await loadTranslations(lang, host);

  return (
    <IndexPage
      events={events}
      location={location}
      year={safeYear}
      month={safeMonth}
      lang={lang}
      translations={translations}
    />
  );
}
