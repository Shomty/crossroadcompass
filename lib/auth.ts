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
  session: { strategy: "database" },
  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    session({ session, user }) {
      // Attach DB user id to the session so API routes can use it
      session.user.id = user.id;
      return session;
    },
  },
});
