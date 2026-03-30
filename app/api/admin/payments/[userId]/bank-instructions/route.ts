import { NextResponse } from "next/server";
import React from "react";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { writeAuditLog } from "@/lib/auth/adminHelpers";
import { sendEmail } from "@/lib/email/client";
import { env } from "@/lib/env";

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { session, error } = await requireAdminApi(request);
  if (error) return error;

  const { userId } = await context.params;

  let body: { email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const to = typeof body.email === "string" ? body.email.trim() : "";
  if (!to) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const name = env.BANK_ACCOUNT_NAME;
  const iban = env.BANK_IBAN;
  const bic = env.BANK_BIC;
  if (!name || !iban || !bic) {
    return NextResponse.json(
      { error: "Bank details not configured in environment" },
      { status: 500 }
    );
  }

  const ref = `${env.BANK_REFERENCE_PREFIX}-${userId.slice(0, 8)}`;

  const bodyText = `Bank transfer instructions\n\nAccount name: ${name}\nIBAN: ${iban}\nBIC: ${bic}\nReference: ${ref}\n`;

  await sendEmail({
    to,
    subject: "Crossroads Compass — bank transfer details",
    react: React.createElement(
      "div",
      { style: { fontFamily: "system-ui, sans-serif", lineHeight: 1.6 } },
      React.createElement("h2", null, "Bank transfer"),
      React.createElement("p", null, "Use the following details:"),
      React.createElement("ul", null,
        React.createElement("li", null, `Account name: ${name}`),
        React.createElement("li", null, `IBAN: ${iban}`),
        React.createElement("li", null, `BIC: ${bic}`),
        React.createElement("li", null, `Payment reference: ${ref}`)
      ),
      React.createElement("pre", { style: { whiteSpace: "pre-wrap" } }, bodyText)
    ),
  });

  await writeAuditLog({
    adminEmail: session!.user.email ?? "admin",
    action: "payment.bank_instructions_sent",
    targetType: "payment",
    targetId: userId,
    detail: to,
  });

  return NextResponse.json({ ok: true });
}
