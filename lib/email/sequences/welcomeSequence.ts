// STATUS: done | Task 7.4
/**
 * lib/email/sequences/welcomeSequence.ts
 * Welcome sequence trigger.
 * Email 1 (welcome + report link) fires immediately on first report generation.
 * Emails 2-7 are deferred.
 * TODO(P1): implement scheduled emails 2-7 via a queue (e.g. Upstash QStash or Vercel Cron).
 */

import { sendEmail } from "@/lib/email/client";
import { WelcomeEmail } from "@/lib/email/templates/WelcomeEmail";
import React from "react";

export async function triggerWelcomeSequence(
  userId: string,
  email: string,
  reportUrl: string
): Promise<void> {
  // Email 1 — welcome + report link (immediate)
  await sendEmail({
    to: email,
    subject: "Your Crossroads Compass report is ready",
    react: React.createElement(WelcomeEmail, { userEmail: email, reportUrl }),
  });

  // TODO(P1): schedule emails 2-7 via queue
  // Email 2 (day 2): "What your Human Design type means day-to-day"
  // Email 3 (day 3): "Your authority — how to make decisions that feel right"
  // Email 4 (day 5): "Reading your daily insight"
  // Email 5 (day 7): "Your first week — what to notice"
  // Email 6 (day 10): "Upgrade to Core for weekly forecasts"
  // Email 7 (day 14): "One month in — what to expect"
  void userId; // used in future scheduling
}
