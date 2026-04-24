import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

/**
 * Minimal HTTP server that stands in for the external calculator API during
 * Playwright runs. It answers any POST /… with a deterministic fixture so
 * the Next.js server route `app/api/v2/calculator/route.ts` gets predictable
 * data back regardless of the requested location or date range.
 */

type CalculatorItem =
  | { type: "mphase"; id: "fm" | "nm"; time: string; begtime?: string; endtime?: string; pos?: number }
  | { type: "eclipse"; id: "se" | "le"; planet: "sun" | "moo"; time: string; pos?: number }
  | { type: "simple"; id: "ss" | "ws" | "se" | "ae"; time: string };

function fixtureFor(year: number): CalculatorItem[] {
  return [
    // Full moon in Jan
    { type: "mphase", id: "fm", time: `${year}-01-14T04:27:00Z`, pos: 0 },
    // New moon in Jan
    { type: "mphase", id: "nm", time: `${year}-01-29T12:36:00Z`, pos: 0 },
    // Full moon in April (the "current" month for most tests)
    { type: "mphase", id: "fm", time: `${year}-04-12T02:22:00Z`, pos: 0 },
    // New moon in April
    { type: "mphase", id: "nm", time: `${year}-04-26T17:31:00Z`, pos: 0 },
    // Vernal equinox
    { type: "simple", id: "ae", time: `${year}-03-20T04:45:00Z` },
    // Summer solstice
    { type: "simple", id: "ss", time: `${year}-06-21T02:11:00Z` },
    // Solar eclipse
    { type: "eclipse", id: "se", planet: "sun", time: `${year}-08-12T10:43:00Z`, pos: 0 },
  ];
}

export function startMockCalculator(port: number): Promise<Server> {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const parsed = body ? (JSON.parse(body) as { tmb?: string; tmf?: string }) : {};
        const year = parsed.tmb ? parseInt(parsed.tmb.slice(0, 4), 10) : new Date().getFullYear();
        const payload = fixtureFor(Number.isFinite(year) ? year : new Date().getFullYear());
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "bad request" }));
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

// Allow running this file directly: `tsx tests/mock-calculator.ts`
if (require.main === module) {
  const port = Number.parseInt(process.env.MOCK_CALCULATOR_PORT ?? "3333", 10);
  startMockCalculator(port).then(() => {
    // eslint-disable-next-line no-console
    console.log(`[mock-calculator] listening on 127.0.0.1:${port}`);
  });
}
