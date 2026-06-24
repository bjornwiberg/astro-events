import { expect, test } from "@playwright/test";
import { mockV2ClientEndpoints, seedLocationCookie, seedSeenTours } from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];

test.describe("Maha Shivaratri occasion (calculator API id 'msr')", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);
  });

  // The mock calculator emits a "msr" mphase item in February (see
  // tests/mock-calculator.ts). It must map to its own occasion and render with
  // the proper-name title "Maha Shivaratri" — not as a plain "Shivaratri".
  test("renders Maha Shivaratri as its own occasion", async ({ page }) => {
    // Far-from-now year so the month label / URL params behave deterministically.
    await page.goto("/v2?year=2030&month=2");

    await expect(page.getByText(/February 2030/i)).toBeVisible();
    await expect(page.getByText(/Maha Shivaratri/).first()).toBeVisible();
  });
});
