import { expect, test } from "@playwright/test";
import { mockV2ClientEndpoints, seedLocationCookie, seedSeenTours } from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];

test.describe("location search", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);

    // Override geocode so the resolved display_name does NOT substring-match the
    // typed query (localized name + diacritics) — e.g. "bucharest" → "București".
    await page.route("**/api/v2/geocode**", async (route) => {
      const url = new URL(route.request().url());
      const action = url.searchParams.get("action");
      if (action === "search") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              display_name: "București, România",
              lat: "44.4361",
              lon: "26.1027",
              address: { city: "București", country: "România" },
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
            display_name: "București, România",
            address: { city: "București", country: "România" },
            timezone: "Europe/Bucharest",
          }),
        });
        return;
      }
      await route.fulfill({ status: 400, body: "{}" });
    });
  });

  test("shows a result even when its localized name does not match the typed query", async ({
    page,
  }) => {
    await page.goto("/v2");

    const input = page.locator("#v2-location-selector");
    await input.click();
    await input.press("ControlOrMeta+a");
    await input.press("Backspace");
    await input.focus();
    // Single input event — avoids the controlled-input char-drop race that
    // per-character typing hits with React-controlled MUI inputs.
    await page.keyboard.insertText("bucharest");

    // Before the fix, MUI's default filterOptions removes "București, România"
    // because it doesn't contain the substring "bucharest" → empty dropdown.
    const option = page.getByRole("option", { name: /Bucure/i });
    await expect(option).toBeVisible();

    await option.click();
    // After selecting, the input reflects the resolved place, not the raw query.
    await expect(input).toHaveValue(/Bucure/i);
  });
});
