/**
 * app/api/auth/logout/route.ts
 * Instant logout — deletes the JWT session cookie and redirects to /login.
 * Bypasses the next-auth/react signOut() ceremony (two server round-trips)
 * since JWT sessions have no server-side state to clean up.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET(req: Request) {
  const url = new URL("/login", req.url);
  const res = NextResponse.redirect(url);
  // Delete both cookie name variants (http vs https environments)
  res.cookies.delete("authjs.session-token");
  res.cookies.delete("__Secure-authjs.session-token");
  return res;
}
