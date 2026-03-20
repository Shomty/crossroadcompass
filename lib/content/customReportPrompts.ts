// STATUS: done | Admin Custom Report Builder
/**
 * lib/content/customReportPrompts.ts
 * Builds Gemini prompts for AI-generated report sections.
 */

import type { ReportVariable } from "@/types";
import type { HDChartData } from "@/types";

const SYSTEM_INSTRUCTION = `You are a thoughtful consultant synthesising Human Design and Vedic Astrology for an adult at a life crossroads.

Rules you must follow without exception:
- NEVER use prediction language: "you will", "this will cause", "this means you will"
- Use instead: "this period tends to bring", "you may notice", "this theme often shows up as"
- Use warm, specific, practical language — no mystical or woo framing
- Define every astrological or Human Design term on first use, e.g. "Your Sacral authority (the gut-level yes/no response)..."
- End with a concrete, practical implication or action
- 200–300 words
- Return plain text only. No markdown. No bullet points.`;

export function buildCustomSectionPrompt(
  variable: ReportVariable,
  chartData: {
    hd: HDChartData | null;
    vedic: Record<string, unknown> | null;
    dashas: unknown;
  }
): string {
  const hd = chartData.hd;
  const vedic = chartData.vedic;
  const dashas = chartData.dashas;

  switch (variable) {
    case "dasha_guidance": {
      const dashaStr = dashas ? JSON.stringify(dashas, null, 2) : "No dasha data available.";
      return `${SYSTEM_INSTRUCTION}

Write a practical dasha guidance section for this person.

Human Design context:
- Type: ${hd?.type ?? "Unknown"}
- Strategy: ${hd?.strategy ?? "Unknown"}
- Authority: ${hd?.authority ?? "Unknown"}
- Profile: ${hd?.profile ?? "Unknown"}

Active Dasha periods:
${dashaStr}

Focus on how the current Mahadasha (major planetary period) and Antardasha (sub-period) tend to influence this person's energy and decision-making style, filtered through their Human Design type and authority.`;
    }

    case "career_purpose_theme": {
      const crossGates = hd?.incarnationCross
        ? `Gates ${hd.incarnationCross.gates.personalitySun}, ${hd.incarnationCross.gates.personalityEarth}, ${hd.incarnationCross.gates.designSun}, ${hd.incarnationCross.gates.designEarth}`
        : "Not available";
      return `${SYSTEM_INSTRUCTION}

Write a career and purpose theme section for this person.

Human Design context:
- Type: ${hd?.type ?? "Unknown"} (${hd?.strategy ?? "Unknown"})
- Authority: ${hd?.authority ?? "Unknown"}
- Profile: ${hd?.profile ?? "Unknown"}
- Incarnation Cross type: ${hd?.incarnationCross?.type ?? "Unknown"}
- Cross gates: ${crossGates}
- Defined centers: ${hd?.definedCenters?.join(", ") ?? "Unknown"}

Vedic context (if available):
${vedic ? JSON.stringify(vedic, null, 2).slice(0, 500) : "No Vedic data available."}

Describe the career and purpose themes that tend to arise for this specific combination of HD type, profile, and cross. What kinds of work environments and roles tend to align with their energy? What tends to drain them?`;
    }

    case "relationship_theme": {
      return `${SYSTEM_INSTRUCTION}

Write a relationship theme section for this person.

Human Design context:
- Type: ${hd?.type ?? "Unknown"} (${hd?.strategy ?? "Unknown"})
- Authority: ${hd?.authority ?? "Unknown"}
- Profile: ${hd?.profile ?? "Unknown"}
- Defined centers: ${hd?.definedCenters?.join(", ") ?? "Unknown"}
- Undefined centers: ${hd?.undefinedCenters?.join(", ") ?? "Unknown"}

Describe how this person tends to show up in close relationships — what they naturally offer, where they tend to get conditioned or lose themselves (especially through undefined centers), and how their strategy and authority can guide them to healthier connection patterns.`;
    }

    case "shadow_growth_theme": {
      return `${SYSTEM_INSTRUCTION}

Write a shadow and growth theme section for this person.

Human Design context:
- Type: ${hd?.type ?? "Unknown"}
- Not-Self Theme: ${hd?.notSelfTheme ?? "Unknown"}
- Authority: ${hd?.authority ?? "Unknown"}
- Profile: ${hd?.profile ?? "Unknown"}
- Undefined centers: ${hd?.undefinedCenters?.join(", ") ?? "Unknown"}

The Not-Self Theme for this person is: ${hd?.notSelfTheme ?? "Unknown"}. Describe what this shadow pattern tends to look like in daily life, what tends to trigger it, and what the growth edge looks like when they move through it. Be specific and non-judgmental.`;
    }

    case "monthly_focus": {
      const today = new Date();
      const monthName = today.toLocaleString("en-US", { month: "long", year: "numeric" });
      const dashaStr = dashas ? JSON.stringify(dashas, null, 2).slice(0, 400) : "No dasha data available.";
      return `${SYSTEM_INSTRUCTION}

Write a monthly focus section for ${monthName}.

Human Design context:
- Type: ${hd?.type ?? "Unknown"} (${hd?.strategy ?? "Unknown"})
- Authority: ${hd?.authority ?? "Unknown"}
- Profile: ${hd?.profile ?? "Unknown"}

Active Dasha context:
${dashaStr}

What tends to be the energetic theme or opportunity for this person in ${monthName}, given their HD wiring and current Dasha period? What one area of life tends to benefit most from their attention this month, and what is a simple, practical way to work with that energy?`;
    }

    default:
      return `${SYSTEM_INSTRUCTION}\n\nProvide a brief overview for the variable: ${variable}.`;
  }
}
