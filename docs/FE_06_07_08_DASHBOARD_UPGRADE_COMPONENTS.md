# FE_06 — Dashboard & History

## Dashboard (`/dashboard`)

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  Welcome back, Jane    [+ New Calculation]    [Plan: PRO badge]  │
├──────────────────┬───────────────────────────────────────────────┤
│  Stat Cards (3)  │  Recent Calculations (list, last 5)           │
├──────────────────┴───────────────────────────────────────────────┤
│  Quick Calculation Widget (repeat last params)                   │
└──────────────────────────────────────────────────────────────────┘
```

### Stat Cards

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Total Calculated │ │ Avg Confidence   │ │ This Month       │
│                  │ │                  │ │                  │
│  £2.3M           │ │  91%             │ │  47 calcs        │
│  across 143 calcs│ │  across all runs │ │  ↑ 12 vs last mo │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```
Numbers use `countUp` animation on first render. Updates on data fetch.

### Recent Calculations List

Each item is a card:
```
┌────────────────────────────────────────────────────────────────┐
│ 🇨🇳→🇬🇧  3 lines                           Feb 23, 2026 14:23   │
│                                                                 │
│ 8471300000 · 8517120000 · 9503001000                           │
│                                                                 │
│ Landed Cost: £47,284    Duty: £4,812    VAT: £9,419            │
│                                          [View] [Duplicate]    │
└────────────────────────────────────────────────────────────────┘
```

- Flag emoji for origin and destination
- Key HS codes shown (truncate to 3 with "+N more")
- Key cost totals in monospace
- "View" → result page, "Duplicate" → opens calculator pre-filled

### Quick Calculation Widget
```
Repeat a previous calculation?

[Shipment Details Dropdown ▼]   [Run Again →]
```
Dropdown shows last 5 calculation inputs. Selecting one pre-fills the calculator.

---

## History Page (`/history`)

### Layout
Full-page table with filters.

### Filter Bar
```
[Search by HS code or description...]  [Origin ▼]  [Date Range ▼]  [Status ▼]
```

### Table Columns
| Date | Origin→Dest | HS Codes | Lines | Landed Cost | Confidence | Status | Actions |
|---|---|---|---|---|---|---|---|
| Feb 23 | CN→GB | 8471... +2 | 3 | £47,284 | 91% | ✅ | View · PDF · Delete |

- Sortable columns: Date (default, desc), Landed Cost, Confidence
- Row click → result page
- Pagination: 20 per page, load-more button
- "PDF" action: download directly if already generated, trigger generation if not

### Free User Truncation
Free users see last 5 calculations. After 5, a row shows:
```
[🔒 Upgrade to Pro for unlimited calculation history]
```

---

## Settings (`/settings`)

### Account Tab
- Display name (editable)
- Email (read-only — from Google)
- Profile picture (from Google)
- Delete account (danger zone, requires typing "DELETE")

### Billing Tab
- Current plan display
- For Pro: subscription details, next billing date, amount
- "Manage Billing" → Stripe Customer Portal link
- For Free: upgrade CTA

### Preferences Tab (optional v2)
- Default jurisdiction
- Default currency display
- Email notifications for async calculation completions


---

# FE_07 — Upgrade & Pricing Flow

## Pricing Page (`/pricing`)

### Layout
Centered, max-width 1100px.

### Billing Toggle
```
Monthly       [●────] Annual   💰 Save 20%
```
Toggle updates all prices inline with smooth number transition.

### Plan Cards

**Free Card:**
```
Free
─────
£0 forever
10 calculations/hour · 1 HS line

For quick estimates
─────────────────
✓ HS code validation
✓ Basic ad valorem duty
✓ Standard VAT (20% UK)
✓ Market FX rate
✓ 10 calcs/hour
─────────────────
[Start Free]
```

**Pro Card (featured, brand border, shadow glow):**
```
Pro              [Most Popular ⭐]
─────
£49/mo          Annual: £39/mo (billed £468)
500 calculations/hour · Up to 500 HS lines

For serious importers and brokers
─────────────────
Everything in Free, plus:
✓ Customs Valuation Engine
✓ Anti-dumping · Safeguard · Quota
✓ Rules of Origin + Preferential Rates
✓ Official HMRC/ECB FX Rates
✓ Excise Duty (Alcohol, Tobacco, Energy)
✓ CBAM / Carbon Border Adjustment
✓ Multi-line invoice (up to 500 lines)
✓ Full Audit Trail
✓ PDF Export
✓ Compliance + Sanction Flags
✓ Unlimited history
✓ Priority support
─────────────────
[Get Pro Access →]
```

### Below Cards: FAQ + Feature Comparison Table
Full feature table (same as landing page but more detailed).

### Money-Back Guarantee Badge
```
🛡️  30-day money-back guarantee
    No questions asked.
```

---

## Stripe Checkout Flow

### Step 1: Click "Get Pro Access"
Frontend creates Stripe Checkout session via `POST /api/v1/subscriptions/checkout`.

### Step 2: Redirect to Stripe
- Stripe-hosted checkout page (not embedded elements — simpler, more trusted)
- Stripe handles: card input, 3D Secure, payment processing

### Step 3: Success Redirect
- Stripe redirects to `https://app.veritariffai.co/upgrade/success?session_id={id}`

### Success Page (`/upgrade/success`)
```
🎉 Welcome to Pro!

You're now on veritariffai Pro.
Your card ending in 4242 has been charged £49.00.

What just unlocked for you:
✅ All 11 calculation engines
✅ Anti-dumping, quotas, origin rules
✅ Up to 500 HS lines per calculation
✅ Full audit trail + PDF export

[Run Your First Pro Calculation →]
```

Animation: Confetti burst (canvas-confetti library, subtle). Auto-redirect to dashboard after 5 seconds if no action.

### Webhook → Plan Update
Backend Stripe webhook updates user.plan → next API call returns new plan claim in JWT refresh → frontend sees Pro access immediately.

---

# FE_08 — Component Library

## Component Inventory

### Primitive Components (`components/ui/`)

#### `Button`
Props: `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, `disabled`, `onClick`
- Loading state replaces text with spinner + "Loading..."
- Disabled state: 50% opacity, no cursor pointer

#### `Input`
Props: `label`, `helpText`, `error`, `prefix`, `suffix`, `required`
- Always has a visible `<label>` (accessibility)
- Error state: red border + error message below
- Prefix/suffix: for currency symbols, icons

#### `CurrencyInput`
Extends `Input`. Props: `currency`, `onCurrencyChange`, `currencies`
- Currency selector in suffix (flag + code, dropdown)
- Auto-formats on blur (e.g., `10000` → `10,000.00`)
- Uses `Intl.NumberFormat` for locale-aware formatting

#### `Select`
Props: `options`, `value`, `onChange`, `searchable`, `placeholder`
- Custom implementation (not native select) for consistent styling
- Searchable variant with `Combobox` from Headless UI

#### `CountrySelect`
Extends `Select`. Features: flag emoji prefix, search by name or ISO code, popular countries at top.

#### `HSCodeSearch`
Complex component. Features:
- Debounced search (300ms) calling `/tariff/hs-codes/search`
- Dropdown with code + description + duty rate preview
- "Browse by category" link to modal
- After selection: official description confirmation badge
- Loading skeleton while fetching

#### `Modal`
Props: `isOpen`, `onClose`, `title`, `size` (sm/md/lg/xl/fullscreen)
- Framer Motion `AnimatePresence` for entry/exit animation
- Focus trap inside modal (accessibility)
- Close on backdrop click and `Escape` key
- `aria-modal="true"`, `role="dialog"`

#### `Tooltip`
Props: `content`, `placement`, `trigger` (hover/click)
- Uses Floating UI for smart placement
- Max-width 280px, dark background

#### `Badge`
Props: `variant` (free/pro/success/warning/error/info), `size`

#### `Tabs`
Props: `tabs`, `activeTab`, `onChange`
- Animated underline indicator (Framer Motion `layoutId`)

#### `Accordion`
Props: `items`, `defaultOpen`, `allowMultiple`
- Smooth height animation with Framer Motion

#### `Toast / Notification`
- Global toast system (Zustand store → portal render)
- Types: success, error, warning, info
- Auto-dismiss: 4s (success), 8s (error), manual for info
- Max 3 toasts visible simultaneously
- Swipe-to-dismiss on mobile

#### `Skeleton`
Loading placeholder for all content types:
- `SkeletonText` — for text lines
- `SkeletonCard` — for cards
- `SkeletonTable` — for tables

#### `ConfidenceScoreMeter`
Props: `score` (0–1), `size` (sm/md/lg)
- Custom SVG arc component
- Color interpolation: red → amber → green
- Animated: arc draws in on mount

#### `CostBreakdownChart`
Props: `data` (key-value pairs), `currency`
- Recharts `PieChart` (donut variant)
- Custom legend below chart
- Animated: segments draw in sequentially
- Hover: segment lifts + tooltip shows amount + percentage

#### `ProFeatureLock`
Props: `featureName`, `teaser`, `children`
- Wraps content with blur overlay if user.plan === 'free'
- Renders teaser text + upgrade CTA
- On upgrade: blur animates away revealing full content

#### `StepIndicator`
Props: `steps`, `currentStep`
- Numbered circles with connecting line
- Completed: checkmark icon, brand fill
- Current: animated ring
- Upcoming: empty, muted

#### `LineItemCard`
Props: `lineNumber`, `data`, `onUpdate`, `onDelete`, `onDuplicate`, `isDragging`
- Drag handle (DnD kit)
- All calculator fields inline
- Collapsible advanced fields section

#### `AuditTrailAccordion`
Props: `steps` (AuditStep[])
- Each step: icon, title, formula description, expandable input/output JSON

### Compound Components (`components/calculator/`, `components/results/`)

#### `CalculatorWizard`
Top-level wizard container. Manages step state, progress, form data, submission.

#### `ResultSummaryCard`
Shows total landed cost, confidence score, meta info.

#### `CostComponentGrid`
6-card grid with animated counters for each cost type.

#### `LineResultsTable`
Sortable, expandable table of per-line results.

#### `UpgradePromptBanner`
Contextual upgrade nudge. Used inline in result sections.

### Landing Components (`components/landing/`)

#### `HeroSection`
Full-viewport hero with animated headline, CTA group, and live demo widget.

#### `LiveDemoWidget`
Mini calculator with real API call. Used in hero.

#### `FeatureComparisonTable`
Free vs Pro table with animated row reveals.

#### `PricingCards`
Two pricing cards with billing toggle.

#### `TestimonialCarousel` (v2)
Customer quotes with auto-scroll.

#### `StatCounter`
Large number with `countUp` animation on viewport entry.

---

## Component Documentation Standards

Every component must have:
1. JSDoc comment with `@description`, `@example`
2. Full TypeScript prop types with JSDoc for each prop
3. Storybook story (at minimum: default, loading, error states)
4. Unit test covering: render, interaction, accessibility

Example:
```typescript
/**
 * @description Displays a customs confidence score as an animated arc meter.
 * Used in calculation results to communicate calculation reliability.
 * @example
 * <ConfidenceScoreMeter score={0.87} size="lg" />
 */
interface ConfidenceScoreMeterProps {
  /** Score value between 0 and 1 */
  score: number
  /** Display size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show the percentage label */
  showLabel?: boolean
}
```
