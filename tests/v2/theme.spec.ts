import { expect, test } from "@playwright/test";
import {
  mockV2ClientEndpoints,
  seedLocationCookie,
  seedSeenTours,
} from "./helpers";

const INTRO_STEPS = ["welcome", "theme", "language", "calendar", "location", "navigation", "events"];

test.describe("theme toggle", () => {
  test.beforeEach(async ({ context, page }) => {
    await seedSeenTours(context, { intro: INTRO_STEPS });
    await seedLocationCookie(context);
    await mockV2ClientEndpoints(page);
  });

  test("toggles between dark and light and persists the choice", async ({ page }) => {
    await page.goto("/v2");

    const initialTheme = await page.locator("html").getAttribute("data-theme");
    expect(initialTheme === "light" || initialTheme === "dark").toBe(true);

    const toggle = page.getByRole("button", { name: "Toggle dark mode" });
    await toggle.click();
    const afterClick = await page.locator("html").getAttribute("data-theme");
    expect(afterClick).not.toBe(initialTheme);

    await page.reload();
    const afterReload = await page.locator("html").getAttribute("data-theme");
    expect(afterReload).toBe(afterClick);
  });
});
