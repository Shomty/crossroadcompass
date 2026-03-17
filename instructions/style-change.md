# Dharma Compass: Design System & Component Breakdown
**Version:** 1.0 | **Aesthetic:** High-Fidelity Digital Grimoire

> Superseded by `/STYLE_GUIDE.md` as the canonical design source.
> Keep this file as historical context and exploratory notes only.

## 1. Core Design Philosophy
The app is a "Digital Grimoire"—a marriage of ancient wisdom (Astrology/Human Design) and modern precision (Astronomical Data). It must feel **mystical but technical**, **atmospheric but legible**.

---

## 2. Visual Identity (The Style Guide)

### A. Color Palette
| Token | Hex | Tailwind | Usage |
| :--- | :--- | :--- | :--- |
| **Deep Space** | `#050505` | `bg-deep` | Primary background. |
| **Solar Gold** | `#D4AF37` | `text-gold` | Authority, Sun, primary accents. |
| **Cosmic Violet** | `#7C3AED` | `violet-600` | Mysticism, intuition, secondary accents. |
| **Lavender** | `#EDE9FF` | `text-lavender` | Secondary text, soft UI borders. |
| **Glass Surface**| `rgba(255,255,255,0.03)` | `glass-card` | Main component containers. |

### B. Typography
- **The Sage (Serif):** *Playfair Display* or *Cormorant Garamond*. Used for titles and "Human" insights.
- **The Scholar (Sans):** *Inter* or *SF Pro*. Used for general UI and descriptions.
- **The Navigator (Mono):** *JetBrains Mono*. Used for degrees, coordinates, and technical values.

### C. Surface Treatments
- **Glassmorphism:** `backdrop-blur-md` with a `1px` border at `white/8`.
- **The "Violet Glow":** A radial gradient (`from-violet-600/20 to-transparent`) used for high-importance oracle cards.
- **The "Gold Edge":** A `border-l-4 border-accent-gold` used to anchor identity components (Profile Strip).

---

## 3. Component Breakdown

### 1. The Profile Strip (Identity Anchor)
- **Style:** Glass card with a gold left-border.
- **Elements:** 
    - **Avatar:** Violet gradient circle with a lavender glow.
    - **Badges:** Small, pill-shaped tags with low-opacity backgrounds (`bg-violet/10`).
    - **Data Grid:** 4-column layout using monospace labels for "Type", "Strategy", etc.

### 2. Dharma Synthesis (The Oracle)
- **Style:** `violet-card` with an animated "constellation" background.
- **Micro-Interaction:** A "Pulse Dot" (`animate-ping`) next to the "Live" status.
- **Visual:** A circular "Alignment" gauge with a spinning gold border.

### 3. Vimshottari Dasha (The Time Visualizer)
- **Style:** Minimal glass card with astronomical orbit animations.
- **Animation:** Two concentric circles spinning at different speeds (`8s` and `18s`) using `linear` timing.
- **Data:** A custom progress bar using a `gradient-gold` fill.

### 4. The Jyotish Chart (Technical Core)
- **Style:** Symmetrical SVG diamond grid.
- **Interaction:** Hovering over a "House" (diamond segment) triggers a `fill-white/5` transition.
- **Typography:** Monospace glyphs for planets (e.g., `Ma`, `Ju`, `Ve`).

### 5. Precision Data Tables
- **Style:** Clean rows with `border-b border-white/5`.
- **UX:** Hovering a row inverts the text color or adds a subtle `bg-white/5`.

---

## 4. Animation Principles
- **Orbits:** Always `linear` and perpetual.
- **Entrance:** `opacity: 0` to `1` with a slight `y` offset (`20px`).
- **Hover:** Subtle scale (`1.02`) or border-color shift.
