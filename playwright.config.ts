import { defineConfig, devices } from "@playwright/test";

// Dedicated port to avoid clashing with unrelated services that may be
// squatting on common dev ports (e.g. 3000).
const PORT = Number.parseInt(process.env.PORT ?? "3457", 10);
const MOCK_PORT = Number.parseInt(process.env.MOCK_CALCULATOR_PORT ?? "3333", 10);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/v2",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Cap local workers so the single next-start instance isn't starved.
  // CI already runs serially; the cap matters for local parallel runs
  // where 6 workers bombard the dev server with SSR during hydration
  // and race the Tour component's effect that attaches the start listener.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : [["list"]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  globalSetup: require.resolve("./tests/global-setup.ts"),
  globalTeardown: require.resolve("./tests/global-teardown.ts"),
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // We use `next start` (production) instead of `next dev` because Next 16
    // refuses to spawn a second dev instance for the same project, which
    // means the user can't have `yarn dev` open while tests run. Requires a
    // prior `next build` — the `test:e2e` npm script handles that.
    command: `next start --port ${PORT}`,
    url: `${BASE_URL}/v2`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      CALCULATOR_API_URL: `http://127.0.0.1:${MOCK_PORT}`,
      CALCULATOR_API_KEY: "test-key",
      NEXT_PUBLIC_MIXPANEL_TOKEN: "",
    },
  },
});
