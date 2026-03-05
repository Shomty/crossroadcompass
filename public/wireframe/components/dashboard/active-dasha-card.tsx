"use client";

import { GlassCard } from "./glass-card";

const guidanceItems = [
  "Consolidate your career gains and secure positions.",
  "Review long-term investments and savings.",
  "Practice patience in relationships.",
];

export function ActiveDashaCard() {
  return (
    <GlassCard className="relative overflow-hidden">
      {/* Saturn Background */}
      <div className="absolute top-0 right-0 w-32 h-32 lg:w-40 lg:h-40 opacity-20">
        <div className="relative w-full h-full">
          {/* Saturn body */}
          <div className="absolute top-8 right-4 w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-slate-400 to-slate-600" />
          {/* Saturn ring */}
          <div className="absolute top-10 right-0 w-28 h-8 lg:w-36 lg:h-10 border-2 border-slate-500/50 rounded-full transform -rotate-12" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          Current Period
        </p>
        <h3 className="text-3xl lg:text-4xl font-serif text-slate-100 mb-1">Saturn</h3>
        <h3 className="text-3xl lg:text-4xl font-serif text-slate-100 mb-4">Dasha</h3>

        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
          <span className="text-amber-500 font-medium">Focus: Discipline &amp; Structure</span>
        </div>

        <ul className="space-y-3">
          {guidanceItems.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-slate-400 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
