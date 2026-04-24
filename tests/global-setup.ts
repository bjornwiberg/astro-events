import type { FullConfig } from "@playwright/test";
import { startMockCalculator } from "./mock-calculator";

const MOCK_PORT = Number.parseInt(process.env.MOCK_CALCULATOR_PORT ?? "3333", 10);

/**
 * Boots the mock calculator API before Playwright starts the Next.js dev
 * server. The dev server reads CALCULATOR_API_URL at startup, so the mock
 * must be listening before `next dev` comes up.
 *
 * Returns a teardown fn; Playwright's global-teardown imports it.
 */
async function globalSetup(_config: FullConfig): Promise<() => Promise<void>> {
  const server = await startMockCalculator(MOCK_PORT);
  // Store a reference so globalTeardown can close it
  (globalThis as unknown as { __mockCalculator?: typeof server }).__mockCalculator = server;
  return async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  };
}

export default globalSetup;
