import { useState, useEffect, useRef } from "react";

const types = [
  {
    id: "generator",
    name: "GENERATOR",
    sanskrit: "Srashta",
    aura: "Open Aura",
    question: "Who am I?",
    workStyle: "Work in groups",
    purpose: "HERE TO BUILD",
    key: "Love what you do",
    color: "#E84545",
    glow: "#FF6B6B",
    bg: "radial-gradient(ellipse at 60% 40%, #3D0A0A 0%, #1A0505 60%, #0D0202 100%)",
    accent: "#FF8A8A",
    planet: "Mars",
    chakraColor: "#FF4444",
    desc: "Generators are the life force of the planet. With a defined Sacral center, they possess sustainable energy for work they love.",
    jyotish: "Ruled by Mars — action, drive, and creative force manifest through dedicated work and sacred response.",
    symbols: ["◈", "▽", "◆"],
    orbs: ["#E84545", "#FF6B35", "#C0392B"],
  },
  {
    id: "projector",
    name: "PROJECTOR",
    sanskrit: "Margadarshak",
    aura: "Focused Aura",
    question: "Who is the other?",
    workStyle: "Work 1 to 1",
    purpose: "HERE TO GUIDE",
    key: "Delegate to empower",
    color: "#27AE60",
    glow: "#2ECC71",
    bg: "radial-gradient(ellipse at 40% 60%, #0A2D1A 0%, #051A0D 60%, #020D06 100%)",
    accent: "#6BFFB8",
    planet: "Mercury",
    chakraColor: "#27AE60",
    desc: "Projectors are the natural guides and managers. Their focused aura penetrates and reads others deeply.",
    jyotish: "Ruled by Mercury — perception, wisdom transmission, and the sacred art of seeing through others.",
    symbols: ["◎", "△", "⬡"],
    orbs: ["#27AE60", "#1ABC9C", "#16A085"],
  },
  {
    id: "manifestor",
    name: "MANIFESTOR",
    sanskrit: "Pravartak",
    aura: "Closed Aura",
    question: "Who do I impact?",
    workStyle: "Work alone",
    purpose: "HERE TO LEAD",
    key: "Have creative freedom",
    color: "#F39C12",
    glow: "#F1C40F",
    bg: "radial-gradient(ellipse at 50% 30%, #2D1A00 0%, #1A0E00 60%, #0D0700 100%)",
    accent: "#FFD580",
    planet: "Sun",
    chakraColor: "#F39C12",
    desc: "Manifestors are the initiators — rare beings with the power to act without waiting for permission.",
    jyotish: "Ruled by the Sun — sovereign will, divine authority, and the pure impulse to initiate new cycles.",
    symbols: ["☀", "▲", "◉"],
    orbs: ["#F39C12", "#E67E22", "#D4AC0D"],
  },
  {
    id: "reflector",
    name: "REFLECTOR",
    sanskrit: "Pratibimb",
    aura: "Resistant Aura",
    question: "Who is different?",
    workStyle: "Together yet separate",
    purpose: "HERE TO ASSESS",
    key: "Communicate effectively",
    color: "#5DADE2",
    glow: "#85C1E9",
    bg: "radial-gradient(ellipse at 50% 50%, #071A2D 0%, #030D1A 60%, #01060D 100%)",
    accent: "#A8D8F0",
    planet: "Moon",
    chakraColor: "#5DADE2",
    desc: "Reflectors are the rarest type — mirrors of the community, sampling and reflecting the health of their environment.",
    jyotish: "Ruled by the Moon — all centers open, they are pure lunar mirrors reflecting the cosmos back to itself.",
    symbols: ["☽", "◇", "○"],
    orbs: ["#5DADE2", "#8E44AD", "#2980B9"],
  },
];

function CosmicOrbs({ type, isActive }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "50%" }}>
      {type.orbs.map((color, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
            width: `${60 + i * 20}%`,
            height: `${60 + i * 20}%`,
            top: `${10 + i * 5}%`,
            left: `${10 + i * 5}%`,
            animation: `orb${i} ${4 + i * 1.5}s ease-in-out infinite alternate`,
            opacity: isActive ? 0.9 : 0.5,
            transition: "opacity 0.5s",
          }}
        />
      ))}
    </div>
  );
}

function BodyGraphSVG({ type, isActive }) {
  const c = type.chakraColor;
  const pulse = isActive ? "1" : "0.7";
  return (
    <svg viewBox="0 0 120 180" width="110" height="165" style={{ filter: `drop-shadow(0 0 8px ${c}99)` }}>
      {/* Connecting lines */}
      <g stroke={c} strokeWidth="1" opacity="0.4" fill="none">
        <line x1="60" y1="28" x2="60" y2="55" />
        <line x1="60" y1="72" x2="60" y2="90" />
        <line x1="60" y1="108" x2="60" y2="125" />
        <line x1="60" y1="143" x2="60" y2="160" />
        <line x1="38" y1="90" x2="18" y2="108" />
        <line x1="82" y1="90" x2="102" y2="108" />
        <line x1="38" y1="125" x2="18" y2="143" />
        <line x1="82" y1="125" x2="102" y2="143" />
      </g>
      {/* Head - Crown */}
      <polygon points="60,8 74,28 46,28" fill={c} opacity={pulse} />
      {/* Ajna */}
      <polygon points="60,36 72,55 48,55" fill={c} opacity="0.6" />
      {/* Throat */}
      <rect x="46" y="60" width="28" height="18" rx="4" fill={c} opacity={pulse} />
      {/* G Center - diamond */}
      <rect x="48" y="82" width="24" height="24" rx="3" transform="rotate(45 60 94)" fill={type.id === "reflector" ? "transparent" : c} stroke={c} strokeWidth="1.5" opacity={pulse} />
      {/* Solar Plexus */}
      <rect x="46" y="118" width="28" height="14" rx="3" fill={type.id === "projector" ? "transparent" : c} stroke={c} strokeWidth="1.5" opacity="0.7" />
      {/* Sacral */}
      <rect x="44" y="136" width="32" height="16" rx="3" fill={type.id === "generator" || type.id === "reflector" ? c : "transparent"} stroke={c} strokeWidth="1.5" opacity={pulse} />
      {/* Root */}
      <rect x="46" y="157" width="28" height="12" rx="3" fill={c} opacity="0.5" />
      {/* Side triangles */}
      <polygon points="18,108 38,90 38,125" fill={c} opacity="0.6" />
      <polygon points="102,108 82,90 82,125" fill={c} opacity="0.6" />
      <polygon points="18,143 38,125 38,160" fill={c} opacity="0.4" />
      <polygon points="102,143 82,125 82,160" fill={c} opacity="0.4" />
    </svg>
  );
}

function StarField() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "white",
            opacity: 0.4,
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite alternate`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HumanDesignCards() {
  const [active, setActive] = useState(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #0D0B1A 0%, #050408 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 24px",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lato:wght@300;400&display=swap');
        @keyframes orb0 { from { transform: translate(0,0) scale(1); } to { transform: translate(4px,-6px) scale(1.08); } }
        @keyframes orb1 { from { transform: translate(0,0) scale(1); } to { transform: translate(-5px,4px) scale(1.05); } }
        @keyframes orb2 { from { transform: translate(0,0) scale(1); } to { transform: translate(3px,5px) scale(1.1); } }
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 0.8; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes ringPulse { 0%,100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.04); } }
        @keyframes titleGlow { 0%,100% { text-shadow: 0 0 20px rgba(255,255,255,0.1); } 50% { text-shadow: 0 0 40px rgba(255,255,255,0.3); } }
        .hd-card { transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease; cursor: pointer; }
        .hd-card:hover { transform: translateY(-10px) scale(1.03) !important; }
      `}</style>

      {/* Background cosmic decoration */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 40% at 50% 0%, #1a0d2e22 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48, zIndex: 1 }}>
        <div style={{ fontFamily: "'Cinzel', serif", color: "#C9B46A", fontSize: 11, letterSpacing: 6, marginBottom: 12, opacity: 0.8 }}>
          JYOTISH × HUMAN DESIGN
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          color: "white",
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 700,
          margin: "0 0 12px",
          letterSpacing: 2,
          animation: "titleGlow 4s ease-in-out infinite",
        }}>
          The Four Archetypes
        </h1>
        <p style={{ color: "#8A7FA0", fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: 15, maxWidth: 420, margin: "0 auto" }}>
          Discover your energetic blueprint through the sacred union of Human Design and Vedic wisdom
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 24,
        width: "100%",
        maxWidth: 1100,
        zIndex: 1,
      }}>
        {types.map((type) => {
          const isActive = active === type.id;
          const isHov = hovered === type.id;
          return (
            <div
              key={type.id}
              className="hd-card"
              onClick={() => setActive(isActive ? null : type.id)}
              onMouseEnter={() => setHovered(type.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: type.bg,
                border: `1px solid ${type.color}44`,
                borderRadius: 20,
                padding: "32px 24px",
                position: "relative",
                overflow: "hidden",
                boxShadow: isActive
                  ? `0 0 60px ${type.glow}55, 0 20px 60px rgba(0,0,0,0.6), inset 0 0 40px ${type.color}11`
                  : `0 0 20px ${type.color}22, 0 10px 40px rgba(0,0,0,0.5)`,
                transform: isActive ? "translateY(-10px) scale(1.03)" : "none",
              }}
            >
              <StarField />

              {/* Outer ring */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "110%",
                paddingTop: "110%",
                borderRadius: "50%",
                border: `1px solid ${type.color}22`,
                animation: "ringPulse 3s ease-in-out infinite",
                pointerEvents: "none",
              }} />

              {/* Aura circle */}
              <div style={{
                position: "relative",
                width: 160,
                height: 160,
                margin: "0 auto 24px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${type.color}22 0%, transparent 70%)`,
                border: `2px solid ${type.color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "float 4s ease-in-out infinite",
                boxShadow: `0 0 40px ${type.color}33, inset 0 0 20px ${type.color}11`,
              }}>
                <CosmicOrbs type={type} isActive={isActive || isHov} />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <BodyGraphSVG type={type} isActive={isActive || isHov} />
                </div>

                {/* Symbols orbiting */}
                {type.symbols.map((sym, i) => (
                  <div key={i} style={{
                    position: "absolute",
                    color: type.accent,
                    fontSize: 12,
                    opacity: 0.7,
                    top: i === 0 ? "5%" : i === 1 ? "50%" : "85%",
                    left: i === 0 ? "8%" : i === 1 ? "-8%" : "10%",
                    fontFamily: "sans-serif",
                  }}>{sym}</div>
                ))}
              </div>

              {/* Planet badge */}
              <div style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: `${type.color}22`,
                border: `1px solid ${type.color}55`,
                borderRadius: 20,
                padding: "3px 10px",
                color: type.accent,
                fontSize: 10,
                fontFamily: "'Cinzel', serif",
                letterSpacing: 2,
              }}>
                {type.planet}
              </div>

              {/* Sanskrit name */}
              <div style={{
                textAlign: "center",
                color: type.accent,
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: 3,
                marginBottom: 4,
                opacity: 0.7,
              }}>{type.sanskrit}</div>

              {/* Type name */}
              <h2 style={{
                textAlign: "center",
                color: "white",
                fontFamily: "'Cinzel', serif",
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 4px",
                letterSpacing: 2,
                textShadow: `0 0 20px ${type.color}88`,
              }}>{type.name}</h2>

              {/* Aura type */}
              <div style={{
                textAlign: "center",
                color: type.accent,
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: 12,
                marginBottom: 16,
                opacity: 0.8,
              }}>{type.aura}</div>

              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${type.color}66, transparent)`, margin: "0 0 16px" }} />

              {/* Core question */}
              <div style={{
                textAlign: "center",
                color: "white",
                fontFamily: "'Cinzel', serif",
                fontSize: 13,
                marginBottom: 8,
                fontStyle: "italic",
                opacity: 0.9,
              }}>"{type.question}"</div>

              {/* Work style */}
              <div style={{
                textAlign: "center",
                color: "#8A7FA0",
                fontFamily: "'Lato', sans-serif",
                fontWeight: 300,
                fontSize: 12,
                marginBottom: 16,
              }}>{type.workStyle}</div>

              {/* Purpose pill */}
              <div style={{
                textAlign: "center",
                background: `linear-gradient(135deg, ${type.color}33, ${type.color}11)`,
                border: `1px solid ${type.color}55`,
                borderRadius: 30,
                padding: "6px 20px",
                color: type.accent,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: 3,
                marginBottom: 12,
                fontWeight: 600,
              }}>{type.purpose}</div>

              {/* Key insight */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginBottom: 16,
              }}>
                <span style={{ fontSize: 14 }}>🔑</span>
                <span style={{
                  color: "#D4C4A0",
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 12,
                  fontWeight: 300,
                }}>{type.key}</span>
              </div>

              {/* Expandable content */}
              <div style={{
                overflow: "hidden",
                maxHeight: isActive ? 200 : 0,
                transition: "max-height 0.5s ease",
              }}>
                <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${type.color}44, transparent)`, margin: "0 0 14px" }} />
                <p style={{
                  color: "#A09AB8",
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 300,
                  fontSize: 12,
                  lineHeight: 1.7,
                  textAlign: "center",
                  marginBottom: 10,
                }}>{type.desc}</p>
                <p style={{
                  color: type.accent,
                  fontFamily: "'Lato', sans-serif",
                  fontWeight: 300,
                  fontSize: 11,
                  lineHeight: 1.6,
                  textAlign: "center",
                  fontStyle: "italic",
                  opacity: 0.8,
                }}>{type.jyotish}</p>
              </div>

              {/* Tap hint */}
              <div style={{
                textAlign: "center",
                color: type.color,
                fontSize: 10,
                fontFamily: "'Lato', sans-serif",
                letterSpacing: 2,
                opacity: isActive ? 0 : 0.5,
                transition: "opacity 0.3s",
                marginTop: 8,
              }}>
                {isActive ? "" : "TAP TO REVEAL"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 48,
        textAlign: "center",
        color: "#3D3550",
        fontFamily: "'Cinzel', serif",
        fontSize: 10,
        letterSpacing: 4,
        zIndex: 1,
      }}>
        ◈ HUMAN DESIGN × JYOTISH ◈
      </div>
    </div>
  );
}
