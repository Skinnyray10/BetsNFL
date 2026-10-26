# Design: NFL Quantum Glass

## Visual World

**Thesis:** Dark glassmorphism meets neubrutalism—precision sports data meets futuristic interface. The visual language combines the transparency and depth of glassmorphism (diffused backgrounds, frosted overlays) with the bold, unapologetic confidence of neubrutalism (thick borders, strong shadows, high contrast).

**Era:** 2026 sports tech with quantum computing aesthetics
**Materials:** Glass overlays with backdrop blur, neon accent lights, bold drop shadows, electric borders
**Atmosphere:** Confident yet analytical, cutting-edge but approachable, data-driven with visual punch

This is NOT a generic dark sports app. The glass effects bring sophistication and depth, while neubrutalist shadows and borders add weight and authority to the predictions.

## Color System

```css
/* Base palette - Deeper blacks than before */
--base-950: #05090d;  /* Deep void */
--base-900: #0a1419;  /* Field night */
--base-800: #0f2028;  /* Turf shadow */
--base-700: #1a2f3a;  /* Mid ground */

/* Neon accents - Vibrant and electric */
--neon-gold: #ffd500;      /* Primary accent, CTAs, highlights */
--neon-green: #00ff88;     /* Winners, positive signals, high confidence */
--neon-cyan: #00d9ff;      /* Away teams, secondary data */
--neon-purple: #b366ff;    /* Tertiary highlights, special states */
--neon-red: #ff3366;       /* Warnings, low confidence, errors */

/* Glass materials */
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-bg-hover: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-border-hover: rgba(255, 213, 0, 0.4);  /* Gold on hover */
--glass-glow: rgba(255, 213, 0, 0.15);

/* Text */
--text-primary: #f4efe4;   /* Off-white, primary text */
--text-secondary: rgba(244, 239, 228, 0.7);
--text-muted: rgba(244, 239, 228, 0.5);
```

**Strategy:** Full palette (4-5 named color roles). Dark base is non-negotiable for a sports betting interface used in various lighting conditions. Neon accents encode critical data: gold for primary actions, green for positive outcomes (high confidence, winners), cyan for neutral data, red for caution.

**Color commits at component scale:** Probability bars use green→cyan gradients. Confidence badges have color-coded backgrounds (green 70%+, gold 50-69%, red below 50%). Cards have colored borders based on prediction strength.

## Typography

```css
/* Display - Bold neubrutalist headlines */
--font-display: 'Inter', 'Sora', sans-serif;
--font-weight-display: 800;
--letter-spacing-display: -0.02em;
--line-height-display: 1.1;

/* Body - Clean glassmorphism readability */
--font-body: 'Inter', system-ui, sans-serif;
--font-weight-body: 400;
--font-weight-body-medium: 500;
--line-height-body: 1.5;

/* Data/Mono - Numbers and stats */
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
--font-weight-mono: 500;

/* Scale */
--text-xs: 0.75rem;     /* 12px - Labels, captions */
--text-sm: 0.875rem;    /* 14px - Body, cards */
--text-base: 1rem;      /* 16px - Standard body */
--text-lg: 1.125rem;    /* 18px - Subheadings */
--text-xl: 1.25rem;     /* 20px - Card titles */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 1.875rem;   /* 30px - Page titles */
--text-4xl: 2.25rem;    /* 36px - Hero display */
```

**Why Inter:** Geometric, modern, excellent at small sizes for data readability. High x-height works well with glassmorphism's subtle contrasts. NOT a category default—chosen for its precision and tech feel, not because it's safe.

**Why JetBrains Mono:** Designed for code/data, superior number distinction (0 vs O, 1 vs l). Probabilities and stakes deserve monospace clarity.

## Glass Effects

```css
/* Base glass card */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Glass hover state */
.glass-hover:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
  box-shadow:
    0 12px 40px rgba(255, 213, 0, 0.3),
    0 0 80px rgba(255, 213, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Glass panel (larger surfaces) */
.glass-panel {
  background: rgba(10, 20, 25, 0.8);
  backdrop-filter: blur(40px) saturate(150%);
  border: 1px solid var(--glass-border);
}
```

**Blur budget:** 20px for cards, 40px for panels. Beyond 40px hurts performance without visual gain.

**When to use glass:** Content containers (cards, modals, panels). NOT for buttons or small controls—those get neubrutalist treatment.

## Neubrutalist Shadows

```css
/* Primary brutal shadow - Gold accent */
.brutal-shadow {
  box-shadow:
    8px 8px 0 rgba(0, 0, 0, 0.9),
    8px 8px 0 2px var(--neon-gold);
}

/* Small brutal shadow */
.brutal-shadow-sm {
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.8),
    4px 4px 0 1px rgba(255, 255, 255, 0.2);
}

/* Brutal button hover */
.brutal-button:hover {
  transform: translate(2px, 2px);
  box-shadow:
    6px 6px 0 rgba(0, 0, 0, 0.9),
    6px 6px 0 2px var(--neon-gold);
}
```

**When to use brutal shadows:** CTAs, primary buttons, featured cards, high-confidence predictions. Creates visual hierarchy and click affordance.

**Interaction pattern:** Hover translates element toward shadow, reducing shadow offset (creates "press in" effect).

## Components

### Glass Card
Base building block for all content containers. Variations: `default` (standard glass), `featured` (thicker border + glow), `interactive` (adds hover state).

### Probability Bar
Horizontal bar with gradient fill (neon-green → neon-cyan), glassmorphism background track, percentage label in monospace. Not just a visual—encodes win probability as width.

### Confidence Gauge
Radial SVG gauge (0-100%) with neon glow on high values. Color-coded:
- 70-100%: neon-green
- 50-69%: neon-gold
- 0-49%: neon-red

### Button
**Primary:** neon-gold background, black text, brutal-shadow, transform on hover
**Secondary:** glass background, white border, no shadow, subtle glow on hover
**Ghost:** transparent, border-only, text-only on hover

### Team Logo
Circular frame with team logo, neon glow effect on hover (glow color = team color). High-confidence predictions get persistent subtle glow.

### Data Card (Stats)
Small glass card with large monospace number, label below. Used for dashboard stats (Total Games, High Confidence Picks, etc.).

### Modal/Overlay
Full-screen glass-panel (blur 40px), centered content card, click-outside-to-close. Entrance animation: fade + scale from 0.95.

### Filter Panel
Slide-out glass panel from right, contains filter controls (tabs, sliders, dropdowns). Brutal tabs for Game Status filter.

### Tabs
Neubrutalist style: thick bottom border (4px) on active tab, neon-gold color. Inactive tabs have subtle glass background.

## Navigation

**Header:** Sticky glass panel with blur, nav links with neon underline on active state. Logo on left, nav center, user actions (if any) right.

**Nav items:** Text-only, no background until hover (then subtle glass). Active state gets neon-gold bottom border (3px).

## Animations

```css
/* Transition speeds */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

/* Easing */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Card hover:** Scale 1.02 + glow increase (200ms ease-out)
**Data loading:** Shimmer gradient animation (1.5s infinite)
**Page transitions:** Fade + slide 20px (300ms)
**Number count-up:** For dashboard stats, animate from 0 to value (800ms ease-out)

**Motion principles:**
1. Data-driven animations (confidence increase = green glow pulse)
2. Hover reveals detail layers (subtitle fades in, shadow grows)
3. Entrance animations stagger (cards appear 50ms apart)
4. No decorative motion—every animation serves comprehension or feedback

## Layout

**Max-width:** 1400px (dashboard needs room for 3-4 column grids)
**Grid:** 12-column for complex layouts, 4-column for cards
**Gaps:**
- Tight: 16px
- Base: 24px
- Loose: 32px
- Section: 48px

**Spacing scale:** 4px base unit (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96)

## Responsive Breakpoints

```css
/* Mobile first */
--breakpoint-sm: 640px;   /* Tablet portrait */
--breakpoint-md: 768px;   /* Tablet landscape */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
```

**Mobile (<640px):** Single column, full-width cards, condensed stats
**Tablet (640-1024px):** 2-column grids, side-by-side comparisons
**Desktop (1024px+):** 3-4 column grids, full charts, filter sidebar

**Glass on mobile:** Reduce blur to 12px (performance), simplify shadows to 2px offset

## Data Visualization Principles

1. **Probability bars:** Always show percentage label, gradient fill encodes magnitude
2. **Confidence gauges:** Radial > linear for space efficiency, color = quick scan
3. **Team comparisons:** Side-by-side layouts, aligned metrics, visual connectors
4. **Trends:** Sparklines (small, inline), full charts for detail pages
5. **Color encoding:** Consistent across all visualizations (green = good, red = caution)

## Honest Risks

1. **Glassmorphism performance:** Backdrop-filter is expensive on mobile. Mitigation: reduce blur on small screens, use `will-change: backdrop-filter` sparingly, limit nesting.

2. **Neubrutalist shadows on mobile:** Large shadows may feel heavy on small screens. Mitigation: scale down shadows below 640px (brutal-shadow-sm becomes default).

3. **High contrast neon + dark:** Accessibility concern for some users. Mitigation: ensure 4.5:1 contrast minimum for all text, provide focus indicators, allow text zoom to 200%.

4. **Visual complexity:** Mixing two strong styles risks incoherence. Mitigation: glass owns containers, brutalism owns actions. Clear hierarchy, no overlap.

## What This Is Not

- NOT a generic dark mode sports app (the glass + brutalism fusion is distinctive)
- NOT a candy-coated Vegas aesthetic (data-driven, not gimmicky)
- NOT flat material design (depth via blur and shadows)
- NOT minimalist white space (information-dense where it serves the user)

## Component Library Structure

```
/src/lib/components/
  /glass/
    GlassCard.svelte
    GlassPanel.svelte
    GlassModal.svelte
  /data/
    ProbabilityBar.svelte
    ConfidenceGauge.svelte
    DataCard.svelte
    SparkLine.svelte
  /brutal/
    Button.svelte
    Tabs.svelte
  /composite/
    TeamLogo.svelte
    GameCard.svelte
    PredictionCard.svelte
    FilterPanel.svelte
    ComparisonChart.svelte
```

Composite components combine glass + brutal elements following the system rules.
