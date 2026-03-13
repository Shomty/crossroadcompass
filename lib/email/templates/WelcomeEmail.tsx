// STATUS: done | Task 7.2
/**
 * lib/email/templates/WelcomeEmail.tsx
 * Welcome email sent after the user's first HD report is generated.
 * Includes the report link and a preview of what daily guidance looks like.
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

interface WelcomeEmailProps {
  userEmail: string;
  reportUrl: string;
}

export function WelcomeEmail({ userEmail, reportUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Crossroads Compass report is ready — discover your Human Design</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={eyebrow}>✦ Crossroads Compass</Text>
          </Section>

          {/* Hero */}
          <Section style={section}>
            <Heading style={h1}>Your report is ready.</Heading>
            <Text style={paragraph}>
              Hi{userEmail ? ` ${userEmail.split("@")[0]}` : ""},
            </Text>
            <Text style={paragraph}>
              Your personalised Human Design report has been generated. It maps
              your energy type, decision-making authority, and the deeper pattern
              beneath how you move through the world.
            </Text>
            <Button href={reportUrl} style={button}>
              View Your Report
            </Button>
          </Section>

          <Hr style={divider} />

          {/* What to expect */}
          <Section style={section}>
            <Heading style={h2}>What comes next</Heading>
            <Text style={paragraph}>
              Every day you'll receive a short insight drawn from your chart and
              the current planetary transits — a gentle orienting note to help
              you move with more clarity and less friction.
            </Text>
            <Text style={paragraph}>
              You can rate each insight after reading it, which helps us refine
              the guidance over time.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you created an account at{" "}
              <Link href="https://crossroadscompass.com" style={link}>
                crossroadscompass.com
              </Link>
              .
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Crossroads Compass
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default WelcomeEmail;

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

const header: React.CSSProperties = {
  marginBottom: "32px",
};

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "#c8873a",
  margin: 0,
};

const section: React.CSSProperties = {
  marginBottom: "32px",
};

const h1: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 300,
  color: "#f2ead8",
  margin: "0 0 16px 0",
  lineHeight: 1.2,
};

const h2: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 400,
  color: "#f2ead8",
  margin: "0 0 12px 0",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.7,
  color: "#d4c9b0",
  margin: "0 0 16px 0",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#c8873a",
  color: "#0d1220",
  padding: "14px 32px",
  borderRadius: "2px",
  fontSize: "13px",
  fontWeight: 500,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  textDecoration: "none",
  marginTop: "8px",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(200, 135, 58, 0.15)",
  margin: "32px 0",
};

const footer: React.CSSProperties = {
  marginTop: "32px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b6b6b",
  margin: "0 0 8px 0",
};

const link: React.CSSProperties = {
  color: "#c8873a",
  textDecoration: "none",
};
