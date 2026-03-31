import Link from "next/link";
import { V4GlassCard } from "@/components/v4/V4GlassCard";

/**
 * Shown on Karma Timeline when the user has no usable birth profile for Oracle.
 * Shell and typography match OracleForm / DashaPeriodCard rhythm.
 */
export function OracleBirthProfileGate() {
  return (
    <V4GlassCard className="oracle-gate text-center">
      <div className="flex flex-col gap-3">
        <p className="page-eyebrow text-center">Crossroads Oracle™</p>
        <h2
          className="text-[clamp(1.05rem,2vw,1.35rem)] font-normal leading-snug"
          style={{
            fontFamily: "Cinzel, serif",
            color: "var(--cream, rgba(255,255,255,0.9))",
          }}
        >
          Birth details needed
        </h2>
        <p
          className="page-subtitle mx-auto max-w-md"
          style={{ fontSize: "0.875rem" }}
        >
          To receive your Crossroads reading, we need your birth date, time (if known), and place.
        </p>
        <div className="pt-1">
          <Link
            href="/settings/profile"
            className="inline-flex items-center justify-center gap-2 rounded-[10px] px-7 py-2.5 text-[13px] font-semibold no-underline"
            style={{
              background: "linear-gradient(135deg, #c8873a, #e8b96a)",
              color: "#0d1220",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Complete birth profile
          </Link>
        </div>
      </div>
    </V4GlassCard>
  );
}
