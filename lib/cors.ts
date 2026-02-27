/**
 * Validates that the request Origin matches the app's own host, or that
 * Origin is missing (same-origin fetches sometimes omit Origin).
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!host) return false;
  if (!origin) return true; // same-origin request, no Origin header
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
    host &&
    (!origin ||
      (() => {
        try {
          return new URL(origin).host === host;
        } catch {
          return false;
        }
      })());
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
