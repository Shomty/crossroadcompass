"use client";
/**
 * components/dashboard/HDProfileStrip.tsx
 * Full-width horizontal HD profile strip.
 * Shows avatar + name + type/authority/profile badges on the left,
 * and 4 clickable attribute columns (TYPE / STRATEGY / AUTHORITY / PROFILE) on the right.
 * Clicking a column fetches a brief AI-generated insight and expands it inline.
 */

import { useState, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  name: string;
  hdType?: string | null;
  hdStrategy?: string | null;
  hdAuthority?: string | null;
  hdProfile?: string | null;
}

type HDAttr = "Type" | "Strategy" | "Authority" | "Profile";

interface InsightState {
  headline: string;
  body: string;
  practicalTip: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function HDProfileStrip({ name, hdType, hdStrategy, hdAuthority, hdProfile }: Props) {
  const [type, setType] = useState(hdType ?? null);
  const [strategy, setStrategy] = useState(hdStrategy ?? null);
  const [authority, setAuthority] = useState(hdAuthority ?? null);
  const [profile, setProfile] = useState(hdProfile ?? null);
  const [loadingChart, setLoadingChart] = useState(!hdType && !hdAuthority && !hdProfile);

  const [activeAttr, setActiveAttr] = useState<HDAttr | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [cache, setCache] = useState<Partial<Record<HDAttr, InsightState>>>({});

  // Fallback fetch if no HD data provided server-side
  useEffect(() => {
    if (hdType) return;
    fetch("/api/hd-chart")
      .then((r) => r.json())
      .then((json) => {
        if (json?.chart) {
          setType(json.chart.type ?? null);
          setStrategy(json.chart.strategy ?? null);
          setAuthority(json.chart.authority ?? null);
          setProfile(json.chart.profile ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingChart(false));
  }, [hdType]);

  // ── Click handler ────────────────────────────────────────────────────────────

  async function handleClick(label: HDAttr, value: string | null) {
    if (!value) return;
    if (activeAttr === label) {
      setActiveAttr(null);
      return;
    }
    setActiveAttr(label);
    if (cache[label]) return;

    setInsightLoading(true);
    setInsightError(null);
    try {
      const res = await fetch("/api/insights/hd-attribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attribute: label.toLowerCase(), value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInsightError(data.error ?? "Could not generate insight.");
      } else {
        setCache((prev) => ({ ...prev, [label]: data as InsightState }));
      }
    } catch {
      setInsightError("Network error.");
    } finally {
      setInsightLoading(false);
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const initial = name.trim().charAt(0).toUpperCase();
  const typeKey = (type ?? "").toLowerCase().trim();

  const cols: { label: HDAttr; value: string | null }[] = [
    { label: "Type", value: type },
    { label: "Strategy", value: strategy },
    { label: "Authority", value: authority },
    { label: "Profile", value: profile },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loadingChart) {
    return (
      <div className="glass-card dash-hd-strip">
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "var(--type-label, 10px)",
          color: "var(--amber)",
          letterSpacing: "0.12em",
          opacity: 0.5,
        }}>
          Reading chart…
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card dash-hd-strip animate-enter">
      <div className="dash-hd-strip-row">

        {/* ── Left: identity ───────────────────────────────────────────── */}
        <div className="dash-hd-identity">
          {/* Avatar */}
          <div className="dash-hd-avatar">{initial}</div>

          {/* Name + badges */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "var(--cream)",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {name}
            </div>
            <div className="dash-hd-badges">
              {type && (
                <span className="dash-hd-badge dash-hd-badge--type">
                  {type}
                </span>
              )}
              {authority && (
                <span className="dash-hd-badge">{authority}</span>
              )}
              {profile && (
                <span className="dash-hd-badge">Profile {profile}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: attribute columns ─────────────────────────────────── */}
        <div className="dash-hd-cols">
          {cols.map(({ label, value }) => {
            const isActive = activeAttr === label;
            return (
              <div
                key={label}
                className={`dash-hd-col${isActive ? " dash-hd-col--active" : ""}${!value ? " dash-hd-col--empty" : ""}`}
                onClick={() => handleClick(label, value)}
                role="button"
                tabIndex={value ? 0 : -1}
                aria-expanded={isActive}
                aria-disabled={!value}
                onKeyDown={(e) => e.key === "Enter" && handleClick(label, value)}
              >
                <span className="dash-eyebrow" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {label}
                  {value && (
                    <span style={{
                      fontSize: 8,
                      opacity: isActive ? 1 : 0.35,
                      transition: "transform 0.2s, opacity 0.2s",
                      transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                      display: "inline-block",
                      lineHeight: 1,
                    }}>▾</span>
                  )}
                </span>
                <span className="dash-hd-col__value">
                  {value ?? <span style={{ opacity: 0.3 }}>—</span>}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Expand panel ─────────────────────────────────────────────────── */}
      {activeAttr && (
        <div className="dash-hd-panel" aria-live="polite">
          {insightLoading && !cache[activeAttr] && (
            <div className="dash-hd-panel__loading">
              {[90, 75, 55].map((w) => (
                <div
                  key={w}
                  className="dash-skeleton"
                  style={{ width: `${w}%`, height: 9, borderRadius: 2 }}
                />
              ))}
            </div>
          )}
          {!insightLoading && insightError && (
            <p className="dash-hd-panel__error">{insightError}</p>
          )}
          {!insightLoading && cache[activeAttr] && (() => {
            const ins = cache[activeAttr]!;
            return (
              <div>
                <p className="dash-hd-panel__headline">{ins.headline}</p>
                <p className="dash-hd-panel__body">{ins.body}</p>
                <div className="dash-hd-panel__practice">
                  <span className="dash-eyebrow">Practice</span>
                  <span className="dash-hd-panel__tip">{ins.practicalTip}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
