import type { BrowserContext, Page } from "@playwright/test";

export const DEFAULT_LOCATION = {
  lng: 13.0007,
  lat: 55.6053,
  city: "Malmö",
  timezone: "Europe/Stockholm",
};

/**
 * Seed the `location` cookie so v2 renders without hitting the IP lookup.
 * Must run before the first navigation so SSR picks it up.
 */
export async function seedLocationCookie(
  context: BrowserContext,
  location = DEFAULT_LOCATION,
  origin = "http://127.0.0.1:3457"
): Promise<void> {
  const url = new URL(origin);
  await context.addCookies([
    {
      name: "location",
      value: encodeURIComponent(JSON.stringify(location)),
      domain: url.hostname,
      path: "/",
      expires: Math.floor(Date.now() / 1000) + 365 * 24 * 3600,
      sameSite: "Lax",
    },
  ]);
}

export type SeenMap = Record<string, string[]>;

/**
 * Write `v2:tours:seen` localStorage before the first navigation. Playwright
 * evaluates `addInitScript` on every new document, so this runs pre-hydration.
 */
export async function seedSeenTours(context: BrowserContext, seen: SeenMap): Promise<void> {
  await context.addInitScript((payload) => {
    window.localStorage.setItem("v2:tours:seen", JSON.stringify(payload));
  }, seen);
}

/**
 * Write the legacy `v2:tour:seen = "1"` so we can verify migration.
 */
export async function seedLegacyTourFlag(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    window.localStorage.setItem("v2:tour:seen", "1");
  });
}

/**
 * Mock the client-side v2 API endpoints via route handlers. Call before the
 * first navigation.
 */
export async function mockV2ClientEndpoints(page: Page): Promise<void> {
  await page.route("**/api/v2/geocode**", async (route) => {
    const url = new URL(route.request().url());
    const action = url.searchParams.get("action");
    if (action === "search") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            display_name: "Stockholm, Sweden",
            lat: "59.3293",
            lon: "18.0686",
            address: { city: "Stockholm", country: "Sweden" },
          },
        ]),
      });
      return;
    }
    if (action === "reverse") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          display_name: "Stockholm, Sweden",
          address: { city: "Stockholm", country: "Sweden" },
          timezone: "Europe/Stockholm",
        }),
      });
      return;
    }
    await route.fulfill({ status: 400, body: "{}" });
  });

  // Translations endpoint — return English source for any lang to keep
  // assertions deterministic. The actual translate pipeline is a server
  // concern and is out of scope for UI e2e.
  await page.route("**/api/v2/translations**", async (route) => {
    await route.continue();
  });
}

export async function readSeen(page: Page): Promise<SeenMap> {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("v2:tours:seen");
    if (!raw) return {} as Record<string, string[]>;
    try {
      return JSON.parse(raw) as Record<string, string[]>;
    } catch {
      return {} as Record<string, string[]>;
    }
  });
}

export async function waitForTourPopover(page: Page): Promise<void> {
  await page.locator(".driver-popover.v2-tour-popover").waitFor({ state: "visible" });
}

export async function tourTitle(page: Page): Promise<string> {
  return (await page
    .locator(".driver-popover.v2-tour-popover .driver-popover-title")
    .first()
    .textContent()) ?? "";
}
