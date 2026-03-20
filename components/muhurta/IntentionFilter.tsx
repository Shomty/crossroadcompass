"use client";
// STATUS: done | Premium Features - Muhurta Finder
/**
 * components/muhurta/IntentionFilter.tsx
 * Intention category selector for muhurta calculation.
 */

import type { IntentionCategory } from "@/lib/astro/muhurtaService";

interface IntentionFilterProps {
  selected: IntentionCategory;
  onChange: (intention: IntentionCategory) => void;
  disabled?: boolean;
}

const INTENTIONS: { value: IntentionCategory; label: string; icon: string }[] = [
  { value: "general", label: "General", icon: "◇" },
  { value: "career", label: "Career", icon: "⬡" },
  { value: "relationships", label: "Relationships", icon: "♡" },
  { value: "health", label: "Health", icon: "✧" },
  { value: "finance", label: "Finance", icon: "◈" },
  { value: "travel", label: "Travel", icon: "→" },
  { value: "spiritual", label: "Spiritual", icon: "☆" },
];

export function IntentionFilter({ selected, onChange, disabled }: IntentionFilterProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {INTENTIONS.map((intent) => {
        const isSelected = selected === intent.value;
        return (
          <button
            key={intent.value}
            onClick={() => onChange(intent.value)}
            disabled={disabled}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 20,
              border: `1px solid ${isSelected ? "rgba(200,135,58,0.5)" : "rgba(200,135,58,0.15)"}`,
              background: isSelected ? "rgba(200,135,58,0.15)" : "transparent",
              fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
              fontSize: 12,
              color: isSelected ? "#e8b96a" : "rgba(255,255,255,0.6)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: 12 }}>{intent.icon}</span>
            {intent.label}
          </button>
        );
      })}
    </div>
  );
}
