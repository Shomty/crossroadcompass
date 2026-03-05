"use client";

import { Settings } from "lucide-react";
import { GlassCard } from "./glass-card";

const phases = [
  { id: "rising", label: "RISING" },
  { id: "peak", label: "PEAK" },
  { id: "setting", label: "SETTING" },
];

const currentPhase = "peak";

export function SadeSatiProgress() {
  return (
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Sade Sati Cycle</h3>
        <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-3">
        <div className="h-1 bg-slate-700/50 rounded-full">
          {/* Progress fill */}
          <div className="h-full w-1/2 bg-gradient-to-r from-slate-600 to-amber-500 rounded-full" />
        </div>
        {/* Progress indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-500 rounded-full shadow-lg shadow-amber-500/50 ring-4 ring-amber-500/20" />
      </div>

      {/* Phase Labels */}
      <div className="flex justify-between mb-6">
        {phases.map((phase) => (
          <span
            key={phase.id}
            className={`text-xs font-medium uppercase tracking-wider ${
              phase.id === currentPhase ? "text-slate-100" : "text-slate-500"
            }`}
          >
            {phase.label}
          </span>
        ))}
      </div>

      {/* Current Phase Info */}
      <div className="bg-slate-800/40 rounded-xl p-4 border-l-4 border-amber-500">
        <p className="text-sm font-semibold text-amber-500 mb-1">Current Phase: Peak (Shani)</p>
        <p className="text-sm text-slate-400">Intense transformation period requiring patience.</p>
      </div>
    </GlassCard>
  );
}
