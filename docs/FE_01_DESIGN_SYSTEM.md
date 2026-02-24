# FE_01 — Design System

## Design Philosophy

**Concept: "The Instrument"**

TradeCalc should feel like a precision instrument — the Bloomberg Terminal meets modern SaaS. Dark, confident, data-rich but never cluttered. Professionals trust tools that look like they were built for professionals.

This is NOT a playful startup aesthetic. This is NOT corporate blue gradients. This is a tool for people moving serious money across borders who need to trust their numbers.

**Tone:** Authoritative · Precise · Dark · Trustworthy · Efficient

---

## Color System

### CSS Variables (globals.css)

```css
:root {
  /* Brand */
  --color-brand-primary: #00C896;      /* Emerald — the action color */
  --color-brand-secondary: #00A37A;    /* Deeper emerald for hover */
  --color-brand-accent: #FFD166;       /* Amber — attention/warning */

  /* Background Scale */
  --color-bg-base: #0A0D12;           /* Near-black canvas */
  --color-bg-surface: #111620;        /* Cards, panels */
  --color-bg-elevated: #1A2030;       /* Dropdowns, modals */
  --color-bg-input: #161C28;          /* Form inputs */
  --color-bg-hover: #1E2738;          /* Hover states on interactive elements */

  /* Border */
  --color-border-subtle: #1E2738;     /* Most borders */
  --color-border-default: #2A3347;    /* Visible borders */
  --color-border-strong: #3D4F6B;     /* Focused inputs, highlights */
  --color-border-brand: #00C896;      /* Brand-colored borders */

  /* Text Scale */
  --color-text-primary: #F0F4FF;      /* Headings, primary content */
  --color-text-secondary: #8899B4;    /* Labels, secondary info */
  --color-text-tertiary: #4D6080;     /* Placeholder, disabled */
  --color-text-brand: #00C896;        /* Brand-colored text */
  --color-text-warning: #FFD166;      /* Warnings */
  --color-text-error: #FF6B6B;        /* Errors */
  --color-text-success: #00C896;      /* Success states */

  /* Data Visualization */
  --color-data-duty: #FF6B6B;         /* Duty costs — red family */
  --color-data-vat: #4DABF7;          /* VAT — blue family */
  --color-data-freight: #FFD166;      /* Freight/clearance — amber */
  --color-data-goods: #00C896;        /* Goods value — brand */
  --color-data-excise: #C084FC;       /* Excise — purple */

  /* Semantic */
  --color-pro-badge: #FFD166;         /* Pro tier indicator */
  --color-pro-badge-bg: rgba(255, 209, 102, 0.12);

  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.6);
  --shadow-brand: 0 0 24px rgba(0, 200, 150, 0.15);
  --shadow-glow: 0 0 0 1px var(--color-brand-primary), 0 0 16px rgba(0, 200, 150, 0.2);
}
```

---

## Typography

### Font Choices

**Display / Headings:** `Syne` (Google Fonts)
- Wide, geometric, architectural — premium data-driven feel
- Used for: Hero headline, section titles, large numbers

**Body / UI:** `DM Sans` (Google Fonts)
- Warm geometric sans — readable at small sizes, friendly but professional
- Used for: Body copy, labels, buttons, input text

**Monospace / Data:** `JetBrains Mono` (Google Fonts)
- Used for: HS codes, monetary amounts, confidence scores, audit trail
- Critical: All financial figures should use monospace to allow column alignment

```css
/* fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Type Scale

| Token | Size | Weight | Font | Line Height | Use |
|---|---|---|---|---|---|
| `display-2xl` | 72px | 800 | Syne | 1.0 | Hero headline |
| `display-xl` | 56px | 700 | Syne | 1.05 | Page titles |
| `display-lg` | 42px | 700 | Syne | 1.1 | Section titles |
| `display-md` | 32px | 600 | Syne | 1.15 | Card titles |
| `heading-lg` | 24px | 600 | DM Sans | 1.3 | Panel titles |
| `heading-md` | 20px | 600 | DM Sans | 1.35 | Subsection |
| `heading-sm` | 16px | 600 | DM Sans | 1.4 | Labels |
| `body-lg` | 18px | 400 | DM Sans | 1.6 | Hero body copy |
| `body-md` | 15px | 400 | DM Sans | 1.6 | Standard body |
| `body-sm` | 13px | 400 | DM Sans | 1.5 | Secondary info |
| `caption` | 11px | 500 | DM Sans | 1.4 | Tags, badges |
| `mono-lg` | 20px | 500 | JetBrains Mono | 1.2 | Large results |
| `mono-md` | 14px | 400 | JetBrains Mono | 1.4 | HS codes, amounts |
| `mono-sm` | 12px | 400 | JetBrains Mono | 1.4 | Compact data |

---

## Component Tokens

### Buttons

```typescript
// Button variants
type ButtonVariant = 
  | 'primary'    // Emerald fill — main CTAs
  | 'secondary'  // Dark fill with border — secondary actions
  | 'ghost'      // Transparent, text only — tertiary actions
  | 'destructive'// Red — delete/cancel actions
  | 'pro'        // Amber gradient — upgrade CTAs

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

// Sizes
sm: h-8  px-3  text-13px
md: h-10 px-4  text-14px  (default)
lg: h-12 px-6  text-15px
xl: h-14 px-8  text-16px  // Hero CTAs only
```

**Primary button style:**
```css
background: var(--color-brand-primary);
color: #0A0D12;
font-weight: 600;
border-radius: var(--radius-md);
transition: all 0.15s ease;

:hover { 
  background: var(--color-brand-secondary); 
  transform: translateY(-1px);
  box-shadow: var(--shadow-brand);
}
:active { transform: translateY(0); }
```

**Pro button style:**
```css
background: linear-gradient(135deg, #FFD166, #FFA500);
color: #0A0D12;
font-weight: 700;
```

### Input Fields

```css
/* Base input */
background: var(--color-bg-input);
border: 1px solid var(--color-border-default);
border-radius: var(--radius-md);
color: var(--color-text-primary);
font-family: var(--font-body);
height: 44px;
padding: 0 12px;
transition: border-color 0.15s ease, box-shadow 0.15s ease;

:focus {
  border-color: var(--color-brand-primary);
  box-shadow: var(--shadow-glow);
  outline: none;
}

:invalid, [data-error] {
  border-color: var(--color-text-error);
}
```

### Cards / Panels

```css
/* Base card */
background: var(--color-bg-surface);
border: 1px solid var(--color-border-subtle);
border-radius: var(--radius-lg);
padding: var(--space-6);

/* Elevated card (modals, dropdowns) */
background: var(--color-bg-elevated);
box-shadow: var(--shadow-lg);

/* Highlight card (featured, selected) */
border-color: var(--color-brand-primary);
box-shadow: var(--shadow-brand);
```

### Badges / Tags

```css
/* Free tier badge */
.badge-free {
  background: rgba(136, 153, 180, 0.12);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-default);
}

/* Pro tier badge */
.badge-pro {
  background: var(--color-pro-badge-bg);
  color: var(--color-pro-badge);
  border: 1px solid rgba(255, 209, 102, 0.3);
}
```

---

## Animation System

All animations use Framer Motion. Principles:
- Duration: 150ms–400ms (UI), 600ms–1200ms (page transitions)
- Easing: `[0.22, 1, 0.36, 1]` for reveal animations (custom spring-like ease)
- Never animate: colors (use opacity instead), layout-triggering props on every scroll

### Standard Variants (reusable Framer Motion objects)

```typescript
// lib/animations.ts

export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
}

// Number counter animation
export const countUp = (from: number, to: number, duration: number = 1.5) => {
  // Use Framer Motion's useMotionValue + useTransform
  // Animate from → to over duration seconds
  // Format: toLocaleString() with currency formatting
}
```

### Page Transition
All (app) routes use a shared Framer Motion layout transition:
```typescript
// components/layout/PageTransition.tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

---

## Responsive Breakpoints

```typescript
// Tailwind config
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Wide desktop
  '2xl': '1440px', // Ultra-wide
}
```

**Design priority:** Desktop-first (1280px primary canvas), then graceful degradation. The calculator is inherently complex and should degrade to a simplified mobile version on < 768px.

---

## Iconography

Use **Lucide React** exclusively. Do not mix icon sets.

Key icons used throughout:
- `Calculator` — calculator entry points
- `TrendingUp` — results, costs going up
- `Shield` — compliance, security
- `Globe` — jurisdiction, international
- `ChevronRight` — navigation, wizard steps
- `Lock` — Pro feature gating
- `Zap` — instant / fast calculation
- `FileText` — audit trail, reports
- `AlertTriangle` — warnings
- `CheckCircle` — success states
- `Loader2` — loading spinner (with `animate-spin`)

All icons at `strokeWidth={1.5}` as default. Do not use `fill` variants.

---

## Data Visualization

### Cost Breakdown Chart
Used in calculation results. Donut/pie chart showing composition of landed cost.

Library: Recharts (`PieChart`)

Color mapping:
```typescript
const COST_COLORS = {
  goods_value: 'var(--color-data-goods)',
  import_duty: 'var(--color-data-duty)',
  vat: 'var(--color-data-vat)',
  excise: 'var(--color-data-excise)',
  clearance: 'var(--color-data-freight)',
}
```

### Confidence Score Meter
Custom SVG arc component. Shows 0–100% with color gradient:
- 0–60%: red
- 60–80%: amber
- 80–95%: brand green
- 95–100%: bright emerald

### Line Item Table
Custom table for per-HS-line results. Features:
- Fixed column widths, monospace for all monetary values
- Sticky header
- Expandable rows (click to show per-engine breakdown)
- Color-coded duty type badges
