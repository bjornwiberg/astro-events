import type { Server } from "node:http";

async function globalTeardown(): Promise<void> {
  const server = (globalThis as unknown as { __mockCalculator?: Server }).__mockCalculator;
  if (!server) return;
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

export default globalTeardown;
