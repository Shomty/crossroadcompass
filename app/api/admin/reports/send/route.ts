// STATUS: done | Admin Custom Report Builder
/**
 * POST /api/admin/reports/send
 * Sends an assembled custom report to the user via email.
 */

import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/requireAdmin";
import { sendEmail } from "@/lib/email/client";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";
import type { CustomReportOutput, ReportSection } from "@/types";

export async function POST(request: Request): Promise<NextResponse> {
  const { error } = await requireAdminApi(request);
  if (error) return error;

  let body: { report?: CustomReportOutput };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { report } = body;
  if (!report || !report.config || !report.sections || !report.userEmail) {
    return NextResponse.json({ error: "Invalid report payload" }, { status: 400 });
  }

  if (report.config.deliveryMode === "pdf") {
    // TODO(P2): PDF generation
    return NextResponse.json(
      { error: "PDF export not yet available", code: "NOT_IMPLEMENTED" },
      { status: 501 }
    );
  }

  const emailElement = React.createElement(CustomReportEmail, {
    title: report.config.title,
    sections: report.sections,
    generatedAt: new Date(report.generatedAt),
  });

  await sendEmail({
    to: report.userEmail,
    subject: report.config.title,
    react: emailElement,
  });

  return NextResponse.json({ delivered: true });
}

// ─── Email template ───────────────────────────────────────────────────────────

function CustomReportEmail({
  title,
  sections,
  generatedAt,
}: {
  title: string;
  sections: ReportSection[];
  generatedAt: Date;
}) {
  const dateStr = generatedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return React.createElement(
    Html,
    null,
    React.createElement(Head, null),
    React.createElement(Preview, null, title),
    React.createElement(
      Body,
      { style: bodyStyle },
      React.createElement(
        Container,
        { style: containerStyle },
        // Header
        React.createElement(
          Section,
          { style: headerStyle },
          React.createElement(Text, { style: eyebrowStyle }, "✦ Crossroads Compass"),
          React.createElement(Heading, { style: titleStyle }, title),
          React.createElement(Text, { style: dateStyle }, `Prepared ${dateStr}`)
        ),
        // Sections
        ...sections.map((section, i) =>
          React.createElement(
            React.Fragment,
            { key: section.variable },
            i > 0 ? React.createElement(Hr, { style: dividerStyle }) : null,
            React.createElement(
              Section,
              { style: sectionStyle },
              React.createElement(Heading, { style: sectionHeadingStyle }, section.label),
              React.createElement(Text, { style: sectionTextStyle }, section.content)
            )
          )
        ),
        // Footer
        React.createElement(Hr, { style: dividerStyle }),
        React.createElement(
          Section,
          null,
          React.createElement(
            Text,
            { style: footerStyle },
            `© ${generatedAt.getFullYear()} Crossroads Compass`
          )
        )
      )
    )
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#0d1220",
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "40px 24px",
};

const headerStyle: React.CSSProperties = {
  marginBottom: "32px",
  borderBottom: "1px solid rgba(200,135,58,0.2)",
  paddingBottom: "24px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  color: "#c8873a",
  margin: "0 0 8px 0",
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  color: "#e8b96a",
  margin: "0 0 8px 0",
  fontWeight: 600,
};

const dateStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#606880",
  margin: 0,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: "8px",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "14px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "#c8873a",
  margin: "0 0 12px 0",
  fontWeight: 500,
};

const sectionTextStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.7,
  color: "#f0dca0",
  margin: 0,
  whiteSpace: "pre-line" as const,
};

const dividerStyle: React.CSSProperties = {
  borderColor: "rgba(200,135,58,0.15)",
  margin: "24px 0",
};

const footerStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#606880",
  margin: 0,
};
