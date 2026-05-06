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
  // One full moon + one new moon for every month so the v2 page always
  // renders the events grid regardless of which month "today" lands in
  // — without that, the intro tour's `events` step gets filtered out
  // (no [data-tour="events"] anchor), the tour shrinks by one step, and
  // any test that loops INTRO_STEPS.length - 1 times mis-counts.
  const items: CalculatorItem[] = [];
  for (let month = 1; month <= 12; month++) {
    const mm = String(month).padStart(2, "0");
    items.push({ type: "mphase", id: "fm", time: `${year}-${mm}-12T02:22:00Z`, pos: 0 });
    items.push({ type: "mphase", id: "nm", time: `${year}-${mm}-26T17:31:00Z`, pos: 0 });
  }
  // Plus a couple of seasonal markers + an eclipse for variety.
  items.push({ type: "simple", id: "ae", time: `${year}-03-20T04:45:00Z` });
  items.push({ type: "simple", id: "ss", time: `${year}-06-21T02:11:00Z` });
  items.push({ type: "eclipse", id: "se", planet: "sun", time: `${year}-08-12T10:43:00Z`, pos: 0 });
  return items;
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
