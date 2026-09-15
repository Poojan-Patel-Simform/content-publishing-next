import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account"];
const AUTH_ONLY_PREFIXES = ["/login", "/register"];

/**
 * Presence-based only: we can't verify the cp_at JWT signature here without
 * the signing secret. A stale cp_at with a dead cp_rt still passes this check
 * and is caught later client-side by the /me -> refresh-fail -> redirect path.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(
    request.cookies.get("cp_at") || request.cookies.get("cp_rt")
  );

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/login", "/register"],
};
