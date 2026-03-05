/**
 * app/api/dev-signin/route.ts
 * DEV ONLY — instant sign-in without email verification.
 * Disabled in production. Never ships with real credentials.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email") ?? "shomty@hotmail.com";

  // Get or create user
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: { email, emailVerified: new Date() },
    });
  } else if (!user.emailVerified) {
    await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  }

  // Delete old sessions and create a fresh 90-day one
  await db.session.deleteMany({ where: { userId: user.id } });
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: { sessionToken, userId: user.id, expires },
  });

  // Set the session cookie and redirect to onboarding/report
  // NextAuth v5 uses "authjs.session-token" (no __Secure- prefix on http://localhost)
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  return response;
}
