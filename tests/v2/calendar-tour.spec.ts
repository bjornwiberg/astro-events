import { expect, test } from "@playwright/test";
import {
  mockV2ClientEndpoints,
  readSeen,
  seedLocationCookie,
  seedSeenTours,
  waitForTourPopover,
} from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];
const CALENDAR_STEPS = ["welcome", "url", "copy"];

test.describe("calendar dialog tour", () => {
  test.beforeEach(async ({ context, page }) => {
    // Intro already seen so it doesn't interfere with the dialog tour.
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);
  });

  test("triggers on first dialog open and marks all steps seen on completion", async ({ page }) => {
    await page.goto("/v2");
    await page.waitForTimeout(700); // ensure intro did NOT auto-run

    await page.getByRole("button", { name: "Subscribe to calendar" }).click();

    await waitForTourPopover(page);
    // Step through all 3 steps
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await page.getByRole("button", { name: "Got it" }).click();

    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);
    const seen = await readSeen(page);
    expect(seen["calendar-dialog"]).toEqual(CALENDAR_STEPS);
  });

  test("does not re-trigger on subsequent dialog opens", async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS, "calendar-dialog": CALENDAR_STEPS });
    await page.goto("/v2");
    await page.getByRole("button", { name: "Subscribe to calendar" }).click();

    // Dialog is open but tour should not auto-run.
    await page.waitForTimeout(700);
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);
  });

  test("in-dialog ? icon replays the full tour", async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS, "calendar-dialog": CALENDAR_STEPS });
    await page.goto("/v2");
    await page.getByRole("button", { name: "Subscribe to calendar" }).click();
    await page.waitForTimeout(500); // no auto-run

    await page.getByRole("button", { name: "Replay this tour" }).click();
    await waitForTourPopover(page);
    // Full replay starts on the welcome step.
    const title = await page
      .locator(".driver-popover.v2-tour-popover .driver-popover-title")
      .first()
      .textContent();
    expect(title).toContain("Subscribe to your calendar");
  });

  test("partial replay: only new steps appear for users who saw an older version", async ({
    context,
    page,
  }) => {
    // User saw welcome+url before; new `copy` step is the only unseen.
    await seedSeenTours(context, {
      intro: INTRO_STEPS,
      "calendar-dialog": ["welcome", "url"],
    });
    await page.goto("/v2");
    await page.getByRole("button", { name: "Subscribe to calendar" }).click();
    await waitForTourPopover(page);

    // Only one step to show → the "Got it" button ends it.
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);

    const seen = await readSeen(page);
    expect(new Set(seen["calendar-dialog"])).toEqual(new Set(CALENDAR_STEPS));
  });
});
