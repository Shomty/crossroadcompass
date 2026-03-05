/**
 * lib/auth.ts
 * NextAuth v5 configuration.
 * Email/password only at launch (AC-01 — no social login required at MVP).
 * Uses Prisma adapter for session + account persistence.
 *
 * Magic link email is sent via Resend (RESEND_API_KEY).
 * In development without RESEND_API_KEY, the magic link URL is written to
 * .magic-link-dev at the project root AND printed to the console.
 */

import fs from "fs";
import path from "path";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

// Dev email provider: writes the magic link to .magic-link-dev + console.
const devEmailProvider = Resend({
  apiKey: "PLACEHOLDER_DEV",
  from: "Crossroads Compass <hello@crossroadscompass.com>",
  async sendVerificationRequest({ url }) {
    // Write to file so /check-email page can display it without digging through logs
    try {
      fs.writeFileSync(
        path.join(process.cwd(), ".magic-link-dev"),
        url,
        "utf-8"
      );
    } catch { /* ignore fs errors in edge environments */ }
    console.log("\n🔗 MAGIC LINK (dev — no email sent):");
    console.log(url);
    console.log("");
  },
});

// Production email provider: sends via Resend using RESEND_API_KEY.
// Uses onboarding@resend.dev (Resend's shared domain) — no domain verification needed.
// Switch from to hello@crossroadscompass.com once the domain is verified in Resend.
const prodEmailProvider = Resend({
  apiKey: env.RESEND_API_KEY!,
  from: "Crossroads Compass <onboarding@resend.dev>",
  async sendVerificationRequest(params) {
    // Let the default Resend handler run, but log errors clearly
    const { url, identifier } = params;
    console.log(`[auth] Sending magic link to ${identifier}`);
    // Call the built-in send by re-using the default implementation
    const { Resend: ResendClient } = await import("resend");
    const client = new ResendClient(env.RESEND_API_KEY!);
    const { error } = await client.emails.send({
      from: "Crossroads Compass <onboarding@resend.dev>",
      to: identifier,
      subject: "Your Crossroads Compass sign-in link",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:40px 24px;background:#080c1a;color:#e8e4d9;border-radius:8px;">
          <h2 style="font-family:Georgia,serif;font-weight:300;color:#d4af5f;margin-bottom:24px;">Sign in to Crossroads Compass</h2>
          <p style="line-height:1.7;margin-bottom:28px;color:#a8a4a0;">Click the button below to sign in. This link expires in 10 minutes.</p>
          <a href="${url}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,rgba(200,135,58,0.2),rgba(200,135,58,0.08));border:1px solid rgba(200,135,58,0.5);border-radius:4px;color:#c8873a;text-decoration:none;font-size:14px;letter-spacing:0.06em;">
            ✦ Sign In
          </a>
          <p style="margin-top:32px;font-size:12px;color:#555;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.<br/>
            Or copy this URL: <a href="${url}" style="color:#c8873a;">${url}</a>
          </p>
        </div>
      `,
    });
    if (error) {
      console.error("[auth] Resend error sending magic link:", error);
      throw new Error(`Failed to send magic link: ${error.message}`);
    }
    console.log(`[auth] Magic link sent to ${identifier} ✓`);
  },
});

const emailProvider = env.RESEND_API_KEY ? prodEmailProvider : devEmailProvider;

// ─── OAuth providers (only registered when credentials are present) ───────────
// allowDangerousEmailAccountLinking: links Google/etc to an existing email account
// (e.g. user previously signed in via magic link with the same email).

const oauthProviders = [
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, allowDangerousEmailAccountLinking: true })
    : null,
  env.GITHUB_ID && env.GITHUB_SECRET
    ? GitHub({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET, allowDangerousEmailAccountLinking: true })
    : null,
  env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
    ? Facebook({ clientId: env.FACEBOOK_CLIENT_ID, clientSecret: env.FACEBOOK_CLIENT_SECRET, allowDangerousEmailAccountLinking: true })
    : null,
  env.APPLE_ID && env.APPLE_SECRET
    ? Apple({ clientId: env.APPLE_ID, clientSecret: env.APPLE_SECRET, allowDangerousEmailAccountLinking: true })
    : null,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
].filter(Boolean) as any[];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  providers: [
    emailProvider,
    ...oauthProviders,
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
