"use client";
/**
 * components/dashboard/HumanDesignTypeCard.tsx
 * Human Design type card — flip on click to show details.
 * FRONTEND.md: amber/gold only, Cormorant/DM Mono/Instrument Sans,
 * border-radius ≤3px, no box-shadow, no colour backgrounds.
 *
 * Flip impl: content swaps at midpoint of a scaleX(0→1) animation
 * so height is always determined by content (no absolute-position hacks).
 */

import { useState, useEffect, useRef } from "react";

// ─── Type data ────────────────────────────────────────────────────────────────

interface HDTypeData {
  name: string;
  glyph: string;
  purpose: string;
  strategyShort: string;
  strategy: string;
  question: string;
  key: string;
  desc: string;
  aura: string;
}

const TYPES: Record<string, HDTypeData> = {
  "generator": {
    name: "Generator",
    glyph: "◉",
    purpose: "HERE TO BUILD",
    strategyShort: "Wait to respond",
    strategy: "Let life bring things to you — wait for something to respond to, then check your gut before committing.",
    question: "Am I doing work I love?",
    key: "Your energy is magnetic when you are genuinely lit up. Honour what makes your gut say yes.",
    desc: "Generators carry the life force of the planet. With a defined Sacral centre you have sustainable energy for work you love. Satisfaction is your signal that you are on the right path.",
    aura: "Open & Enveloping",
  },
  "manifesting generator": {
    name: "Manifesting Generator",
    glyph: "◉",
    purpose: "HERE TO BUILD & LEAD",
    strategyShort: "Respond, then inform",
    strategy: "Respond first, then inform others before acting. Skipping steps is fine — go back when something is missed.",
    question: "Am I following my excitement?",
    key: "You are built for speed and variety. Dropping something that no longer lights you up is not failure — it is correct.",
    desc: "Manifesting Generators combine Sacral energy with an initiating motor connected to the Throat. Fast, multi-passionate, and efficient — designed to find the shortest path and iterate freely.",
    aura: "Open & Enveloping",
  },
  "projector": {
    name: "Projector",
    glyph: "◈",
    purpose: "HERE TO GUIDE",
    strategyShort: "Wait for the invitation",
    strategy: "Wait for recognition and an invitation before sharing your wisdom, entering new work, or starting new relationships.",
    question: "Am I being recognised for my gifts?",
    key: "Your seeing is your gift. Rest is not laziness — it is how you maintain the clarity others seek from you.",
    desc: "Projectors are the natural guides of the new world — designed to direct and optimise the energy of others. Your focused aura sees deeply into systems and people. Success follows true recognition.",
    aura: "Focused & Absorbing",
  },
  "manifestor": {
    name: "Manifestor",
    glyph: "✦",
    purpose: "HERE TO INITIATE",
    strategyShort: "Inform before acting",
    strategy: "Inform the people who will be affected by your actions before you act — this dissolves resistance and protects your energy.",
    question: "What impact do I want to have?",
    key: "You are rare. You can initiate without waiting. Your power grows when you keep the people around you informed.",
    desc: "Manifestors are initiators — one of the few types designed to act on impulse without waiting. Your closed aura creates a natural boundary that protects your creative force. Peace is your signature.",
    aura: "Closed & Repelling",
  },
  "reflector": {
    name: "Reflector",
    glyph: "☽",
    purpose: "HERE TO ASSESS",
    strategyShort: "Wait a lunar cycle",
    strategy: "Wait a full 28-day lunar cycle before making major decisions, sampling different environments and perspectives as you go.",
    question: "Am I surrounded by the right people?",
    key: "You reflect the health of your community back to it. Environment is everything — who you spend time with shapes how you feel.",
    desc: "Reflectors are the rarest type (roughly 1%). With all centres undefined you sample and mirror the energy around you. Surprise and delight are your signatures when you are in the right place.",
    aura: "Resistant & Sampling",
  },
};

const FALLBACK = TYPES["generator"];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  hdType?: string | null;
  hdStrategy?: string | null;
  hdAuthority?: string | null;
  hdProfile?: string | null;
}

export function HumanDesignTypeCard({ hdType, hdStrategy, hdAuthority, hdProfile }: Props) {
  const [typeKey, setTypeKey] = useState<string | null>(hdType ? hdType.toLowerCase().trim() : null);
  const [authority, setAuthority] = useState(hdAuthority ?? null);
  const [profile, setProfile] = useState(hdProfile ?? null);
  const [loading, setLoading] = useState(!hdType);

  // Flip state: "front" | "flipping-out" | "back" | "flipping-in"
  const [face, setFace] = useState<"front" | "back">("front");
  const [animating, setAnimating] = useState(false);
  const nextFace = useRef<"front" | "back">("front");

  useEffect(() => {
    if (hdType) return;
    fetch("/api/hd-chart")
      .then((r) => r.json())
      .then((json) => {
        if (json?.chart) {
          setTypeKey((json.chart.type ?? "").toLowerCase().trim());
          setAuthority(json.chart.authority ?? null);
          setProfile(json.chart.profile ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hdType]);

  function handleFlip() {
    if (animating) return;
    nextFace.current = face === "front" ? "back" : "front";
    setAnimating(true);
    // After scaleX → 0, swap content, then scaleX → 1
    setTimeout(() => {
      setFace(nextFace.current);
      setTimeout(() => setAnimating(false), 220);
    }, 220);
  }

  if (loading) {
    return (
      <div style={{ padding: "12px 0", opacity: 0.45 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--amber)", letterSpacing: "0.12em" }}>
          Reading chart…
        </span>
      </div>
    );
  }

  const type = (typeKey && TYPES[typeKey]) ? TYPES[typeKey] : FALLBACK;
  const strategyText = hdStrategy ?? type.strategy;
  const isFlippingOut = animating && nextFace.current !== face;

  return (
    <>
      <style>{`
        .hd-card-wrap {
          cursor: pointer;
          user-select: none;
          transition: transform 0.22s ease;
        }
        .hd-card-wrap:hover .hd-flip-hint { opacity: 0.7 !important; }
        .hd-anim-out { animation: hdFlipOut 0.22s ease forwards; }
        .hd-anim-in  { animation: hdFlipIn  0.22s ease forwards; }
        @keyframes hdFlipOut {
          from { transform: scaleX(1); opacity: 1; }
          to   { transform: scaleX(0); opacity: 0; }
        }
        @keyframes hdFlipIn {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
      `}</style>

      <div
        className={`hd-card-wrap${isFlippingOut ? " hd-anim-out" : animating ? " hd-anim-in" : ""}`}
        onClick={handleFlip}
      >
        {face === "front" ? (
          <Front type={type} />
        ) : (
          <Back type={type} authority={authority} profile={profile} strategyText={strategyText} />
        )}

        {/* Flip hint */}
        <div className="hd-flip-hint" style={{
          marginTop: 18, display: "flex", alignItems: "center", gap: 5,
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--amber)", opacity: 0.3, transition: "opacity 0.2s",
        }}>
          <span>{face === "front" ? "↻" : "↺"}</span>
          {face === "front" ? "Tap for details" : "Tap to go back"}
        </div>
      </div>
    </>
  );
}

// ─── Front face ───────────────────────────────────────────────────────────────

function Front({ type }: { type: HDTypeData }) {
  return (
    <div style={{ position: "relative" }}>
      {/* Faint background glyph */}
      <div aria-hidden style={{
        position: "absolute", top: -8, right: -4,
        fontFamily: "Cinzel, serif",
        fontSize: 120, lineHeight: 1,
        color: "rgba(200,135,58,0.07)",
        pointerEvents: "none", userSelect: "none",
        letterSpacing: "-0.02em",
      }}>{type.glyph}</div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--amber)", opacity: 0.7, marginBottom: 12,
        }}>Your Human Design</div>

        {/* Glyph inline + type name */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "Cinzel, serif",
            fontSize: 22, color: "var(--amber)", lineHeight: 1,
          }}>{type.glyph}</span>
          <span style={{
            fontFamily: "Cinzel, serif",
            fontSize: 32, fontWeight: 300,
            color: "var(--cream)", letterSpacing: "0.03em", lineHeight: 1,
          }}>{type.name}</span>
        </div>

        {/* Aura */}
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          color: "var(--mist)", letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: 16, opacity: 0.55,
        }}>{type.aura}</div>

        {/* Amber divider */}
        <div style={{ height: 1, background: "linear-gradient(to right, rgba(200,135,58,0.35), transparent)", marginBottom: 16 }} />

        {/* Purpose pill */}
        <div style={{
          display: "inline-block",
          border: "1px solid rgba(200,135,58,0.35)",
          borderRadius: 2, padding: "3px 12px",
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          letterSpacing: "0.18em", color: "var(--amber)",
          marginBottom: 14,
        }}>{type.purpose}</div>

        {/* Strategy row */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--amber)", opacity: 0.6, marginBottom: 4,
          }}>Strategy</div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13, color: "var(--mist)", lineHeight: 1.6,
          }}>{type.strategyShort}</div>
        </div>

        {/* Core question */}
        <div style={{
          fontFamily: "Cinzel, serif",
          fontSize: 14, fontStyle: "italic",
          color: "var(--gold)", lineHeight: 1.5,
        }}>"{type.question}"</div>
      </div>
    </div>
  );
}

// ─── Back face ────────────────────────────────────────────────────────────────

function Back({ type, authority, profile, strategyText }: {
  type: HDTypeData;
  authority: string | null;
  profile: string | null;
  strategyText: string;
}) {
  return (
    <div>
      {/* Eyebrow */}
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "var(--amber)", opacity: 0.7, marginBottom: 12,
      }}>Profile Details — {type.name}</div>

      {/* Authority + Profile row */}
      {(authority || profile) && (
        <div style={{ display: "flex", gap: 28, marginBottom: 14 }}>
          {authority && (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.6, marginBottom: 3 }}>Authority</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 13, color: "var(--cream)" }}>{authority}</div>
            </div>
          )}
          {profile && (
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.6, marginBottom: 3 }}>Profile</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 13, color: "var(--cream)" }}>{profile}</div>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: "linear-gradient(to right, rgba(200,135,58,0.35), transparent)", marginBottom: 14 }} />

      {/* Strategy */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.6, marginBottom: 4 }}>Strategy</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12.5, color: "var(--mist)", lineHeight: 1.65 }}>{strategyText}</div>
      </div>

      {/* Key insight */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)", opacity: 0.6, marginBottom: 4 }}>Key Insight</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif", fontSize: 12.5, color: "var(--mist)", lineHeight: 1.65 }}>{type.key}</div>
      </div>

      {/* Description */}
      <div style={{
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        fontSize: 12, color: "var(--mist)", lineHeight: 1.7, opacity: 0.8,
      }}>{type.desc}</div>
    </div>
  );
}
