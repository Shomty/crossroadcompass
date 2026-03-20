// STATUS: done | Task Admin-8
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { getAllPrompts } from "@/lib/admin/promptService";
import { SeedPromptsButton } from "@/components/admin/SeedPromptsButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

const FEATURE_LABELS: Record<string, string> = {
  DAILY_INSIGHT: "Daily Insight",
  WEEKLY_FORECAST: "Weekly Forecast",
  MONTHLY_REPORT: "Monthly Report",
  HD_TIP: "HD Tip",
  ONBOARDING_REPORT: "Onboarding Report",
  WELCOME_EMAIL: "Welcome Email",
  PRESESSION_EMAIL: "Pre-Session Email",
  TRANSIT_ALERT_EMAIL: "Transit Alert Email",
};

export default async function PromptsPage() {
  await requireAdminSession();

  const prompts = await getAllPrompts();

  // Group by feature
  const grouped = prompts.reduce<Record<string, typeof prompts>>((acc, p) => {
    const key = p.feature;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const isEmpty = prompts.length === 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond')",
            fontSize: 28,
            fontWeight: 400,
            color: "#f0dca0",
            margin: 0,
            marginBottom: 6,
          }}>
            Prompt Templates
          </h1>
          <p style={{
            fontFamily: "var(--font-mono, 'DM Mono')",
            fontSize: 12,
            color: "#606880",
            margin: 0,
          }}>
            {prompts.length} templates · edit without redeployment
          </p>
        </div>

        <SeedPromptsButton />
      </div>

      {isEmpty ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#606880",
          fontFamily: "var(--font-mono, 'DM Mono')",
          fontSize: 13,
          background: "rgba(28,35,64,0.3)",
          borderRadius: 8,
          border: "1px dashed rgba(200,135,58,0.2)",
        }}>
          No prompt templates yet. Use the &quot;Seed default prompts&quot; button to populate from existing code.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(grouped).map(([feature, featurePrompts]) => (
            <div key={feature}>
              <div style={{
                fontFamily: "var(--font-mono, 'DM Mono')",
                fontSize: 10,
                color: "#c8873a",
                letterSpacing: "0.15em",
                marginBottom: 10,
                textTransform: "uppercase",
              }}>
                {FEATURE_LABELS[feature] ?? feature}
              </div>
              <div style={{
                background: "rgba(28,35,64,0.4)",
                border: "1px solid rgba(200,135,58,0.12)",
                borderRadius: 8,
                overflow: "hidden",
              }}>
                {featurePrompts.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#c8d0e8" }}>
                        {p.promptKey}
                      </div>
                      {p.hdType && (
                        <div style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#c8873a", marginTop: 2 }}>
                          {p.hdType}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{
                        fontFamily: "var(--font-mono, 'DM Mono')",
                        fontSize: 10,
                        color: p.isActive ? "#80D4A0" : "#E8705A",
                      }}>
                        {p.isActive ? "● active" : "○ inactive"}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#404860" }}>
                        v{p.version}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 10, color: "#404860" }}>
                        {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/admin/prompts/${encodeURIComponent(p.promptKey)}`}
                        style={{
                          fontFamily: "var(--font-mono, 'DM Mono')",
                          fontSize: 11,
                          color: "#e8b96a",
                          textDecoration: "none",
                          padding: "4px 12px",
                          border: "1px solid rgba(232,185,106,0.3)",
                          borderRadius: 4,
                        }}
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

