import { cookies, headers } from "next/headers";
import type { GeoLocation } from "../../lib/calculator";
import { getCachedSubscriptionEvents } from "../../lib/calculator";
import { parseLocationCookie } from "../../lib/cookies";
import { getLocationFromIp } from "../../lib/geoip";
import {
  getPreferredLocale,
  I18N_HASH_COOKIE_NAME,
  translationHash,
} from "../../lib/i18n";
import { getEnglishSource, getTranslations } from "../../lib/translate";
import type { CalculatorEventType } from "../../types/calculatorEvent";
import IndexPage from "./components/IndexPage";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function V2Page(props: PageProps) {
  const cookieStore = await cookies();
  const h = await headers();
  const langCookie = cookieStore.get("lang")?.value ?? null;
  const forwardedFor = h.get("x-forwarded-for");
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3330";

  const location: GeoLocation =
    parseLocationCookie(cookieStore.get("location")?.value) ??
    (await getLocationFromIp(forwardedFor));

  const lang = getPreferredLocale(langCookie, h.get("accept-language"));

  const searchParams = await props.searchParams;
  const yearParam = searchParams.year;
  const monthParam = searchParams.month;
  const now = new Date();
  const currentYear = now.getFullYear();
  const subStartYear = currentYear - 1;
  const subEndYear = currentYear + 3;
  const year = yearParam ? parseInt(yearParam, 10) : currentYear;
  // URL uses month 1–12 (Jan–Dec); convert to 0–11 for internal use
  const monthFromUrl = monthParam != null ? parseInt(monthParam, 10) : now.getMonth() + 1;
  const safeYear =
    Number.isInteger(year) && year >= subStartYear && year <= subEndYear ? year : currentYear;
  const safeMonth =
    Number.isInteger(monthFromUrl) && monthFromUrl >= 1 && monthFromUrl <= 12
      ? monthFromUrl - 1
      : now.getMonth();

  let events: CalculatorEventType[] = [];
  let fetchError = false;
  try {
    events = await getCachedSubscriptionEvents(location.lng, location.lat);
  } catch {
    fetchError = true;
  }

  const enSource = getEnglishSource();
  const sourceHash = translationHash(enSource);
  const clientI18nHash = cookieStore.get(I18N_HASH_COOKIE_NAME)?.value ?? null;

  const translations = await getTranslations(lang);

  return (
    <IndexPage
      events={events}
      location={location}
      year={safeYear}
      month={safeMonth}
      lang={lang}
      translations={translations}
      sourceHash={sourceHash}
      clientI18nHash={clientI18nHash}
      baseUrl={`${protocol}://${host}`}
      fetchError={fetchError}
    />
  );
}
