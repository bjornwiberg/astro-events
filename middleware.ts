import { type NextRequest, NextResponse } from "next/server";

/** Pass pathname to layout so root layout can render v2 theme/body class on the server. */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}
