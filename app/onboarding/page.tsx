/**
 * app/onboarding/page.tsx
 * Onboarding shell — uses BirthDataForm component.
 * Requires authentication; redirects to /login if not signed in.
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BirthDataForm } from "@/components/onboarding/BirthDataForm";
import { Nav } from "@/components/layout/Nav";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // If user already has a birth profile, go straight to report
  const existing = await db.birthProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (existing) redirect("/report");

  return (
    <>
      <Nav variant="dashboard" />
      <main
        className="content-layer"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "7rem 1.5rem 4rem",
        }}
      >
        {/* Page header */}
        <div style={{ textAlign: "center", marginBottom: "3rem", maxWidth: 480 }}>
          <p className="eyebrow" style={{ marginBottom: "1rem" }}>
            Your Human Design
          </p>
          <h1
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              fontWeight: 300,
              color: "var(--cream)",
              lineHeight: 1.15,
              marginBottom: "0.75rem",
            }}
          >
            {"Let's build your "}
            <em>chart</em>
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--mist)", lineHeight: 1.75 }}>
            We need your birth data to calculate your Human Design chart. This takes about 2 minutes.
          </p>
        </div>

        {/* Form */}
        <BirthDataForm />
      </main>
    </>
  );
}
