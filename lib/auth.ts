/**
 * lib/auth.ts
 * NextAuth v5 configuration.
 * Email/password only at launch (AC-01 — no social login required at MVP).
 * Uses Prisma adapter for session + account persistence.
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    // Google OAuth — endpoints provided directly to skip runtime OIDC discovery fetch
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: "https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account&scope=openid+email+profile",
          token: "https://oauth2.googleapis.com/token",
          userinfo: "https://openid.googleapis.com/userinfo",
          // issuer omitted — prevents JWKS/OIDC validation fetch at callback which was causing hangs
          checks: ["pkce", "state"],
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    // Magic-link email auth via Resend
    Resend({
      from: "Crossroads Compass <hello@crossroadscompass.com>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
    error: "/auth-error",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach DB user id + role to token on initial sign-in
      if (user) {
        token.id = user.id;
        // Fetch role from DB — not in default user object
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      // Expose user id and role from JWT token to session consumers
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
