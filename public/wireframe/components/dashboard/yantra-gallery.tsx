"use client";

import { Download, ChevronRight } from "lucide-react";
import { GlassCard } from "./glass-card";

const yantras = [
  {
    id: 1,
    name: "Sri Yantra",
    gradient: "from-amber-900/80 via-amber-800/60 to-amber-950/80",
    hasGeometry: true,
  },
  {
    id: 2,
    name: "Ganesh Yantra",
    gradient: "from-purple-600 via-orange-500 to-amber-500",
    hasGeometry: false,
  },
  {
    id: 3,
    name: "Kali Yantra",
    gradient: "from-blue-500 via-purple-500 to-pink-400",
    hasGeometry: false,
  },
  {
    id: 4,
    name: "Surya Yantra",
    gradient: "from-pink-400 via-rose-400 to-cyan-400",
    hasGeometry: false,
  },
];

function SriYantraSymbol() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full p-4">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500/60" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500/50" />
      {/* Outer triangles pointing down */}
      <polygon points="50,15 85,75 15,75" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500/70" />
      {/* Inner triangles pointing up */}
      <polygon points="50,85 15,25 85,25" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500/70" />
      {/* Center */}
      <circle cx="50" cy="50" r="5" fill="currentColor" className="text-amber-500/50" />
    </svg>
  );
}

export function YantraGallery() {
  return (
    <GlassCard className="lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <h3 className="text-lg font-semibold text-slate-100">Your Yantras</h3>
        <button className="flex items-center gap-1 text-amber-500 text-sm font-medium hover:text-amber-400 transition-colors">
          View All Collection
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Yantra Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {yantras.map((yantra) => (
          <div key={yantra.id} className="group">
            <div className="relative aspect-square rounded-full overflow-hidden mb-3">
              <div className={`absolute inset-0 bg-gradient-to-br ${yantra.gradient}`}>
                {yantra.hasGeometry && (
                  <SriYantraSymbol />
                )}
              </div>
              {/* Download button on mobile */}
              <button className="lg:hidden absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center bg-slate-900/60 rounded-full text-slate-300">
                <Download className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">{yantra.name}</p>
              <button className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
