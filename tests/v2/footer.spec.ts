import { expect, test } from "@playwright/test";
import {
  mockV2ClientEndpoints,
  seedLocationCookie,
  seedSeenTours,
  waitForTourPopover,
} from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];

test.describe("footer", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);
  });

  test("support link opens the info dialog", async ({ page }) => {
    await page.goto("/v2");

    await page.getByText(/Support this project/i).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/About Astro Events/i)).toBeVisible();
  });

  test("info dialog closes via the X button", async ({ page }) => {
    await page.goto("/v2");
    await page.getByText(/Support this project/i).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "close" }).click();
    await expect(dialog).toHaveCount(0);
  });

  test("? icon triggers the intro tour", async ({ page }) => {
    await page.goto("/v2");
    await page.getByRole("button", { name: "Replay app tour" }).click();
    await waitForTourPopover(page);
  });

  test("layout does not overflow horizontally on a mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/v2");

    // All header controls must be visible within the viewport — previously
    // the calendar icon was pushed off-screen because the language picker
    // refused to shrink.
    const calendarBtn = page.getByRole("button", { name: "Subscribe to calendar" });
    await expect(calendarBtn).toBeVisible();

    const box = await calendarBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x + box.width).toBeLessThanOrEqual(375);
    }

    // No horizontal scroll on <html>
    const hasHScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasHScroll).toBe(false);
  });
});
