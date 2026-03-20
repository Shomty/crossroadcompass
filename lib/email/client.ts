// STATUS: done | Task 7.1
/**
 * lib/email/client.ts
 * Configured Resend client + typed sendEmail wrapper.
 * Dev fallback: if RESEND_API_KEY is not set, renders the email as HTML
 * and logs it to the console rather than throwing.
 */

import { Resend } from "resend";
import { render } from "@react-email/components";
import React from "react";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = env.NODE_ENV === "production"
  ? "Crossroads Compass <hello@crossroadscompass.com>"
  : "Crossroads Compass <onboarding@resend.dev>";

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<void> {
  try {
    if (!resend) {
      // Dev mode — print rendered HTML to console instead of sending.
      const html = await render(options.react);
      console.log(`\n📧 EMAIL (dev mode — not sent):`);
      console.log(`  To:      ${options.to}`);
      console.log(`  Subject: ${options.subject}`);
      console.log(`  Preview: ${html.slice(0, 200).replace(/\s+/g, " ")}…\n`);
      return;
    }

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      react: options.react,
    });

    if (error) {
      console.error("[email/client] Resend error:", error);
    }
  } catch (err) {
    // Email failure must never break user-facing flows.
    console.error("[email/client] Unexpected error:", err);
  }
}
