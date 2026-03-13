. The Component Code (VimshottariDasha.tsx)
This component uses standard Tailwind CSS utility classes and raw SVGs for the planetary glyphs to minimize external dependencies.
code
Tsx
import React from 'react';

/**
 * VimshottariDasha Component
 * 
 * A high-fidelity UI component representing current astrological time cycles.
 * Features a dual-orbit animation (Mahadasha/Antardasha) and a progress tracker.
 */
export const VimshottariDasha = () => {
  return (
    <div className="glass-card p-6 relative flex flex-col h-full overflow-hidden">
      {/* Section Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-gold text-[10px] font-bold tracking-widest uppercase">
          <span className="w-6 h-[1px] bg-gold"></span>
          Current Life Phase
        </div>
        <button 
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-colors bg-white/5" 
          aria-label="View Details"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {/* Dasha Titles */}
      <h3 className="text-3xl font-serif text-white mb-1">Venus Mahadasha</h3>
      <div className="text-gold text-[10px] font-bold tracking-widest uppercase mb-8 flex items-center gap-1">
        Antardasha: Mercury 
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      </div>

      {/* Orbit Animation Engine */}
      <div className="relative h-36 flex items-center justify-center mb-6">
        {/* Center Glyph: The Mahadasha Lord (Venus) */}
        <div className="absolute text-gold/80 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="9" r="5"/>
            <path d="M12 14v7M9 18h6"/>
          </svg>
        </div>

        {/* Inner Orbit: The Antardasha Lord (Mercury) */}
        <div 
          className="absolute w-16 h-16 rounded-full border border-white/10 animate-spin" 
          style={{ animationDuration: '8s', animationTimingFunction: 'linear' }}
        >
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-lavender shadow-[0_0_10px_rgba(167,139,250,0.8)]"></div>
        </div>

        {/* Outer Orbit: The Mahadasha Cycle Progress */}
        <div 
          className="absolute w-28 h-28 rounded-full border border-white/10 animate-spin" 
          style={{ animationDuration: '18s', animationTimingFunction: 'linear', animationDirection: 'reverse' }}
        >
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold shadow-[0_0_12px_rgba(245,158,11,0.8)]"></div>
        </div>
      </div>

      {/* Progress & Timeline */}
      <div className="mt-auto">
        <div className="flex justify-between items-end text-xs mb-2">
          <span className="text-white/30 font-mono">2023</span>
          <span className="text-gold font-bold tracking-wider text-[11px]">34% complete</span>
          <span className="text-white/30 font-mono">2043</span>
        </div>
        
        {/* Custom Progress Bar */}
        <div className="h-1 bg-white/10 rounded-full mb-5 overflow-hidden">
          <div 
            className="h-full bg-gradient-gold rounded-full transition-all duration-1000" 
            style={{ width: '34%' }}
          ></div>
        </div>

        <p className="text-[13px] text-white/40 italic leading-relaxed">
          A 20-year period of beauty, relationships, and creative refinement. You are in the early flowering phase — foundations being laid in quiet.
        </p>
      </div>
    </div>
  );
};
2. Implementation Instructions
To ensure the component renders correctly with the intended "High-Fidelity" look, you must verify the following in your CSS configuration (usually index.css or globals.css):
A. Required Tailwind Theme Extensions
Ensure these colors and gradients are defined in your @theme or tailwind.config.js:
code
CSS
@theme {
  /* Core Colors */
  --color-gold: #D4AF37;
  --color-lavender: #EDE9FF;
  
  /* Custom Gradients */
  --background-image-gradient-gold: linear-gradient(to right, #B8860B, #D4AF37, #F5DEB3);
}
B. The "Glass Card" Utility
The glass-card class is the foundation of the UI. Add this to your global CSS:
code
CSS
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem; /* rounded-2xl */
}
C. Animation Logic
The component uses the standard Tailwind animate-spin. However, for the "Orbit" effect, we apply animation-timing-function: linear inline to prevent the default "ease-in-out" stutter, ensuring a smooth, perpetual astronomical rotation.
3. Usage Pattern
Simply import and drop the component into any grid or flex container. It is designed to be responsive and will fill the height of its parent container (h-full).
code
Tsx
import { VimshottariDasha } from './components/VimshottariDasha';

// Inside your layout:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">
    <VimshottariDasha />
  </div>
  {/* Other components... */}
</div>