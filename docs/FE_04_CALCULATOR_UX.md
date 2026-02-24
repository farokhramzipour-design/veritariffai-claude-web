# FE_04 — Calculator UX

## Design Philosophy

The calculator is the product. It must be:
- **Fast to complete** — under 3 minutes for a standard shipment
- **Forgiving** — smart defaults, auto-suggestions, inline help
- **Educational** — users learn customs concepts while entering data
- **Trustworthy** — validation errors are specific, not generic

The wizard is a 3-step flow with a persistent sidebar showing the calculation preview.

---

## Overall Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Sidebar (240px)  │  Main Content Area                   │  Preview  │
│                  │                                       │  Panel    │
│ 1 ● Shipment     │  Step content                        │ (320px)   │
│ 2 ○ Line Items   │                                       │           │
│ 3 ○ Calculate    │                                       │           │
│                  │                                       │           │
└─────────────────────────────────────────────────────────────────────┘
```

**Left sidebar:** Step progress indicator (numbered circles, connected line)
**Main area:** Current step form
**Right panel:** Live calculation preview (updates as user types)

On mobile (< 768px): Full-screen single step, no preview panel, progress dots at top.

---

## Step 1: Shipment Setup

### Fields

**Jurisdiction** (required, first field)
- Type: Segmented control (not dropdown)
- Options: `UK` | `EU`
- Default: auto-detect from browser locale, fallback UK
- Visual: Large pill buttons, selected = brand fill
- Help text: "This determines which tariff schedule we use"

**Origin Country** (required)
- Type: Searchable select with flag emoji
- Search: type country name or code → filtered results
- Popular origins pre-listed: 🇨🇳 China, 🇺🇸 USA, 🇩🇪 Germany, 🇮🇳 India, 🇻🇳 Vietnam, 🇧🇩 Bangladesh
- Validation: Must be a valid ISO 3166-1 country code

**Destination Country** (required)
- Pre-filled from Jurisdiction selection (UK → GB, EU → user picks member state)
- If EU selected: show member state picker

**Incoterm** (required)
- Type: Select with icons and short descriptions
- Don't just show codes — show what they mean:
  ```
  EXW — Ex Works (you pay all freight)
  FOB — Free On Board (seller to port, you pay sea freight)
  CIF — Cost, Insurance, Freight (seller covers sea freight)
  DDP — Delivered Duty Paid (seller handles everything)
  ```
- Selected Incoterm drives the customs valuation engine's gap logic
- After selection: show a small callout explaining what costs YOU need to enter vs. what's included in invoice

**Freight Cost** (conditional — depends on Incoterm)
- Show/hide based on Incoterm selection
  - EXW, FOB: show — "Enter estimated sea/air freight to UK border"
  - CIF, DDP: hide — "Freight included in invoice value"
- Type: Currency amount input (see Currency Input component spec)
- Label updates dynamically: "Freight Cost (sea to Felixstowe)" based on port/mode

**Insurance Cost** (conditional)
- Same logic as Freight
- Default: auto-calculate as 0.5% of freight if left empty (with "estimated" note)

**Port of Entry** (optional, Pro)
- Type: Searchable select (LOCODE codes with readable names)
- Examples: "Felixstowe (GBFXT)", "Southampton (GBSOU)", "Heathrow (GBGRA)"
- Lock icon + blur for Free users: "Affects clearance cost estimate — Pro feature"

**Transport Mode** (optional)
- Radio group: 🚢 Sea | ✈️ Air | 🚛 Road | 🚂 Rail
- Affects: clearance cost estimates, inspection risk

**Calculation Date** (optional, advanced)
- Default: today
- Collapsible under "Advanced options"
- Explanation: "Affects which FX rate and tariff measures apply"

### Step 1 Validation
- Cannot proceed to Step 2 without: Jurisdiction, Origin Country, Destination, Incoterm
- Freight required if Incoterm is EXW, FCA, FOB, FAS, CFR

### Step 1 → Step 2 Transition
Button: `[Continue: Add Line Items →]`
- On click: validate → slide to Step 2 with Framer Motion layout animation

---

## Step 2: Line Items

This is the most complex step. Users enter one or more HS code lines.

### Line Item Card

Each line is a card with these fields:

**HS Code** (required)
- Type: Search input with live typeahead
- As user types: call `GET /api/v1/tariff/hs-codes/search?q=...&jurisdiction=UK`
- Typeahead shows: code + description + applicable duty rate
  ```
  8471300000  Portable automatic data processing machines    0%
  8471410000  Other computers, each weighing ≤ 10kg         0%
  8471491000  Personal computers (tower)                     0%
  ```
- After selection: show the official description below the input (confirmation)
- Misclassification warning (Pro): yellow badge "⚠️ Description may not match this heading"
- HS code hint: "Don't know your code? Search by description →" (opens full lookup modal)

**HS Code Lookup Modal** (when user doesn't know their code)
```
Search: [laptop computers          ]  [Search]
─────────────────────────────────────────────
Results:
 Chapter 84 — Nuclear reactors, boilers, machinery
  84.71 — Automatic data processing machines
   8471.30 — Portable machines (< 10kg, with keyboard)
    8471300000 — Portable computers      [Select]
   8471.41 — Other, mono-task
    ...
```
Hierarchical drill-down. Searchable at all levels.

**Description** (required)
- Free text, 3–100 characters
- Used for: audit trail, PDF export, misclassification check

**Invoice Value** (required)
- Currency amount input
- Currency: defaults to USD (most common), changeable
- Tooltip: "Enter the value as shown on your commercial invoice for this line"

**Quantity** (required for supplementary unit)
- Number input
- Unit: auto-populated from HS code's supplementary unit requirement
  - If HS code requires `p/st` (pieces): shows "units" unit
  - If `kg`: shows weight input
  - If no supplementary unit: hide this field
- If required but not provided: soft warning (not hard block for free users)

**Gross Weight (kg)** (required)
- Used for: freight allocation, specific duty calculation per kg
- Default: estimate from quantity if weight-per-unit is known

**Country of Origin** (required)
- Defaults to shipment origin country
- Can override per-line (mixed origin shipments)

**Proof of Origin** (Pro feature indicator)
- Toggle: "I have proof of origin documentation"
- Tooltip: "EUR.1, REX statement, or origin declaration — required for preferential rates"
- If disabled: origin engine will fall back to MFN rate

**Advanced Line Fields** (collapsed by default, "+ More options" to expand)
- Royalties: monetary input
- Assists (buyer-supplied tools/molds): monetary input
- Buying commission: monetary input
- Is related party transaction: toggle

### Multi-line Management

**Add Line Button:** `[+ Add Another HS Code Line]`
- Adds new LineItemCard below with animation
- Free users: show warning after 1 line: "Multiple lines require Pro"
  - Don't block — let them add, but show "⚡ Pro required to calculate multi-line" before step 3

**Reorder Lines:** Drag-and-drop handle on each card (left edge, `GripVertical` icon)

**Duplicate Line:** `⧉` button on each card — copies all fields

**Delete Line:** `×` button — with confirmation for populated lines

**Line Summary Bar (sticky at bottom of Step 2):**
```
3 lines  ·  Total invoice: $47,250.00  ·  Est. customs value: £37,800
```
Updates in real-time as user types.

### Step 2 → Step 3
Button: `[Review & Calculate →]`
- Free multi-line: show upgrade modal intercept first

---

## Step 3: Review & Calculate

### Summary Panel
Before running the calculation, show a review of all inputs:

```
📦 Shipment Summary
──────────────────
From: China (CN)          Incoterm: FOB
To:   United Kingdom      Freight: £1,500
Port: Felixstowe          Insurance: £75

📋 Line Items (2)
──────────────────
#1  8471300000  Laptops         $10,000  10 units  CN
#2  8517120000  Mobile phones   $25,000  50 units  CN

Engines to run:
✅ Classification          ✅ Customs Valuation
✅ Tariff Measure          ✅ Rules of Origin (Pro)
✅ VAT                     ✅ Compliance Check (Pro)
```

Pro engines shown locked for Free users.

**Submit Button:** `[Run Calculation →]`
- Size: XL, full width
- On click → POST to API, transition to loading state

### Loading State (Sync Calculation)
- Inline spinner replacing the submit button
- Progress messages rotate every 800ms:
  ```
  "Validating HS codes..."
  "Fetching live tariff data..."
  "Applying customs valuation rules..."
  "Computing VAT and excise..."
  "Checking compliance flags..."
  "Compiling your results..."
  ```
- Duration: typically 500ms–3s — progress messages make it feel fast

### Loading State (Async Calculation — multi-line Pro)
- Redirect to `/calculator/processing/[taskId]`
- Full-screen animated progress page:
  - Central animated orb (CSS animation, brand green pulsing)
  - "Processing 15 HS lines..."
  - Real-time progress bar from polling API
  - "We'll notify you when ready" (if user navigates away)

---

## Result Page (`/calculator/result/[id]`)

### Layout
```
┌──────────────────────────────────────────────────────────────────┐
│  Header: "Import Cost Analysis"   [Export PDF] [New Calculation] │
├───────────────────────┬──────────────────────────────────────────┤
│  Summary Card         │  Cost Breakdown Chart (donut)            │
│  Confidence Score     │                                          │
│  Landed Cost Total    │                                          │
├───────────────────────┴──────────────────────────────────────────┤
│  Cost Components (cards, 2×3 grid)                               │
├──────────────────────────────────────────────────────────────────┤
│  Line-by-Line Table (expandable rows)                            │
├──────────────────────────────────────────────────────────────────┤
│  Origin & Preference Analysis (Pro / locked for Free)            │
├──────────────────────────────────────────────────────────────────┤
│  Compliance Flags (Pro / locked for Free)                        │
├──────────────────────────────────────────────────────────────────┤
│  Audit Trail (Pro / locked for Free)                             │
└──────────────────────────────────────────────────────────────────┘
```

### Summary Card
```
Your Estimated Landed Cost

£ 14,287.50
──────────────────────────
Confidence Score: ████████░░ 87%

Calculated: today at 14:23 · Jurisdiction: UK · Engines: 6 of 11
```

**Confidence Score Meter:**
- Custom SVG arc, 0–100%
- Color: red (< 70%), amber (70–85%), green (85%+)
- Tooltip explains what affects the score

### Cost Breakdown Card Grid (6 cards)

```
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Customs    │ │ Import     │ │   VAT      │
│ Value      │ │  Duty      │ │            │
│            │ │            │ │            │
│ £11,250    │ │ £ 1,574    │ │ £ 2,565    │
│ CIF border │ │  14.9%     │ │  20%       │
└────────────┘ └────────────┘ └────────────┘
┌────────────┐ ┌────────────┐ ┌────────────┐
│  Excise    │ │ Clearance  │ │ TOTAL      │
│            │ │ & Freight  │ │ LANDED     │
│            │ │            │ │            │
│  £ 0.00    │ │  £ 898     │ │£14,287.50  │
│  N/A       │ │ estimate   │ │            │
└────────────┘ └────────────┘ └────────────┘
```

Numbers animate in with `countUp` on page load.

### Line-by-Line Table (Pro)

| # | HS Code | Description | Customs Value | Duty | Duty Type | VAT | Line Total |
|---|---|---|---|---|---|---|---|
| 1 | 8471300000 | Laptops | £7,500 | £0.00 | 0% MFN | £1,500 | £9,000 |
| 2 | 8517120000 | Phones | £3,750 | £1,574 | 14.9% Anti-dump | £1,065 | £6,389 |

Click row to expand → shows per-engine breakdown for that line.

For Free users: blur rows after first one with "Pro required for multi-line analysis" overlay.

### Pro Feature Sections (Locked State for Free)
Each Pro section shows:
- Real teaser content (actual agreements, real flag descriptions derived from detected HS codes)
- Blurred overlay on the detailed content
- "Unlock with Pro" CTA

Example for Origin Analysis:
```
🔒 Origin & Preference Analysis

Your goods from China (HS: 8517120000) may be subject to 
UK-China anti-dumping duties under Regulation 2023/1812.

[Unlock full origin analysis with Pro →]

Blurred content below: ████████████████████████
                        ████████████████████████
```

### Audit Trail (Pro)

Accordion-style, one row per calculation step:
```
▼ 1. HS Code Validation
   Input: "8471300000", Jurisdiction: UK
   Output: Valid — "Portable automatic data processing machines"
   Supplementary unit: p/st ✓

▼ 2. Customs Valuation
   Invoice value: $10,000 USD → £7,812.50 (HMRC rate: 0.781250)
   Incoterm: FOB — added freight £1,500 + insurance £75 → CIF: £9,387.50
   Packing: included in invoice
   Customs Value: £9,387.50

▼ 3. Tariff Measure — HS 8471300000
   Measure type: Ad Valorem
   Rate: 0% (standard MFN rate, UK Global Tariff)
   Duty: £0.00
   ...
```

### Export Actions
- `[Export PDF]` → Celery task → download link in < 30s
- `[Copy Summary]` → clipboard with formatted text
- `[New Calculation]` → `/calculator` (pre-fill option: "Start fresh" or "Duplicate this")
- `[Save to History]` → auto-saved for authenticated users

---

## Live Preview Panel (Right sidebar, desktop)

Updates in real-time as user types in Steps 1 and 2.

```
📊 Live Estimate

Goods Value (USD)     $10,000
Est. Customs Value    £7,812
Est. Duty             £0 (0%)
Est. VAT              £1,562
────────────────────────────
Est. Landed Cost      ~£10,374

⚡ Powered by live tariff data
   Last updated: 2 hours ago
```

Recalculates on: HS code selection, value change, country change, Incoterm change.
Uses a simplified free-tier estimate (no Auth required).
Shows "~ estimate" notation to indicate it's not the final result.

---

## UX Micro-interactions

**HS Code field:**
- While typing: "Searching..." spinner
- On selection: short haptic-like scale animation `scale(1.02) → scale(1)` + green border pulse
- Supplementary unit auto-populates with a slide-in animation

**Monetary inputs:**
- Format on blur: `10000` → `£10,000.00` with locale formatting
- Currency flag icon in input prefix

**Step progress:**
- Completed steps show a checkmark and are clickable to go back
- Current step has animated progress ring around step number

**Inline help tooltips:**
- `?` icon next to complex labels (Incoterm, Assists, etc.)
- On hover/click: tooltip appears with a 2-sentence explanation + link to docs
- Tooltips never block the field — positioned intelligently

**Validation:**
- Error messages appear below the field, not in an alert banner
- Errors are specific: "HS code not found for UK jurisdiction" not "Invalid input"
- Green checkmark appears on valid fields (only for complex fields, not simple text)
