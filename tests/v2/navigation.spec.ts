import { expect, test } from "@playwright/test";
import {
  mockV2ClientEndpoints,
  seedLocationCookie,
  seedSeenTours,
} from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];

test.describe("month navigation", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);
  });

  test("prev/next buttons update the URL and rendered month label", async ({ page }) => {
    // Use a year safely far from "now" so navigating doesn't accidentally
    // land on the current month — Navigation.tsx strips ?year/&month from
    // the URL when the target IS the current month, which would make the
    // toHaveURL assertion fail in May 2030.
    await page.goto("/v2?year=2030&month=6");

    await expect(page.getByText(/June 2030/i)).toBeVisible();

    await page.getByRole("button", { name: "Next month" }).click();
    await expect(page).toHaveURL(/year=2030&month=7/);
    await expect(page.getByText(/July 2030/i)).toBeVisible();

    await page.getByRole("button", { name: "Previous month" }).click();
    await page.getByRole("button", { name: "Previous month" }).click();
    await expect(page).toHaveURL(/year=2030&month=5/);
    await expect(page.getByText(/May 2030/i)).toBeVisible();
  });

  test("today button jumps back to the current month and drops URL params", async ({ page }) => {
    await page.goto("/v2?year=2020&month=1");
    await page.getByRole("button", { name: /Today/i }).click();
    await expect(page).toHaveURL(/\/v2$/);
  });
});
