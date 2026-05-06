import { expect, test } from "@playwright/test";
import {
  mockV2ClientEndpoints,
  readSeen,
  seedLegacyTourFlag,
  seedLocationCookie,
  seedSeenTours,
  tourTitle,
  waitForTourPopover,
} from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];

test.describe("intro tour", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);
  });

  test("auto-runs on first visit and marks all steps seen on completion", async ({ page }) => {
    await page.goto("/v2");
    await waitForTourPopover(page);

    expect(await tourTitle(page)).toContain("Welcome to Astro Events");

    for (let i = 0; i < INTRO_STEPS.length - 1; i++) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
    await page.getByRole("button", { name: "Got it" }).click();

    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);

    const seen = await readSeen(page);
    expect(seen.intro).toEqual(INTRO_STEPS);
  });

  test("does not re-run on reload once all steps are seen", async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await page.goto("/v2");
    // Wait past the 600ms autostart timer so we're sure it didn't fire.
    await page.waitForTimeout(900);
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);
  });

  test("footer ? icon replays the tour regardless of seen state", async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await page.goto("/v2");
    await page.waitForTimeout(700); // confirm no auto-run first
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);

    await page.getByRole("button", { name: "Replay app tour" }).click();
    await waitForTourPopover(page);
    expect(await tourTitle(page)).toContain("Welcome to Astro Events");
  });

  test("closing mid-tour marks all current step ids so the auto-tour does not re-fire", async ({
    page,
  }) => {
    // This was a real production bug: closing on step 1 only marked step 1
    // as seen, so on the next page load the runner saw 6 unseen steps and
    // auto-started again. Mixpanel showed users hitting Tour Start three
    // times in 30 seconds. Closing must signal "I'm done with this tour"
    // — autostart should not re-nag. Replay via the footer ? still works.
    await page.goto("/v2");
    await waitForTourPopover(page);

    // Close immediately on step 1 (welcome).
    await page.locator(".driver-popover-close-btn").click();
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);

    const seen = await readSeen(page);
    expect(new Set(seen.intro)).toEqual(new Set(INTRO_STEPS));

    // Reload — autostart must NOT fire because everything is marked seen.
    await page.reload();
    await page.waitForTimeout(900);
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);
  });

  test("clicking the backdrop does not close the tour", async ({ page }) => {
    await page.goto("/v2");
    await waitForTourPopover(page);

    const overlay = page.locator(".driver-overlay").first();
    await overlay.click({ position: { x: 5, y: 5 }, force: true });

    // Popover must still be visible.
    await expect(page.locator(".driver-popover.v2-tour-popover")).toBeVisible();
  });

  test("migrates legacy v2:tour:seen flag and skips the intro", async ({ context, page }) => {
    await seedLegacyTourFlag(context);
    await page.goto("/v2");
    await page.waitForTimeout(900);

    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);

    const seen = await readSeen(page);
    expect(seen.intro).toEqual(INTRO_STEPS);
    const legacy = await page.evaluate(() => window.localStorage.getItem("v2:tour:seen"));
    expect(legacy).toBeNull();
  });

  test("replay via footer ? after partial completion still shows all steps", async ({
    context,
    page,
  }) => {
    await seedSeenTours(context, { intro: ["welcome", "theme"] });
    await page.goto("/v2");
    await waitForTourPopover(page);

    // Partial (non-replay) run should start from the first unseen step.
    expect(await tourTitle(page)).not.toContain("Welcome to Astro Events");
    await page.locator(".driver-popover-close-btn").click();
    await expect(page.locator(".driver-popover.v2-tour-popover")).toHaveCount(0);

    await page.getByRole("button", { name: "Replay app tour" }).click();
    await waitForTourPopover(page);
    expect(await tourTitle(page)).toContain("Welcome to Astro Events");
  });
});
