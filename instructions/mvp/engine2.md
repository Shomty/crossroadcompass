# Project: Synthesis Engine (Astrology SaaS)
## GitHub Copilot Context & Instructions

### 1. Project Overview
This project is a Next.js (React) SaaS application that synthesizes Western and Vedic astrology to provide "Decision Support" metrics. 
The core feature is the `SynthesisLayer`, which aggregates data from two distinct engines:
- **Vedic Engine:** Pre-existing backend logic handling Jyotish calculations (Dashas, Yogas).
- **Western Engine:** Built using `openastrology-library` handling Tropical calculations (Transits, Progressions).

### 2. Coding Standards
- **Rules:**
  - Write strictly typed TypeScript code. Avoid `any`.
  - Prefer functional, pure components.
  - Separate business logic (astrology math) from UI components.
  - Assume all timestamps are UTC.
  - Do not use placeholder data; implement the actual math formulas provided below.

### 3. Core Algorithm: Psychological Readiness Score (Western)
When asked to implement the `calculatePsychologicalScore` function, strictly follow this weighting system to calculate the "internal pressure" score (capped at 10) based on active transits.

**Formula per active transit (max orb 3°):**
`TransitScore = TriggerStrength * AspectTension * TargetSensitivity`

**A. Trigger Strength (Transiting Planet)**
- Uranus (`Ura`) or Pluto (`Plu`) = 3
- Saturn (`Sat`) or Neptune (`Nep`) = 2
- Jupiter (`Jup`) = 1
- *Ignore all other transiting planets.*

**B. Aspect Tension**
- Hard Aspects (Conjunction `0°`, Square `90°`, Opposition `180°`) = 2
- Soft Aspects (Trine `120°`, Sextile `60°`) = 1
- *Ignore all other aspects.*

**C. Target Sensitivity (Natal Point)**
- Luminaries/Angles (Sun, Moon, Ascendant, Midheaven) = 1.5
- Inner Planets (Mercury, Venus, Mars) = 1.0

**Final Output:**
Sum all active `TransitScore` values. 
`TotalScore = Math.min(Sum(TransitScore), 10)`

## 2. Key SaaS Features (The User Value)
* **Dynamic Birth Data Sync:** A global settings modal. When a user updates their birth time or location, Query instantly invalidates the local cache, triggering a background recalculation in both the Western and Vedic engines without a page reload.
* **The "Crossroads" Dashboard:** The main UI. Instead of overwhelming the user with raw astrological charts, it displays a unified "Opportunity Score" (1 to 10) for different life areas (Career, Love, Relocation).
* **Synthesis Feed:** A timeline view highlighting specific timeframes where Western Transits (e.g., Saturn crossing the Midheaven) intersect with significant Vedic Dasha changes.
* **Automated Insights:** An internal logic layer that reads the data overlap and generates a human-readable verdict. Example: "Your Western transits indicate an internal drive for career change, and your Vedic Jupiter Dasha currently supports financial expansion. Proceed with confidence over the next 6 months."

## 3. Data Flow & Modern Techniques
* **Event-Driven Recalculation:** Instead of heavy synchronous API calls blocking the UI, utilize background jobs to process the complex planetary geometries and Dasha periods asynchronously.
* **Edge Caching:** Cache the generated reports. Astrological data for a specific birth minute does not change. Once a user's 1-year forecast is generated, it should be cached at the db, resulting in instant load times on all subsequent visits.
* **End-to-End Type Safety:** Strict TypeScript implementation. The output of the `openastrology-library` and your Vedic engine must share standardized interfaces (e.g., `PlanetPosition`, `Aspect`, `DashaPeriod`) to make the Synthesis Layer bulletproof and prevent runtime errors.

  - Write strictly typed TypeScript code. Avoid `any`.
  - Prefer functional, pure components.
  - Separate business logic (astrology math) from UI components.
  - Assume all timestamps are UTC.
  - Do not use placeholder data; implement the actual math formulas provided below.