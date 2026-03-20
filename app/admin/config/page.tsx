// STATUS: done | Task Admin-12
import { requireAdminSession } from "@/lib/admin/requireAdmin";
import { db } from "@/lib/db";
import { ConfigEditor } from "@/components/admin/ConfigEditor";
import { GeminiTestPanel } from "@/components/admin/GeminiTestPanel";

export const dynamic = "force-dynamic";

const DEFAULT_FLAGS = [
  { key: "CONTENT_REVIEW_REQUIRED", defaultValue: true },
  { key: "DAILY_INSIGHTS_ENABLED", defaultValue: true },
  { key: "WEEKLY_INSIGHTS_ENABLED", defaultValue: true },
  { key: "MONTHLY_REPORTS_ENABLED", defaultValue: true },
  { key: "CONSULTATION_BOOKING_ENABLED", defaultValue: true },
];

const DEFAULT_CONFIG = [
  { key: "MAX_USERS_PER_CRON_RUN", defaultValue: "50" },
  { key: "INSIGHT_GENERATION_HOUR_UTC", defaultValue: "4" },
  { key: "DAILY_MAX_TOKENS", defaultValue: "800" },
  { key: "WEEKLY_MAX_TOKENS", defaultValue: "1200" },
  { key: "MONTHLY_MAX_TOKENS", defaultValue: "1500" },
];

export default async function ConfigPage() {
  await requireAdminSession();

  const [flags, configs] = await Promise.all([
    db.featureFlag.findMany({ orderBy: { key: "asc" } }),
    db.systemConfig.findMany({ orderBy: { key: "asc" } }),
  ]);

  const flagMap = Object.fromEntries(flags.map((f) => [f.key, f.value]));
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]));

  const mergedFlags = DEFAULT_FLAGS.map((d) => ({
    key: d.key,
    value: flagMap[d.key] ?? d.defaultValue,
  }));

  const mergedConfig = DEFAULT_CONFIG.map((d) => ({
    key: d.key,
    value: configMap[d.key] ?? d.defaultValue,
  }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--font-display, 'Cormorant Garamond')",
          fontSize: 28,
          fontWeight: 400,
          color: "#f0dca0",
          margin: 0,
          marginBottom: 6,
        }}>
          System Config
        </h1>
        <p style={{ fontFamily: "var(--font-mono, 'DM Mono')", fontSize: 12, color: "#606880", margin: 0 }}>
          Feature flags and system settings
        </p>
      </div>

      <ConfigEditor flags={mergedFlags} configs={mergedConfig} />

      <GeminiTestPanel />
    </div>
  );
}
