// STATUS: done | Premium Features - Cosmic Chemistry
/**
 * lib/astro/hdCompositeService.ts
 * Human Design composite chart analysis for relationship compatibility.
 * Analyzes channel connections, electromagnetic attractions, and compromises.
 */

import type { HDChartData, HDCenterName, HDChannel } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────

export interface ChannelConnection {
  channel: string;
  gates: [number, number];
  centers: [HDCenterName, HDCenterName];
  type: "definition" | "electromagnetic" | "companionship" | "dominance";
  description: string;
}

export interface CenterDynamic {
  center: HDCenterName;
  person1Status: "defined" | "undefined";
  person2Status: "defined" | "undefined";
  dynamic: string;
  guidance: string;
}

export interface HDCompositeResult {
  typeDynamic: string;
  authorityInterplay: string;
  channelConnections: ChannelConnection[];
  centerDynamics: CenterDynamic[];
  attractions: string[];
  compromises: string[];
  overallSummary: string;
}

// ─── Channel Definitions ──────────────────────────────────────────────────

const CHANNELS: Record<string, { gates: [number, number]; centers: [HDCenterName, HDCenterName]; name: string }> = {
  "1-8": { gates: [1, 8], centers: ["G", "Throat"], name: "Inspiration" },
  "2-14": { gates: [2, 14], centers: ["G", "Sacral"], name: "The Beat" },
  "3-60": { gates: [3, 60], centers: ["Sacral", "Root"], name: "Mutation" },
  "4-63": { gates: [4, 63], centers: ["Ajna", "Head"], name: "Logic" },
  "5-15": { gates: [5, 15], centers: ["Sacral", "G"], name: "Rhythm" },
  "6-59": { gates: [6, 59], centers: ["SolarPlexus", "Sacral"], name: "Intimacy" },
  "7-31": { gates: [7, 31], centers: ["G", "Throat"], name: "The Alpha" },
  "9-52": { gates: [9, 52], centers: ["Sacral", "Root"], name: "Concentration" },
  "10-20": { gates: [10, 20], centers: ["G", "Throat"], name: "Awakening" },
  "10-34": { gates: [10, 34], centers: ["G", "Sacral"], name: "Exploration" },
  "10-57": { gates: [10, 57], centers: ["G", "Spleen"], name: "Perfected Form" },
  "11-56": { gates: [11, 56], centers: ["Ajna", "Throat"], name: "Curiosity" },
  "12-22": { gates: [12, 22], centers: ["Throat", "SolarPlexus"], name: "Openness" },
  "13-33": { gates: [13, 33], centers: ["G", "Throat"], name: "The Prodigal" },
  "16-48": { gates: [16, 48], centers: ["Throat", "Spleen"], name: "The Wavelength" },
  "17-62": { gates: [17, 62], centers: ["Ajna", "Throat"], name: "Acceptance" },
  "18-58": { gates: [18, 58], centers: ["Spleen", "Root"], name: "Judgment" },
  "19-49": { gates: [19, 49], centers: ["Root", "SolarPlexus"], name: "Synthesis" },
  "20-34": { gates: [20, 34], centers: ["Throat", "Sacral"], name: "Charisma" },
  "20-57": { gates: [20, 57], centers: ["Throat", "Spleen"], name: "The Brainwave" },
  "21-45": { gates: [21, 45], centers: ["Heart", "Throat"], name: "Money" },
  "23-43": { gates: [23, 43], centers: ["Throat", "Ajna"], name: "Structuring" },
  "24-61": { gates: [24, 61], centers: ["Ajna", "Head"], name: "Awareness" },
  "25-51": { gates: [25, 51], centers: ["G", "Heart"], name: "Initiation" },
  "26-44": { gates: [26, 44], centers: ["Heart", "Spleen"], name: "Surrender" },
  "27-50": { gates: [27, 50], centers: ["Sacral", "Spleen"], name: "Preservation" },
  "28-38": { gates: [28, 38], centers: ["Spleen", "Root"], name: "Struggle" },
  "29-46": { gates: [29, 46], centers: ["Sacral", "G"], name: "Discovery" },
  "30-41": { gates: [30, 41], centers: ["SolarPlexus", "Root"], name: "Recognition" },
  "32-54": { gates: [32, 54], centers: ["Spleen", "Root"], name: "Transformation" },
  "34-57": { gates: [34, 57], centers: ["Sacral", "Spleen"], name: "Power" },
  "35-36": { gates: [35, 36], centers: ["Throat", "SolarPlexus"], name: "Transitoriness" },
  "37-40": { gates: [37, 40], centers: ["SolarPlexus", "Heart"], name: "Community" },
  "39-55": { gates: [39, 55], centers: ["Root", "SolarPlexus"], name: "Emoting" },
  "42-53": { gates: [42, 53], centers: ["Sacral", "Root"], name: "Maturation" },
  "47-64": { gates: [47, 64], centers: ["Ajna", "Head"], name: "Abstraction" },
};

// ─── Type Dynamics ────────────────────────────────────────────────────────

function getTypeDynamic(type1: string, type2: string): string {
  const combo = [type1, type2].sort().join(" + ");
  
  const dynamics: Record<string, string> = {
    "Generator + Generator": "High energy partnership built on mutual response. Both need to honor their sacral authority before committing.",
    "Generator + Manifesting Generator": "Dynamic duo with sustainable energy. The MG may move faster - patience and communication are key.",
    "Generator + Manifestor": "Manifestor initiates, Generator sustains. Clear communication about informing is essential.",
    "Generator + Projector": "Projector guides Generator's energy. Recognition and invitation dynamics matter here.",
    "Generator + Reflector": "Generator provides consistent energy; Reflector mirrors health of the connection.",
    "Manifestor + Manifestor": "Two initiators - clear lanes and informing prevents power struggles.",
    "Manifestor + Projector": "Both non-sacral. Projector guides Manifestor's impact when invited.",
    "Manifestor + Reflector": "Manifestor initiates; Reflector reflects the impact. Lunar cycles matter.",
    "Manifesting Generator + Manifesting Generator": "Fast-paced, multi-passionate pair. Both need response time despite speed.",
    "Manifesting Generator + Projector": "MG's energy needs Projector's guidance. Wait for invitations.",
    "Manifesting Generator + Reflector": "MG provides energy; Reflector provides perspective.",
    "Projector + Projector": "Two guides need external energy sources. Recognition is mutual.",
    "Projector + Reflector": "Both non-sacral. Deep wisdom exchange when invited.",
    "Reflector + Reflector": "Rare pairing. Both mirror each other over lunar cycles.",
  };
  
  return dynamics[combo] || "Unique type combination with potential for growth through differences.";
}

// ─── Authority Interplay ──────────────────────────────────────────────────

function getAuthorityInterplay(auth1: string, auth2: string): string {
  if (auth1 === auth2) {
    return `Both partners share ${auth1} authority, creating natural understanding of each other's decision-making process.`;
  }
  
  const hasEmotional = auth1 === "Emotional" || auth2 === "Emotional";
  const hasSacral = auth1 === "Sacral" || auth2 === "Sacral";
  const hasSplenic = auth1 === "Splenic" || auth2 === "Splenic";
  
  if (hasEmotional) {
    return "The Emotional authority partner needs time for clarity. The other can support by creating space for emotional processing.";
  }
  
  if (hasSacral && hasSplenic) {
    return "Sacral responds in the moment; Splenic knows instantly. Honor both tempos.";
  }
  
  return `${auth1} and ${auth2} authorities create a complementary decision-making dynamic.`;
}

// ─── Channel Analysis ─────────────────────────────────────────────────────

function analyzeChannels(chart1: HDChartData, chart2: HDChartData): ChannelConnection[] {
  const connections: ChannelConnection[] = [];
  const gates1 = new Set(chart1.activeGates);
  const gates2 = new Set(chart2.activeGates);
  
  for (const [key, channel] of Object.entries(CHANNELS)) {
    const [g1, g2] = channel.gates;
    const p1HasG1 = gates1.has(g1);
    const p1HasG2 = gates1.has(g2);
    const p2HasG1 = gates2.has(g1);
    const p2HasG2 = gates2.has(g2);
    
    // Definition: both gates activated in one person
    if ((p1HasG1 && p1HasG2) || (p2HasG1 && p2HasG2)) {
      connections.push({
        channel: channel.name,
        gates: channel.gates,
        centers: channel.centers,
        type: "definition",
        description: "Consistent energy available from one partner",
      });
    }
    // Electromagnetic: each person has one gate, completing the channel together
    else if ((p1HasG1 && p2HasG2) || (p1HasG2 && p2HasG1)) {
      connections.push({
        channel: channel.name,
        gates: channel.gates,
        centers: channel.centers,
        type: "electromagnetic",
        description: "Powerful attraction - you complete this energy together",
      });
    }
    // Companionship: both have the same gate
    else if ((p1HasG1 && p2HasG1) || (p1HasG2 && p2HasG2)) {
      connections.push({
        channel: channel.name,
        gates: channel.gates,
        centers: channel.centers,
        type: "companionship",
        description: "Shared understanding through same gate energy",
      });
    }
  }
  
  return connections;
}

// ─── Center Dynamics ──────────────────────────────────────────────────────

function analyzeCenterDynamics(chart1: HDChartData, chart2: HDChartData): CenterDynamic[] {
  const allCenters: HDCenterName[] = [
    "Head", "Ajna", "Throat", "G", "Heart", "Sacral", "SolarPlexus", "Spleen", "Root"
  ];
  
  const dynamics: CenterDynamic[] = [];
  const defined1 = new Set(chart1.definedCenters);
  const defined2 = new Set(chart2.definedCenters);
  
  for (const center of allCenters) {
    const p1Defined = defined1.has(center);
    const p2Defined = defined2.has(center);
    
    let dynamic: string;
    let guidance: string;
    
    if (p1Defined && p2Defined) {
      dynamic = "Both defined";
      guidance = "Consistent energy from both - potential for fixed patterns";
    } else if (!p1Defined && !p2Defined) {
      dynamic = "Both undefined";
      guidance = "Amplified wisdom potential - be aware of conditioning together";
    } else {
      dynamic = "One defined, one undefined";
      guidance = "The defined partner conditions the undefined - awareness needed";
    }
    
    dynamics.push({
      center,
      person1Status: p1Defined ? "defined" : "undefined",
      person2Status: p2Defined ? "defined" : "undefined",
      dynamic,
      guidance,
    });
  }
  
  return dynamics;
}

// ─── Main Export ──────────────────────────────────────────────────────────

/**
 * Analyze HD composite between two charts.
 */
export function analyzeHDComposite(
  chart1: HDChartData,
  chart2: HDChartData
): HDCompositeResult {
  const typeDynamic = getTypeDynamic(chart1.type, chart2.type);
  const authorityInterplay = getAuthorityInterplay(chart1.authority, chart2.authority);
  const channelConnections = analyzeChannels(chart1, chart2);
  const centerDynamics = analyzeCenterDynamics(chart1, chart2);
  
  // Identify attractions (electromagnetic channels)
  const attractions = channelConnections
    .filter(c => c.type === "electromagnetic")
    .map(c => `The ${c.channel} channel creates powerful attraction between your ${c.centers[0]} and ${c.centers[1]} centers`);
  
  // Identify compromises (opposing definitions)
  const compromises: string[] = [];
  const bothDefinedCenters = centerDynamics.filter(
    d => d.person1Status === "defined" && d.person2Status === "defined"
  );
  
  for (const center of bothDefinedCenters) {
    compromises.push(
      `Both have defined ${center.center} - you each have fixed ways in this area. Mutual respect is key.`
    );
  }
  
  const electromagneticCount = channelConnections.filter(c => c.type === "electromagnetic").length;
  const definitionCount = channelConnections.filter(c => c.type === "definition").length;
  
  let overallSummary = "";
  if (electromagneticCount >= 2) {
    overallSummary = "Strong electromagnetic attraction indicates powerful chemistry. This connection has significant pull.";
  } else if (definitionCount >= 3) {
    overallSummary = "Stable foundation with consistent energy patterns. This connection offers reliability.";
  } else {
    overallSummary = "Unique energy dynamics that offer opportunities for growth through difference.";
  }
  
  return {
    typeDynamic,
    authorityInterplay,
    channelConnections,
    centerDynamics,
    attractions,
    compromises,
    overallSummary,
  };
}
