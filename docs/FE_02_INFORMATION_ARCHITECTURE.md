# FE_02 — Information Architecture & User Flows

## Site Map

```
/ (Landing Page)
├── /pricing
├── /login
│   └── /login/callback (OAuth redirect)
│
└── (Protected — requires auth)
    ├── /dashboard
    ├── /calculator
    │   ├── Step 1: Shipment Setup
    │   ├── Step 2: Line Items
    │   ├── Step 3: Review & Calculate
    │   └── /calculator/result/[id]
    ├── /history
    └── /settings
        ├── /settings/account
        └── /settings/billing
```

---

## Route Guard Logic

```typescript
// middleware.ts (Next.js)

const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/login/callback']
const AUTH_ROUTES = ['/dashboard', '/calculator', '/history', '/settings']

// If accessing AUTH_ROUTE without valid JWT → redirect to /login?next={current_path}
// If accessing /login with valid JWT → redirect to /dashboard
// On /login/callback → exchange Firebase token → store JWT → redirect to ?next or /dashboard
```

---

## Primary User Flows

### Flow A: Guest → Quick Calculation → Signup

```
Landing Page
  │
  ▼ Click "Try Free Calculator"
  │
  ▼ Calculator: Step 1 (Shipment — no login required)
  │   Enter: origin country, destination, Incoterm, freight cost
  │
  ▼ Calculator: Step 2 (Line Items)
  │   Enter: HS code (with search), invoice value, quantity
  │
  ▼ Calculator: Step 3 (Calculate)
  │   [Login Required Banner appears — "Sign in free to see your results"]
  │   Google OAuth login (1 click)
  │
  ▼ Result Page (basic free result)
  │   Show: basic duty, standard VAT, total
  │   Show: locked Pro sections with preview blur
  │   CTA: "Unlock full analysis — Upgrade to Pro"
  │
  ▼ (Optional) Pricing Page → Stripe Checkout → Pro Access
```

**Key UX decision:** Calculator inputs are accessible WITHOUT login. Login is only required at the result stage. This maximizes conversion by letting users invest in filling out the form before asking them to commit.

---

### Flow B: Returning Pro User → Fast Calculation

```
Dashboard (shows recent calculations)
  │
  ▼ Click "New Calculation" button
  │
  ▼ Calculator: Step 1 (pre-filled with last Incoterm/destination if same)
  │
  ▼ Calculator: Step 2 (HS code search, multiple lines)
  │
  ▼ Calculate (sync for simple, async for multi-line)
  │
  ▼ Result Page (full Pro result)
      Cost breakdown chart
      Per-line table
      Audit trail accordion
      Export PDF button
```

---

### Flow C: Free User Hits Pro Feature

```
Free user on Result Page
  │
  ▼ Sees "Origin & Preference Analysis" section
  │   Section blurred with lock icon overlay
  │   Text: "Your goods from France may qualify for 0% duty under UK-EU TCA"
  │          (Teaser — real HS code detected, real agreement mentioned)
  │   Button: "Unlock with Pro — from £29/mo"
  │
  ▼ Pricing page (pre-scrolled to Pro features, annual toggle on)
  │
  ▼ Stripe Checkout (one page)
  │
  ▼ Success → Return to SAME calculation, now showing full Pro result
```

**Key UX decision:** The teaser text uses real data (the actual HS code's applicable agreement). This makes the upgrade feel immediately valuable, not generic.

---

### Flow D: Multi-line Async Calculation

```
Step 2: Line Items
  │   User adds 15+ lines (HS code, value, quantity each)
  │   UI shows: "Complex shipments are processed in the background (< 2 min)"
  │
  ▼ Step 3: Submit
  │   POST /calculations/async → 202 Accepted
  │   UI switches to "Processing" state with animated progress indicator
  │   Polling every 3 seconds to /calculations/{id}/status
  │
  ▼ Result Ready
      Toast notification + auto-navigate to result page
      (Or: user navigated away → email notification, badge on Dashboard)
```

---

## Navigation Structure

### Top Navigation (Landing / Public)

```
[Logo]                    [Features] [Pricing] [Docs]          [Login] [Try Free →]
```

### App Shell Navigation (Authenticated)

```
Sidebar (240px, collapsible to 64px icon rail)
├── [Logo + wordmark]
├── ─────────────────
├── 📊 Dashboard
├── 🧮 New Calculation
├── 📋 History
├── ─────────────────
├── [Plan Badge: FREE | PRO]
│   └── (Free: "Upgrade to Pro" link)
└── ─────────────────
    ⚙️ Settings
    [User Avatar + Name]
    [Sign Out]
```

**Sidebar collapse behavior:**
- Desktop: persists state in localStorage
- Mobile: slides in as overlay (hamburger trigger)
- Collapsed: show only icons with tooltips

---

## Responsive Behavior

| Breakpoint | Layout Change |
|---|---|
| `< 768px` | Single column. Sidebar becomes bottom sheet. Calculator collapses to single-field-per-screen wizard. |
| `768px–1024px` | Two column. Sidebar icon rail only. |
| `1024px+` | Full layout. Full sidebar expanded. |

### Mobile Calculator (< 768px)
The full wizard is too dense for mobile. On mobile:
- One question per screen (like Typeform-style)
- Swipe/tap to advance
- Progress dots at top
- Simplified: only Free-tier fields shown on mobile (Pro features = desktop recommended notice)

---

## Empty States

Each data-showing page needs a designed empty state:

### Dashboard — No Calculations Yet
- Illustration: abstract customs document/globe (SVG, branded)
- Headline: "Your first calculation is one click away"
- Body: Short explanation of what TCE does
- CTA: "Start New Calculation →"

### History — No History
- Icon: `Clock` (Lucide)
- Headline: "No calculation history yet"
- CTA: "Run your first calculation"

### Result — Calculation Failed
- Icon: `AlertTriangle`
- Headline: "We couldn't complete this calculation"
- Body: Human-friendly error message + specific reason
- CTA: "Try again" or "Contact support"

---

## Error Boundaries

Every page-level component is wrapped in an ErrorBoundary with:
- Friendly message (no technical details shown to user)
- "Reload page" button
- Sentry error capture
- Retain form state in sessionStorage if possible to avoid data loss
