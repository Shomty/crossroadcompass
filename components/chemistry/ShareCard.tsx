"use client";
// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * components/chemistry/ShareCard.tsx
 * Social media optimized share card for compatibility results.
 */

interface ShareCardProps {
  userName: string;
  partnerName: string;
  percentage: number;
  headline: string;
}

export function ShareCard({ userName, partnerName, percentage, headline }: ShareCardProps) {
  const scoreColor = percentage >= 70
    ? "#4ade80"
    : percentage >= 50
      ? "#e8b96a"
      : "#f87171";

  const handleShare = async () => {
    const text = `${userName} & ${partnerName}: ${percentage}% cosmic compatibility! "${headline}" - Discover yours at Crossroads Compass`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cosmic Chemistry",
          text,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(13,18,32,0.9) 0%, rgba(46,31,15,0.6) 100%)",
        border: "1px solid rgba(200,135,58,0.3)",
        borderRadius: 16,
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "rgba(200,135,58,0.7)",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Cosmic Chemistry
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {userName}
        </span>
        <span
          style={{
            margin: "0 10px",
            color: "#c8873a",
          }}
        >
          ♡
        </span>
        <span
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: 16,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {partnerName}
        </span>
      </div>

      <div
        style={{
          fontSize: 42,
          fontFamily: "Cinzel, serif",
          fontWeight: 400,
          color: scoreColor,
          marginBottom: 8,
        }}
      >
        {percentage}%
      </div>

      <p
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: 14,
          fontStyle: "italic",
          color: "rgba(240,220,160,0.8)",
          margin: "0 0 20px",
        }}
      >
        &ldquo;{headline}&rdquo;
      </p>

      <button
        onClick={handleShare}
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          border: "1px solid rgba(200,135,58,0.4)",
          background: "transparent",
          fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          fontSize: 13,
          color: "#e8b96a",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        Share Result
      </button>
    </div>
  );
}
