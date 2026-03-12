"use client";
/**
 * components/app/TimeColorProvider.tsx
 * Sets CSS variables on :root based on the current time of day.
 * Mirrors the dynamic color system in dharma-compass 2 (reference design).
 *
 * Time phases:
 *   Morning   05–12  — indigo + warm gold
 *   Afternoon 12–17  — sky blue + amber
 *   Evening   17–21  — violet + rose
 *   Night     21–05  — indigo + classic gold
 *
 * Also drifts gradient positions every 10s for a subtle cosmic breathing effect.
 */

import { useEffect } from "react";

type Phase = "morning" | "afternoon" | "evening" | "night";

interface TimeColors {
  accentIndigo: string;
  accentIndioRgb: string;
  accentGoldCool: string;
  grad1Color: string;
  grad2Color: string;
  grad3Color: string;
}

const PHASE_COLORS: Record<Phase, TimeColors> = {
  morning: {
    accentIndigo:   "#818CF8",
    accentIndioRgb: "129, 140, 248",
    accentGoldCool: "#FBBF24",
    grad1Color: "rgba(129, 140, 248, 0.22)",
    grad2Color: "rgba(251, 191, 36, 0.14)",
    grad3Color: "rgba(129, 140, 248, 0.08)",
  },
  afternoon: {
    accentIndigo:   "#60A5FA",
    accentIndioRgb: "96, 165, 250",
    accentGoldCool: "#F59E0B",
    grad1Color: "rgba(59, 130, 246, 0.2)",
    grad2Color: "rgba(245, 158, 11, 0.14)",
    grad3Color: "rgba(96, 165, 250, 0.07)",
  },
  evening: {
    accentIndigo:   "#A78BFA",
    accentIndioRgb: "167, 139, 250",
    accentGoldCool: "#F472B6",
    grad1Color: "rgba(139, 92, 246, 0.24)",
    grad2Color: "rgba(236, 72, 153, 0.14)",
    grad3Color: "rgba(167, 139, 250, 0.09)",
  },
  night: {
    accentIndigo:   "#818CF8",
    accentIndioRgb: "129, 140, 248",
    accentGoldCool: "#D4AF37",
    grad1Color: "rgba(99, 102, 241, 0.15)",
    grad2Color: "rgba(139, 92, 246, 0.10)",
    grad3Color: "rgba(129, 140, 248, 0.06)",
  },
};

function getPhase(hour: number): Phase {
  if (hour >= 5 && hour < 12)  return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function applyColors(colors: TimeColors) {
  const root = document.documentElement;
  root.style.setProperty("--accent-indigo",     colors.accentIndigo);
  root.style.setProperty("--accent-indigo-rgb", colors.accentIndioRgb);
  root.style.setProperty("--accent-gold-cool",  colors.accentGoldCool);
  root.style.setProperty("--grad-1-color",       colors.grad1Color);
  root.style.setProperty("--grad-2-color",       colors.grad2Color);
  root.style.setProperty("--grad-3-color",       colors.grad3Color);
}

function driftGradients() {
  const root = document.documentElement;
  // Drift by ±12% around default anchor points
  const x1 = (Math.random() * 24 - 12).toFixed(1);
  const y1 = (Math.random() * 24 - 12).toFixed(1);
  const x2 = (100 + Math.random() * 24 - 12).toFixed(1);
  const y2 = (Math.random() * 24 - 12).toFixed(1);
  root.style.setProperty("--grad-1-x", `${x1}%`);
  root.style.setProperty("--grad-1-y", `${y1}%`);
  root.style.setProperty("--grad-2-x", `${x2}%`);
  root.style.setProperty("--grad-2-y", `${y2}%`);
}

export function TimeColorProvider() {
  useEffect(() => {
    // Apply immediately
    applyColors(PHASE_COLORS[getPhase(new Date().getHours())]);
    driftGradients();

    // Re-check time every minute
    const colorInterval = setInterval(() => {
      applyColors(PHASE_COLORS[getPhase(new Date().getHours())]);
    }, 60_000);

    // Drift gradients every 10s for cosmic movement
    const driftInterval = setInterval(driftGradients, 10_000);

    return () => {
      clearInterval(colorInterval);
      clearInterval(driftInterval);
    };
  }, []);

  return null;
}
