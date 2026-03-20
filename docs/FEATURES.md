# Crossroads Compass — Feature Specification

## Pricing Tiers

| Tier | Price | Purpose |
|------|-------|---------|
| FREE | $0 | Hook & impress. Build trust. Capture email. |
| SEEKER | $19.99/mo | Full access to all 12 features. |
| NAVIGATOR | $179.99/yr | Same as Seeker + priority support + community badges. |
| 1:1 Sessions | $150–$300/hr | High-ticket upsell. Booked via Calendly. |

---

## Feature 1: Life Blueprint™ — The Flagship Report

**What it is:** 6-chapter synthesis report combining Jyotish natal chart analysis with Human Design Bodygraph interpretation into a unified narrative.

**Chapters:** (1) Purpose & Dharma, (2) Relationships & Kuta, (3) Career & Artha, (4) Health & Vitality, (5) Shadow & Growth, (6) Timing & Cycles

| Tier | What user sees |
|------|---------------|
| FREE | Full Rashi + Navamsha chart renders + complete HD Bodygraph with Type, Strategy, Authority, Profile, Incarnation Cross name. Chapter 1 (Purpose & Dharma) in full. |
| GLIMPSE | Chapters 2–6 visible as scrollable cards: header + first paragraph readable, everything below blurred with `<GlimpseBlur>` component and "Unlock your full blueprint" CTA. |
| PREMIUM | All 6 chapters fully rendered. PDF export available. |

**API Requirements:**
- Jyotish API: `/natal-chart` (Rashi, Navamsha, all divisional charts)
- HD API: Full Bodygraph calculation
- Claude API: Chapter narrative generation (one prompt per chapter)

**Component files:**
- `app/(dashboard)/blueprint/page.tsx`
- `components/chart/RashiChart.tsx` (existing)
- `components/chart/NavamshaChart.tsx` (existing)
- `components/chart/Bodygraph.tsx` (existing)
- `components/blueprint/ChapterCard.tsx`
- `components/glimpse/GlimpseBlur.tsx`

---

## Feature 2: Dharma Compass™ — Signature Interactive UI

**What it is:** An interactive navigation wheel with 8 directions, each mapping a Jyotish house group to an HD center.

**Direction mapping:**
1. Self/Identity → 1st house + G Center
2. Resources/Worth → 2nd house + Root Center
3. Communication → 3rd house + Throat Center
4. Home/Foundation → 4th house + Emotional Solar Plexus
5. Creativity/Joy → 5th house + Sacral Center
6. Service/Health → 6th house + Spleen Center
7. Relationships → 7th house + G Center (connection axis)
8. Transformation → 8th house + Head/Ajna Centers

| Tier | What user sees |
|------|---------------|
| FREE | Static compass render. Lagna direction highlighted. HD Type icon at center. Tapping directions shows direction name tooltip only. |
| GLIMPSE | Compass animates (gentle rotation on load). 2 directions unlocked (Purpose + Relationships) with 3-sentence AI insight on tap. Other 6 pulse on tap, show lock icon + "Unlock all 8 directions." |
| PREMIUM | Fully interactive. Tap any direction for deep AI narrative. Updates dynamically with current transits. |

**Component files:**
- `components/chart/DharmaCompass.tsx` — Canvas-based with touch/swipe
- `app/(dashboard)/compass/page.tsx`

**This is the MOAT feature.** No competitor has anything like it. Screenshots of this go viral.

---

## Feature 3: Energy Blueprint™ — Bodygraph + Jyotish Overlay

**What it is:** HD Bodygraph with every gate mapped to its Jyotish planetary ruler.

| Tier | What user sees |
|------|---------------|
| FREE | Full Bodygraph render. Defined/undefined centers colored. Type, Strategy, Authority, Profile displayed. Gate numbers on channels. |
| GLIMPSE | Tap any gate → 1-line Jyotish correlation (e.g., "Gate 34 — Power: Ruled by Mars, resonates with your 3rd house"). Full gate report (planet + house + gate + guidance) visible as list but blurred below first 3 gates. |
| PREMIUM | Complete gate-planet mapping. Tap any center for full AI narrative synthesizing HD center meaning with Jyotish house ruler. |

**Data:** Pre-built mapping table of 64 HD gates → planetary rulers (stored as static JSON).

**Component files:**
- `components/chart/Bodygraph.tsx` (enhance existing)
- `components/chart/GateDetail.tsx`
- `lib/humandesign/gateMapping.ts` — static 64-gate correlation table

---

## Feature 4: Karma Timeline™ — Dasha Visualization

**What it is:** Vimshottari Dasha periods rendered as a horizontal scrollable timeline.

| Tier | What user sees |
|------|---------------|
| FREE | Full timeline with all Mahadasha periods (birth to 120 years). Current period highlighted with glow. Each segment: planet name, dates, duration. Past dimmed, future in gradient. |
| GLIMPSE | Current Mahadasha: full AI interpretation (3–4 paragraphs). NEXT Mahadasha: first 2 sentences then hard cut with blur — cliffhanger. All others: title only. |
| PREMIUM | Full drill-down: Mahadasha → Antardasha → Pratyantardasha. Each level has AI narrative. HD cycle overlay. User can annotate timeline with personal life events. |

**Component files:**
- `components/insights/KarmaTimeline.tsx`
- `components/insights/DashaPeriodCard.tsx`
- `app/(dashboard)/timeline/page.tsx`

---

## Feature 5: Transit Pulse™ — Live Planetary Weather

**What it is:** Daily personalized transit analysis against natal chart + HD conditioning.

| Tier | What user sees |
|------|---------------|
| FREE | 2-sentence general Moon transit summary. Same for all users with same Moon sign. |
| GLIMPSE | "7 Personal Transit Insights Today" panel. 3 insights fully visible. 4 remaining show planet icon + lock + "Unlock." User sees WHICH insights are missing. |
| PREMIUM | All 7 transits analyzed. Morning/afternoon/evening splits. HD conditioning overlay. Alerts for significant upcoming transits. |

**Component files:**
- `components/insights/TransitPulse.tsx`
- `components/insights/TransitCard.tsx`
- `components/insights/LockedTransitCard.tsx`
- `app/(dashboard)/transits/page.tsx`

**Cron:** Pre-compute daily transits at midnight UTC.

---

## Feature 6: Daily Alignment™ — Morning Card

**What it is:** Personalized morning guidance with energy forecast, decision timing, and alignment score.

| Tier | What user sees |
|------|---------------|
| FREE | Generic Moon-sign daily tip. Same for everyone with same Moon sign. |
| GLIMPSE | Card shows 3 insights. #1 (Energy Forecast) fully visible. #2 (Decision Window) headline only: "Best decision window: 2:00–4:30 PM" — reasoning locked. #3 fully locked. Push notification: "Your alignment score today: 7.2/10" — cuts off. |
| PREMIUM | Full 5-section card: Energy Forecast, Decision Windows, Relationship Dynamics, Health Focus, Alignment Score with breakdown. |

**Alignment Score Algorithm:**
```
score = baseHarmony(transitAspects, natalPlanets)
  + hdStrategyBonus(currentTransits, userHDType)
  - challengeWeight(hardAspects)
Normalize to 0–10 scale
```

**Component files:**
- `components/insights/DailyAlignmentCard.tsx`
- `components/insights/AlignmentScore.tsx`
- `app/(dashboard)/page.tsx` (dashboard home — shows this first)

---

## Feature 7: Muhurta Finder™ — Electional Astrology

**What it is:** Find auspicious timing windows for life decisions, with HD Strategy overlay.

| Tier | What user sees |
|------|---------------|
| FREE | Locked. Educational teaser about what Muhurta is. Calendar visual with golden windows. |
| GLIMPSE | "Your 3 Best Windows This Week" — dates visible (Tue, Thu, Sat). Exact times + reasoning blurred. Intention categories (Career, Relationships, Health, Finance) shown as locked filters. |
| PREMIUM | Full tool. Select intention → get ranked timing windows with Jyotish reasoning (planetary hours, tithi, nakshatra) + HD Strategy overlay. Google Calendar export. |

**Component files:**
- `components/muhurta/MuhurtaFinder.tsx`
- `components/muhurta/TimingWindow.tsx`
- `app/(dashboard)/muhurta/page.tsx`

---

## Feature 8: Cosmic Chemistry™ — Compatibility

**What it is:** Relationship analysis using 8-fold Kuta matching + HD composite chart.

| Tier | What user sees |
|------|---------------|
| FREE | Locked. Input fields visible but submit requires upgrade. Social proof counter. |
| GLIMPSE | Enter partner data → Overall score (e.g., "78%") + 1 of 8 Kuta dimensions revealed + 1-sentence HD electromagnetic summary. Remaining 7 dimensions blurred. |
| PREMIUM | Full 8-fold Kuta analysis + HD composite chart. Channel connections, attractions, compromises. Shareable results card (social media optimized). |

**The #1 organic growth driver.** People share compatibility scores.

**Component files:**
- `components/chemistry/CompatibilityForm.tsx`
- `components/chemistry/CompatibilityResult.tsx`
- `components/chemistry/ShareCard.tsx`
- `app/(dashboard)/chemistry/page.tsx`

---

## Feature 9: Purpose Decoder™ — Career & Life Purpose

| Tier | What user sees |
|------|---------------|
| FREE | HD Profile + Incarnation Cross name + 10th house lord. Basic. |
| GLIMPSE | One full paragraph on purpose theme. Headers for remaining sections (Ideal Work Environment, Leadership Style, Timing for Career Moves, Archetypes) visible but blurred. |
| PREMIUM | Full synthesis: 10th house chain + HD Profile + Cross + Variable. 3 career archetype matches. Practical next steps. |

---

## Feature 10: Shadow Work Portal™

| Tier | What user sees |
|------|---------------|
| FREE | Locked. Teaser card: "Every chart has a shadow side. Understanding yours is the key to freedom." |
| GLIMPSE | Shadow Theme headline (e.g., "The fear of being truly seen") + 2 sentences. Full shadow map blurred. |
| PREMIUM | Full: 12th house planets + undefined HD centers + Ketu patterns. Journaling prompts, shadow work practices. |

---

## Feature 11: 1:1 Expert Sessions

| Tier | What user sees |
|------|---------------|
| FREE | CTA card with consultant profile. "Want guidance beyond AI?" |
| GLIMPSE | After any blur interaction, secondary CTA: "Or skip the subscription — book a live session." |
| PREMIUM | Integrated Calendly booking. Pre-session AI briefing doc. Post-session follow-up report. |

**Pricing:** Discovery (60min, $150), Deep Dive (90min, $225), Blueprint Walk (60min, $200), Relationship (75min, $250)

---

## Feature 12: Cosmic Circle™ — Community

| Tier | What user sees |
|------|---------------|
| FREE | Locked. Activity feed visible (read-only). Member count as social proof. |
| GLIMPSE | Browse channel names (Generators, Projectors, Saturn Mahadasha). One sample thread per channel. Can't post. |
| PREMIUM | Full access. Channels by HD Type + current Dasha. Monthly live group readings. Challenges. |

---

## Implementation Priority

**Phase 1 (MVP — Weeks 1–6):** Features 1, 3, 4, 5, 6 + Glimpse system + Stripe
**Phase 2 (Monetize — Weeks 7–10):** Features 2, 7, 8, 9, 10
**Phase 3 (Retain — Weeks 11–14):** Features 11, 12 + Community
