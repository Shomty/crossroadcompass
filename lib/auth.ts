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
import { env } from "@/lib/env";

const MAGIC_LINK_FROM = env.NODE_ENV === "production"
  ? "Crossroads Compass <hello@crossroadscompass.com>"
  : "Crossroads Compass <onboarding@resend.dev>";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  logger: {
    error(error: Error) {
      console.error("[auth]", error);
    },
  },
  providers: [
    // Google OAuth — endpoints provided directly to skip runtime OIDC discovery fetch
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          authorization: "https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account&scope=openid+email+profile",
          token: "https://oauth2.googleapis.com/token",
          userinfo: "https://openid.googleapis.com/userinfo",
          // issuer omitted — prevents JWKS/OIDC validation fetch at callback which was causing hangs
          checks: ["pkce", "state"],
          allowDangerousEmailAccountLinking: true,
        })]
      : []),
    // Magic-link email auth via Resend
    ...(env.RESEND_API_KEY
      ? [Resend({
          apiKey: env.RESEND_API_KEY,
          from: MAGIC_LINK_FROM,
        })]
      : []),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
    error: "/auth-error",
  },
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.id ?? token.sub;

      if (userId) {
        token.id = userId;
      }

      // Refresh role at sign-in and recover it for JWTs created outside the normal callback path.
      if (userId && (user || !token.role)) {
        const dbUser = await db.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      } else if (!token.role) {
        token.role = "USER";
      }

      return token;
    },
    session({ session, token }) {
      // Expose user id and role from JWT token to session consumers
      session.user.id = (token.id ?? token.sub ?? "") as string;
      session.user.role = typeof token.role === "string" ? token.role : "USER";
      return session;
    },
  },
});
