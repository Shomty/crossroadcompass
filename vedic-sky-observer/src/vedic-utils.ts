import { 
  Body, 
  GeoVector, 
  Ecliptic,
  Observer,
  Equator,
  SiderealTime
} from 'astronomy-engine';

// Ayanamsa (Lahiri) - Approximate value for current epoch
export const getAyanamsa = (date: Date): number => {
  const year = date.getFullYear();
  const fraction = (year - 2000) / 100;
  return 23.85 + (1.397 * fraction); // Simplified Lahiri approximation
};

export interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number; // Tropical
  siderealLongitude: number;
  rashi: string;
  nakshatra: string;
  pada: number;
  degree: number;
  minute: number;
  isRetrograde: boolean;
  isCombust: boolean;
  color: string;
  dignity?: string;
  house?: number;
}

export interface Yoga {
  name: string;
  description: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
}

export const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const RASHI_DATA = [
  { lord: "Mars", element: "Fire", quality: "Movable", symbol: "♈" },
  { lord: "Venus", element: "Earth", quality: "Fixed", symbol: "♉" },
  { lord: "Mercury", element: "Air", quality: "Dual", symbol: "♊" },
  { lord: "Moon", element: "Water", quality: "Movable", symbol: "♋" },
  { lord: "Sun", element: "Fire", quality: "Fixed", symbol: "♌" },
  { lord: "Mercury", element: "Earth", quality: "Dual", symbol: "♍" },
  { lord: "Venus", element: "Air", quality: "Movable", symbol: "♎" },
  { lord: "Mars", element: "Water", quality: "Fixed", symbol: "♏" },
  { lord: "Jupiter", element: "Fire", quality: "Dual", symbol: "♐" },
  { lord: "Saturn", element: "Earth", quality: "Movable", symbol: "♑" },
  { lord: "Saturn", element: "Air", quality: "Fixed", symbol: "♒" },
  { lord: "Jupiter", element: "Water", quality: "Dual", symbol: "♓" }
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const PLANETS = [
  { id: Body.Sun, name: "Sun", symbol: "☉", color: "#FFD700" },
  { id: Body.Moon, name: "Moon", symbol: "☽", color: "#F0F8FF" },
  { id: Body.Mars, name: "Mars", symbol: "♂", color: "#FF4500" },
  { id: Body.Mercury, name: "Mercury", symbol: "☿", color: "#00CED1" },
  { id: Body.Jupiter, name: "Jupiter", symbol: "♃", color: "#DAA520" },
  { id: Body.Venus, name: "Venus", symbol: "♀", color: "#FF69B4" },
  { id: Body.Saturn, name: "Saturn", symbol: "♄", color: "#708090" },
];

// Calculate mean lunar node (Rahu)
const getMeanRahuLongitude = (date: Date): number => {
  const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const days = (date.getTime() - J2000.getTime()) / 86400000;
  const T = days / 36525.0;
  // Mean longitude of ascending node
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (1/450000) * T * T * T;
  omega = omega % 360;
  if (omega < 0) omega += 360;
  return omega;
};

export const getAscendant = (date: Date, lat: number, lon: number): number => {
  const gast = SiderealTime(date); // in hours
  let last = gast + (lon / 15); // Local Apparent Sidereal Time in hours
  last = last % 24;
  if (last < 0) last += 24;
  
  const ramc = last * 15 * (Math.PI / 180); // RAMC in radians
  const eps = 23.4392911 * (Math.PI / 180); // Obliquity of ecliptic
  const latRad = lat * (Math.PI / 180);

  const y = Math.cos(ramc);
  const x = -Math.sin(ramc) * Math.cos(eps) - Math.tan(latRad) * Math.sin(eps);
  
  let ascendant = Math.atan2(y, x) * (180 / Math.PI);
  if (ascendant < 0) ascendant += 360;
  
  return ascendant; // Tropical Ascendant
};

const getDignity = (planet: string, rashiIdx: number): string | undefined => {
  switch (planet) {
    case "Sun":
      if (rashiIdx === 0) return "Exalted";
      if (rashiIdx === 6) return "Debilitated";
      if (rashiIdx === 4) return "Own Sign";
      break;
    case "Moon":
      if (rashiIdx === 1) return "Exalted";
      if (rashiIdx === 7) return "Debilitated";
      if (rashiIdx === 3) return "Own Sign";
      break;
    case "Mars":
      if (rashiIdx === 9) return "Exalted";
      if (rashiIdx === 3) return "Debilitated";
      if (rashiIdx === 0 || rashiIdx === 7) return "Own Sign";
      break;
    case "Mercury":
      if (rashiIdx === 5) return "Exalted";
      if (rashiIdx === 11) return "Debilitated";
      if (rashiIdx === 2) return "Own Sign";
      break;
    case "Jupiter":
      if (rashiIdx === 3) return "Exalted";
      if (rashiIdx === 9) return "Debilitated";
      if (rashiIdx === 8 || rashiIdx === 11) return "Own Sign";
      break;
    case "Venus":
      if (rashiIdx === 11) return "Exalted";
      if (rashiIdx === 5) return "Debilitated";
      if (rashiIdx === 1 || rashiIdx === 6) return "Own Sign";
      break;
    case "Saturn":
      if (rashiIdx === 6) return "Exalted";
      if (rashiIdx === 0) return "Debilitated";
      if (rashiIdx === 9 || rashiIdx === 10) return "Own Sign";
      break;
    case "Rahu":
      if (rashiIdx === 1) return "Exalted";
      if (rashiIdx === 7) return "Debilitated";
      break;
    case "Ketu":
      if (rashiIdx === 7) return "Exalted";
      if (rashiIdx === 1) return "Debilitated";
      break;
  }
  return undefined;
};

const formatPlanetPosition = (
  name: string, 
  symbol: string, 
  lon: number, 
  ayanamsa: number, 
  isRetrograde: boolean, 
  color: string,
  isCombust: boolean = false
): PlanetPosition => {
  let siderealLon = (lon - ayanamsa + 360) % 360;
  
  const rashiIdx = Math.floor(siderealLon / 30);
  const degInRashi = siderealLon % 30;
  
  const nakshatraIdx = Math.floor(siderealLon / (360 / 27));
  const degInNak = siderealLon % (360 / 27);
  const pada = Math.floor(degInNak / (360 / (27 * 4))) + 1;
  const dignity = getDignity(name, rashiIdx);

  return {
    name,
    symbol,
    longitude: lon,
    siderealLongitude: siderealLon,
    rashi: RASHIS[rashiIdx],
    nakshatra: NAKSHATRAS[nakshatraIdx],
    pada,
    degree: Math.floor(degInRashi),
    minute: Math.floor((degInRashi % 1) * 60),
    isRetrograde,
    isCombust,
    color,
    dignity
  };
};

export const calculatePositions = (date: Date, lat?: number, lon?: number): PlanetPosition[] => {
  const ayanamsa = getAyanamsa(date);
  const observer = (lat !== undefined && lon !== undefined) ? new Observer(lat, lon, 0) : null;
  
  const positions = PLANETS.map(p => {
    // Get vector (Topocentric if observer provided, else Geocentric)
    const vec = observer 
      ? Equator(p.id, date, observer, false, true).vec 
      : GeoVector(p.id, date, true);
      
    // Convert to ecliptic coordinates
    const ecl = Ecliptic(vec);
    const longitude = ecl.elon; // Tropical longitude 0-360
    
    // Retrograde check
    const vecNext = observer 
      ? Equator(p.id, new Date(date.getTime() + 3600000), observer, false, true).vec
      : GeoVector(p.id, new Date(date.getTime() + 3600000), true);
    const lonNext = Ecliptic(vecNext).elon;
    
    let diff = lonNext - longitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const isRetrograde = diff < 0;

    return formatPlanetPosition(p.name, p.symbol, longitude, ayanamsa, isRetrograde, p.color);
  });

  // Calculate Rahu (North Node)
  const rahuLon = getMeanRahuLongitude(date);
  positions.push(formatPlanetPosition("Rahu", "☊", rahuLon, ayanamsa, true, "#8A2BE2"));

  // Calculate Ketu (South Node)
  const ketuLon = (rahuLon + 180) % 360;
  positions.push(formatPlanetPosition("Ketu", "☋", ketuLon, ayanamsa, true, "#A9A9A9"));

  // Calculate Ascendant (Lagna) if location provided
  if (lat !== undefined && lon !== undefined) {
    const ascLon = getAscendant(date, lat, lon);
    positions.unshift(formatPlanetPosition("Ascendant", "ASC", ascLon, ayanamsa, false, "#10B981"));
  }

  // Calculate Combustion (Asta)
  const sun = positions.find(p => p.name === "Sun");
  if (sun) {
    positions.forEach(p => {
      if (["Sun", "Rahu", "Ketu", "Ascendant"].includes(p.name)) {
        p.isCombust = false;
        return;
      }
      
      let diff = Math.abs(p.siderealLongitude - sun.siderealLongitude);
      if (diff > 180) diff = 360 - diff;
      
      let limit = 0;
      switch (p.name) {
        case "Moon": limit = 12; break;
        case "Mars": limit = 17; break;
        case "Mercury": limit = p.isRetrograde ? 12 : 14; break;
        case "Jupiter": limit = 11; break;
        case "Venus": limit = p.isRetrograde ? 8 : 10; break;
        case "Saturn": limit = 15; break;
      }
      
      p.isCombust = diff <= limit;
    });
  }

  // Calculate Houses (Bhavas) based on Whole Sign system
  const ascendant = positions.find(p => p.name === "Ascendant");
  if (ascendant) {
    const ascRashiIdx = RASHIS.indexOf(ascendant.rashi);
    positions.forEach(p => {
      if (p.name === "Ascendant") {
        p.house = 1;
      } else {
        const pRashiIdx = RASHIS.indexOf(p.rashi);
        p.house = ((pRashiIdx - ascRashiIdx + 12) % 12) + 1;
      }
    });
  }

  return positions;
};

export interface Ashtakavarga {
  bav: Record<string, number[]>;
  sav: number[];
}

const ASHTAKAVARGA_RULES: Record<string, Record<string, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [3, 4, 6, 10, 11, 12]
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Ascendant: [3, 6, 10, 11]
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 3, 6, 10, 11]
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 2, 4, 6, 8, 10, 11]
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Ascendant: [1, 2, 4, 5, 6, 9, 10, 11]
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Ascendant: [1, 2, 3, 4, 5, 8, 9, 11]
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Ascendant: [1, 3, 4, 6, 10, 11]
  }
};

export const calculateAshtakavarga = (positions: PlanetPosition[]): Ashtakavarga => {
  const bav: Record<string, number[]> = {};
  const sav: number[] = new Array(12).fill(0);
  
  const targetPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  const refPlanets = [...targetPlanets, "Ascendant"];
  
  // Get sign indices for all reference planets
  const refIndices: Record<string, number> = {};
  for (const p of positions) {
    if (refPlanets.includes(p.name)) {
      refIndices[p.name] = RASHIS.indexOf(p.rashi);
    }
  }
  
  for (const target of targetPlanets) {
    bav[target] = new Array(12).fill(0);
    
    for (const ref of refPlanets) {
      const refSignIdx = refIndices[ref];
      if (refSignIdx === undefined) continue;
      
      const houses = ASHTAKAVARGA_RULES[target][ref];
      for (const h of houses) {
        const signIdx = (refSignIdx + h - 1) % 12;
        bav[target][signIdx]++;
        sav[signIdx]++;
      }
    }
  }
  
  return { bav, sav };
};

export interface TransitEvent {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  planets: string[];
}

export const analyzeTransits = (positions: PlanetPosition[]): TransitEvent[] => {
  const events: TransitEvent[] = [];
  
  // 1. Dignities
  for (const p of positions) {
    if (p.name === "Ascendant") continue;
    
    if (p.dignity === "Exalted") {
      events.push({
        title: `${p.name} Exalted in ${p.rashi}`,
        description: `${p.name} is operating at its highest potential, bringing strong positive energy related to its significations.`,
        type: 'positive',
        planets: [p.name]
      });
    } else if (p.dignity === "Debilitated") {
      events.push({
        title: `${p.name} Debilitated in ${p.rashi}`,
        description: `${p.name} is in its weakest sign, potentially causing challenges or requiring extra effort in its domains.`,
        type: 'negative',
        planets: [p.name]
      });
    } else if (p.dignity === "Own Sign") {
      events.push({
        title: `${p.name} in Own Sign (${p.rashi})`,
        description: `${p.name} is comfortable and strong in its own sign, providing stability and positive results.`,
        type: 'positive',
        planets: [p.name]
      });
    }
    
    if (p.isRetrograde && !["Rahu", "Ketu"].includes(p.name)) {
      events.push({
        title: `${p.name} Retrograde`,
        description: `The energy of ${p.name} is directed inward. Past issues related to this planet may resurface for re-evaluation.`,
        type: 'neutral',
        planets: [p.name]
      });
    }
    
    if (p.isCombust) {
      events.push({
        title: `${p.name} Combust`,
        description: `${p.name} is too close to the Sun, potentially diminishing its outward expression or causing frustration.`,
        type: 'negative',
        planets: [p.name, "Sun"]
      });
    }
  }
  
  // 2. Conjunctions (Planets in the same Rashi)
  const rashiMap: Record<string, PlanetPosition[]> = {};
  for (const p of positions) {
    if (p.name === "Ascendant") continue;
    if (!rashiMap[p.rashi]) rashiMap[p.rashi] = [];
    rashiMap[p.rashi].push(p);
  }
  
  for (const [rashi, planetsInSign] of Object.entries(rashiMap)) {
    if (planetsInSign.length >= 3) {
      events.push({
        title: `Stellium in ${rashi}`,
        description: `A powerful concentration of energy in ${rashi} involving ${planetsInSign.map(p => p.name).join(', ')}. This creates a major focal point in the chart.`,
        type: 'neutral',
        planets: planetsInSign.map(p => p.name)
      });
    } else if (planetsInSign.length === 2) {
      const p1 = planetsInSign[0];
      const p2 = planetsInSign[1];
      
      // Check specific important conjunctions
      if (planetsInSign.some(p => p.name === "Rahu" || p.name === "Ketu")) {
        const node = planetsInSign.find(p => p.name === "Rahu" || p.name === "Ketu")!;
        const other = planetsInSign.find(p => p.name !== "Rahu" && p.name !== "Ketu")!;
        events.push({
          title: `${other.name}-${node.name} Conjunction`,
          description: `The karmic node ${node.name} is amplifying or obscuring the energy of ${other.name} in ${rashi}.`,
          type: 'negative',
          planets: [p1.name, p2.name]
        });
      } else {
        events.push({
          title: `${p1.name}-${p2.name} Conjunction`,
          description: `The energies of ${p1.name} and ${p2.name} are blending together in ${rashi}.`,
          type: 'neutral',
          planets: [p1.name, p2.name]
        });
      }
    }
  }
  
  return events;
};

export const detectYogas = (positions: PlanetPosition[]): Yoga[] => {
  const yogas: Yoga[] = [];
  
  const getPlanet = (name: string) => positions.find(p => p.name === name);
  const getRashiIdx = (name: string) => {
    const p = getPlanet(name);
    return p ? RASHIS.indexOf(p.rashi) : -1;
  };

  const sunRashi = getRashiIdx("Sun");
  const moonRashi = getRashiIdx("Moon");
  const marsRashi = getRashiIdx("Mars");
  const mercuryRashi = getRashiIdx("Mercury");
  const jupiterRashi = getRashiIdx("Jupiter");
  const venusRashi = getRashiIdx("Venus");
  const saturnRashi = getRashiIdx("Saturn");
  const rahuRashi = getRashiIdx("Rahu");
  const ketuRashi = getRashiIdx("Ketu");

  // Budhaditya Yoga
  if (sunRashi !== -1 && mercuryRashi !== -1 && sunRashi === mercuryRashi) {
    yogas.push({
      name: "Budhaditya Yoga",
      description: "Sun and Mercury are conjunct. Bestows intelligence, communication skills, and success.",
      type: "auspicious"
    });
  }

  // Gajakesari Yoga
  if (moonRashi !== -1 && jupiterRashi !== -1) {
    const diff = Math.abs(moonRashi - jupiterRashi);
    if (diff === 0 || diff === 3 || diff === 6 || diff === 9) {
      yogas.push({
        name: "Gajakesari Yoga",
        description: "Jupiter is in a Kendra from the Moon. Brings wealth, intelligence, and lasting fame.",
        type: "auspicious"
      });
    }
  }

  // Chandra-Mangala Yoga
  if (moonRashi !== -1 && marsRashi !== -1) {
    const diff = Math.abs(moonRashi - marsRashi);
    if (diff === 0 || diff === 6) {
      yogas.push({
        name: "Chandra-Mangala Yoga",
        description: "Moon and Mars are conjunct or opposite. Indicates financial prosperity but can cause emotional volatility.",
        type: "neutral"
      });
    }
  }

  // Guru-Chandala Yoga
  if (jupiterRashi !== -1 && rahuRashi !== -1 && jupiterRashi === rahuRashi) {
    yogas.push({
      name: "Guru-Chandala Yoga",
      description: "Jupiter and Rahu are conjunct. Can indicate challenges with traditional wisdom and unconventional beliefs.",
      type: "inauspicious"
    });
  }

  // Grahan Dosha (Solar/Lunar Eclipse combination)
  if (sunRashi !== -1 && (sunRashi === rahuRashi || sunRashi === ketuRashi)) {
    yogas.push({
      name: "Surya Grahan Dosha",
      description: "Sun is conjunct a Lunar Node. Can indicate struggles with authority, vitality, or father figures.",
      type: "inauspicious"
    });
  }
  if (moonRashi !== -1 && (moonRashi === rahuRashi || moonRashi === ketuRashi)) {
    yogas.push({
      name: "Chandra Grahan Dosha",
      description: "Moon is conjunct a Lunar Node. Can indicate emotional turbulence and mental stress.",
      type: "inauspicious"
    });
  }

  // Shani-Mangal Dosha
  if (saturnRashi !== -1 && marsRashi !== -1) {
    const diff = Math.abs(saturnRashi - marsRashi);
    if (diff === 0 || diff === 6) {
      yogas.push({
        name: "Shani-Mangal Dosha",
        description: "Saturn and Mars are conjunct or opposite. Creates intense friction, delays, and explosive energy.",
        type: "inauspicious"
      });
    }
  }

  // Amavasya / Purnima
  if (sunRashi !== -1 && moonRashi !== -1) {
    const diff = Math.abs(sunRashi - moonRashi);
    if (diff === 0) {
      yogas.push({
        name: "Amavasya (New Moon)",
        description: "Sun and Moon are conjunct. A time of low lunar energy, good for introspection.",
        type: "neutral"
      });
    } else if (diff === 6) {
      yogas.push({
        name: "Purnima (Full Moon)",
        description: "Sun and Moon are opposite. High lunar energy, culmination, and emotional peak.",
        type: "auspicious"
      });
    }
  }

  return yogas;
};
