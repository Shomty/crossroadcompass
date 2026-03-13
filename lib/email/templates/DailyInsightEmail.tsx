// STATUS: done | Task 7.3
/**
 * lib/email/templates/DailyInsightEmail.tsx
 * Daily insight delivery email.
 * Rating links use GET requests so they work from any email client
 * without requiring JavaScript.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface DailyInsightEmailProps {
  insightContent: string;
  insightId: string;
  dashboardUrl: string;
}

const STARS = ["★", "★★", "★★★", "★★★★", "★★★★★"] as const;
const LABELS = ["Not useful", "Somewhat useful", "Useful", "Very useful", "Spot on"] as const;

export function DailyInsightEmail({
  insightContent,
  insightId,
  dashboardUrl,
}: DailyInsightEmailProps) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const ratingBase = `${dashboardUrl.replace(/\/$/, "")}/api/insights/rate`;

  return (
    <Html>
      <Head />
      <Preview>{insightContent.slice(0, 100)}…</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={eyebrow}>✦ Your Daily Guidance</Text>
            <Text style={dateText}>{today}</Text>
          </Section>

          {/* Insight */}
          <Section style={insightSection}>
            <Text style={insightText}>{insightContent}</Text>
          </Section>

          <Hr style={divider} />

          {/* Rating */}
          <Section style={ratingSection}>
            <Heading style={ratingHeading}>How accurate was this?</Heading>
            <Text style={ratingSubtext}>Tap a rating — it helps refine your guidance.</Text>
            <Section style={starsRow}>
              {([1, 2, 3, 4, 5] as const).map((rating) => (
                <Link
                  key={rating}
                  href={`${ratingBase}?insightId=${insightId}&rating=${rating}`}
                  style={starLink}
                  title={LABELS[rating - 1]}
                >
                  {STARS[rating - 1]}
                </Link>
              ))}
            </Section>
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={dashboardUrl} style={button}>
              Open Dashboard
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Crossroads Compass ·{" "}
              <Link href="https://crossroadscompass.com" style={link}>
                crossroadscompass.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DailyInsightEmail;

// ─── Styles ──────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#0d1220",
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 24px",
};

const headerSection: React.CSSProperties = {
  marginBottom: "24px",
};

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "#c8873a",
  margin: "0 0 4px 0",
};

const dateText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b6b6b",
  margin: 0,
};

const insightSection: React.CSSProperties = {
  margin: "24px 0",
  padding: "24px",
  borderLeft: "2px solid rgba(200, 135, 58, 0.4)",
  backgroundColor: "rgba(255, 255, 255, 0.02)",
};

const insightText: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.75,
  color: "#f2ead8",
  margin: 0,
  fontStyle: "italic",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(200, 135, 58, 0.15)",
  margin: "28px 0",
};

const ratingSection: React.CSSProperties = {
  marginBottom: "8px",
};

const ratingHeading: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  color: "#f2ead8",
  margin: "0 0 4px 0",
};

const ratingSubtext: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b6b6b",
  margin: "0 0 16px 0",
};

const starsRow: React.CSSProperties = {
  display: "flex" as const,
  gap: "16px",
};

const starLink: React.CSSProperties = {
  fontSize: "22px",
  color: "#c8873a",
  textDecoration: "none",
  marginRight: "12px",
};

const ctaSection: React.CSSProperties = {
  marginBottom: "32px",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "transparent",
  color: "#c8873a",
  padding: "12px 28px",
  borderRadius: "2px",
  border: "1px solid #c8873a",
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  marginTop: "32px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b6b6b",
  margin: 0,
};

const link: React.CSSProperties = {
  color: "#c8873a",
  textDecoration: "none",
};
