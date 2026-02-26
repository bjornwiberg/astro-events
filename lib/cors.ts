/**
 * Validates that the request Origin matches the app's own host.
 * Used by /api/v2/* routes to prevent external abuse.
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Returns CORS headers with Allow-Origin set to the request's origin
 * only when it matches our host. Call after validateOrigin.
 */
export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const allowed =
    origin &&
    host &&
    (() => {
      try {
        return new URL(origin).host === host;
      } catch {
        return false;
      }
    })();
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
