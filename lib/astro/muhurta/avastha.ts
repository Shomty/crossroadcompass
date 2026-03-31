import type { PlanetName, SignNumber } from "@/types";
import type { AvasthaState } from "@/types";
import {
  EXALTATION_SIGN,
  DEBILITATION_SIGN,
  getOwnSigns,
  getPrimaryLord,
} from "@/lib/astro/specialPoints";

const FRIENDLY_SIGNS: Record<
  PlanetName,
  { friends: PlanetName[]; enemies: PlanetName[] }
> = {
  Sun:     { friends: ["Moon", "Mars", "Jupiter"],    enemies: ["Venus", "Saturn"] },
  Moon:    { friends: ["Sun", "Mercury"],            enemies: [] },
  Mars:    { friends: ["Sun", "Moon", "Jupiter"],   enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"],             enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"],      enemies: ["Mercury", "Venus"] },
  Venus:   { friends: ["Mercury", "Saturn"],       enemies: ["Sun", "Moon"] },
  Saturn:  { friends: ["Mercury", "Venus"],        enemies: ["Sun", "Moon", "Mars"] },
  Rahu:    { friends: ["Mercury", "Venus", "Saturn"], enemies: ["Sun", "Moon", "Mars"] },
  Ketu:    { friends: ["Sun", "Moon", "Mars"],      enemies: ["Mercury", "Venus"] },
};

function friendshipFor(planet: PlanetName): { friends: PlanetName[]; enemies: PlanetName[] } {
  if (planet === "Rahu") return FRIENDLY_SIGNS.Saturn;
  if (planet === "Ketu") return FRIENDLY_SIGNS.Mars;
  return FRIENDLY_SIGNS[planet];
}

export function calculateAvastha(
  planet: PlanetName,
  transitSignNumber: SignNumber
): AvasthaState {
  if (getOwnSigns(planet).includes(transitSignNumber)) return "awakened";

  if (EXALTATION_SIGN[planet] === transitSignNumber) return "awakened";

  if (DEBILITATION_SIGN[planet] === transitSignNumber) return "sleeping";

  const signLord = getPrimaryLord(transitSignNumber);
  const friendship = friendshipFor(planet);
  if (friendship.enemies.includes(signLord)) return "sleeping";

  return "active";
}
