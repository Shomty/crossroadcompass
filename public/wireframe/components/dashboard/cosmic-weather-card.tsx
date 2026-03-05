"use client";

import { Sparkles } from "lucide-react";
import { GlassCard } from "./glass-card";

export function CosmicWeatherCard() {
  return (
    <GlassCard className="relative overflow-hidden lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
            Cosmic Weather
          </span>
        </div>
        <span className="px-4 py-1.5 bg-amber-500 text-slate-900 text-xs font-semibold rounded-full uppercase tracking-wide">
          Action Phase
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1 space-y-3 lg:space-y-4">
          <h2 className="text-xl lg:text-3xl font-serif leading-tight text-slate-100">
            <span className="text-amber-500">Mars</span> supports bold initiatives today.
          </h2>
          <p className="text-sm lg:text-base text-slate-400 leading-relaxed max-w-md">
            Energy is significantly high for new beginnings and decisive actions. It&apos;s the perfect moment to launch projects you&apos;ve been planning.
          </p>
        </div>

        {/* Mars Image */}
        <div className="relative w-24 h-24 lg:w-48 lg:h-48 flex-shrink-0 self-end lg:self-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 shadow-2xl shadow-orange-500/30">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500 via-orange-400 to-red-500 opacity-80" />
            <div className="absolute top-4 left-6 w-3 h-3 lg:w-6 lg:h-6 rounded-full bg-orange-700/50" />
            <div className="absolute top-8 right-8 w-2 h-2 lg:w-4 lg:h-4 rounded-full bg-red-700/40" />
            <div className="absolute bottom-6 left-8 w-4 h-4 lg:w-8 lg:h-8 rounded-full bg-orange-800/30" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
