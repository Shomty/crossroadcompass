/**
 * app/api/dev-signin/route.ts
 * DEV ONLY — instant sign-in without email verification.
 * Disabled in production. Never ships with real credentials.
 */

import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

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

  const maxAge = 90 * 24 * 60 * 60; // 90 days in seconds
  const expires = new Date(Date.now() + maxAge * 1000);

  // Encode a JWT that NextAuth's JWT strategy will accept
  const token = await encode({
    token: {
      sub: user.id,
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name ?? email,
    },
    secret: env.AUTH_SECRET,
    salt: "authjs.session-token",
    maxAge,
  });

  // Set the JWT session cookie and redirect
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });

  return response;
}
