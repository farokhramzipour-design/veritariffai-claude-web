# Export Calculator — Dashboard Feature Specification

> **Version:** 1.0 · **Stack:** React + Vite + Tailwind · **AI:** Claude Sonnet · **Theme:** Dark / Cyber-Industrial

---

## Overview

The Export Calculator Dashboard is a single-page, AI-powered interface that lets traders instantly calculate the full cost of exporting goods between countries. It surfaces live duty rates, HS codes, Rules of Origin, FX rates, and anti-dumping flags — all in one place, with a real-time confidence score that shows how reliable the estimate is.

---

## 1. Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  TOPBAR — Logo · Search · Status Indicators · User Menu      │
├────────────────┬─────────────────────────────────────────────┤
│                │                                             │
│   SIDEBAR      │          MAIN CONTENT AREA                  │
│   Navigation   │   (Calculator · Results · AI Chat)          │
│   + Quick      │                                             │
│   Stats        │                                             │
│                │                                             │
└────────────────┴─────────────────────────────────────────────┘
```

**Responsive Behaviour**
- Desktop (≥1280px): Full sidebar + main content side-by-side
- Tablet (768–1279px): Collapsible sidebar, hamburger toggle
- Mobile (<768px): Bottom navigation bar, stacked panels

---

## 2. Topbar

| Element | Description |
|---|---|
| **Logo + Wordmark** | "ExportCalc" with subtle animated gradient accent |
| **Global Search** | Fuzzy search across past calculations and HS codes |
| **API Status Pills** | Live indicators for UK Tariff API, TARIC, OXR FX — green/amber/red pulse dot |
| **Confidence Pulse** | Mini badge showing average confidence of current session |
| **User Menu** | Avatar, plan badge, settings, logout |

---

## 3. Sidebar Navigation

### Primary Navigation

- **Calculator** — Main input form (default landing view)
- **Results History** — Past calculations with search and filter
- **HS Code Browser** — Explore the HS code tree interactively
- **Rate Tables** — Duty rates by country and category
- **AI Assistant** — Dedicated Claude chat window

### Quick Stats Panel (bottom of sidebar)

```
┌─────────────────────────┐
│  Today's Calculations   │
│  ████████████  24       │
│                         │
│  Avg Confidence         │
│  ███████████░  91%      │
│                         │
│  API Health             │
│  ● UK Tariff   Online   │
│  ● TARIC       Online   │
│  ● OXR FX      Online   │
└─────────────────────────┘
```

---

## 4. Calculator Panel (Core Feature)

The heart of the product. A clean, structured form with AI autofill and real-time feedback.

### 4.1 Natural Language Input

A prominent text area at the top:

```
┌─────────────────────────────────────────────────────────────┐
│  🧠 Describe your shipment...                               │
│                                                             │
│  e.g. "leather shoes from Birmingham to Paris, £2,000"      │
│                                                             │
│  [  Autofill with AI  →  ]                                  │
└─────────────────────────────────────────────────────────────┘
```

- Triggers `/api/hs-lookup` on submit
- AI fills all fields below automatically
- User can override any AI-filled value

### 4.2 Structured Input Fields

| Field | Input Type | AI-Filled | Source |
|---|---|---|---|
| Product Description | Text | ✅ | User input |
| HS Code (8-digit) | Text + lookup button | ✅ | Claude Sonnet |
| Origin Country | Searchable dropdown | ✅ | NL parsing |
| Destination Country | Searchable dropdown | ✅ | NL parsing |
| Declared Value | Number + currency selector | ✅ | NL parsing |
| Gross Weight (kg) | Number | ❌ | Manual |
| Incoterms | Dropdown (EXW/FOB/CIF/DDP) | ❌ | Manual |

### 4.3 HS Code Field — Special Behaviour

- Inline confidence badge next to the field (e.g. `🎯 94%`)
- Click to open HS Code Detail drawer:
  - Full 8-digit code with chapter breakdown
  - AI reasoning / explanation
  - "Override" button to manually enter a different code
  - Link to UK Trade Tariff heading

### 4.4 Calculate Button

- Large, prominent CTA: **"Calculate Export Costs →"**
- Disabled state with tooltip if required fields are empty
- Loading state with animated spinner and step-by-step progress:
  ```
  ✅ HS code classified
  ✅ Duty rate fetched (UK Tariff)
  ✅ FX rate fetched (GBP → EUR)
  ⏳ Checking Rules of Origin...
  ```

---

## 5. Results Panel

Displayed alongside or below the calculator after a successful `/api/calculate` call.

### 5.1 Confidence Score Meter

```
┌─────────────────────────────────────────────┐
│   ESTIMATE CONFIDENCE                        │
│                                             │
│   ████████████████████░░░  91%              │
│                                             │
│   HS Code        ████████  +30%             │
│   Duty Rate      ██████░░  +25%             │
│   Rules of Origin ████░░░  +15%             │
│   VAT Rate       ███░░░░░  +10%             │
│   Anti-Dumping   ██░░░░░░  +8%              │
│   FX Rate        █░░░░░░░  +5%              │
└─────────────────────────────────────────────┘
```

- Animated fill on load
- Each factor is clickable — expands to show source and reasoning
- Colour coding: ≥90% green · 70–89% amber · <70% red

### 5.2 Cost Breakdown Table

| Cost Component | Rate | Amount (GBP) | Amount (EUR) |
|---|---|---|---|
| Declared Value | — | £2,000.00 | €2,340.00 |
| Import Duty | 4.5% | £90.00 | €105.30 |
| Import VAT | 20% | £418.00 | €489.06 |
| Anti-Dumping | 0% | £0.00 | €0.00 |
| **Total Landed Cost** | — | **£2,508.00** | **€2,934.36** |

- Toggle between GBP / EUR / USD
- "i" icons on each row explain how the rate was sourced
- Live FX rate badge with timestamp

### 5.3 Warnings & Flags

Amber/red alert cards appear when:
- Rules of Origin check fails (preferential 0% duty lost)
- Anti-dumping measures detected for HS + origin combo
- HS code confidence is below 75%
- Destination VAT rate is estimated (not live)

Example:
```
⚠️  Rules of Origin — Preferential Rate NOT Applied
    This product may not qualify for TCA 0% duty.
    Standard duty rate of 4.5% has been applied.
    [ View RoO Details ]
```

### 5.4 Rules of Origin Details Card

Expandable section showing:
- TCA product-specific rule for the HS chapter
- AI assessment: Qualifies / Does not qualify / Uncertain
- Confidence of the RoO check
- Recommended action if uncertain

---

## 6. AI Chat Widget

A persistent right-side drawer (or floating button on mobile) powered by Claude Sonnet.

### Capabilities

- **Answer trade questions** — "What documents do I need for this shipment?"
- **Explain results** — "Why is the duty rate 4.5% for this product?"
- **Refine calculations** — "Re-run this with CIF instead of FOB"
- **HS code help** — "Is 6403.51 the right code for leather boots?"
- **RoO guidance** — "What does 'substantial transformation' mean for my product?"

### UI Elements

- Chat history with message timestamps
- AI typing indicator
- "Use this in calculator" button on AI-generated HS codes or values
- Copy button on all AI responses
- Context-aware: AI can see current calculation state

---

## 7. Results History

A table view of all past calculations in the session (Phase 2: persisted to PostgreSQL).

| Column | Description |
|---|---|
| Date/Time | When calculation was run |
| Product | Description snippet |
| Origin → Dest | Country pair |
| HS Code | 8-digit code |
| Total Cost | Landed cost in selected currency |
| Confidence | Score badge |
| Actions | Re-run · Export PDF · Delete |

- Filter by date, country, confidence score
- Sort by any column
- Bulk PDF export

---

## 8. PDF Export

Triggered from Results panel or History table. Calls `react-pdf` to generate a downloadable report.

### Report Contents

1. **Header** — Logo, date, reference number
2. **Shipment Summary** — Product, origin, destination, Incoterms
3. **HS Code** — Code, description, AI confidence, reasoning
4. **Cost Breakdown** — Full table with all components
5. **Confidence Score** — Factor breakdown with sources
6. **Rules of Origin** — AI assessment and TCA rule applied
7. **Warnings** — Any flags raised during calculation
8. **Disclaimer** — "This is an estimate only. Verify with a licensed customs broker."

---

## 9. HS Code Browser (Secondary View)

An interactive explorer for the Harmonized System tariff schedule.

- Chapter → Heading → Subheading → Full code drill-down
- Search by keyword or code number
- Click any code to see its current duty rate for a selected country pair
- "Use in Calculator" button

---

## 10. Rate Tables (Secondary View)

A reference table showing duty rates across countries.

- Filter by HS chapter
- Select origin and destination countries
- Shows: standard rate, preferential rate (if TCA/other agreement applies), VAT rate
- Last updated timestamp per data source
- Export to CSV

---

## 11. Global Status Bar

Fixed at the bottom of the screen (desktop). Shows:
- Last calculation timestamp
- Current FX rates: `GBP/EUR: 1.170 · GBP/USD: 1.262`
- UK Tariff API status
- TARIC API status
- Cache hit rate for current session

---

## 12. Settings Panel

Accessible from user menu.

| Setting | Options |
|---|---|
| Default Currency | GBP / EUR / USD |
| Default Incoterms | EXW / FOB / CIF / DDP |
| AI Confidence Threshold | Warn below: 70% / 80% / 90% |
| PDF Header | Company name, logo upload |
| API Keys | OXR key entry (if self-hosted) |
| Theme | Dark (default) / Light |

---

## 13. Error States & Edge Cases

| Scenario | UI Behaviour |
|---|---|
| UK Tariff API down | Amber warning banner · Fallback to cached rate · Confidence reduced |
| TARIC API down | Same as above for EU destinations |
| OXR FX API down | Use last cached rate (max 24h old) · Show stale timestamp |
| Claude AI timeout | Show partial result · "HS code unavailable — enter manually" |
| HS code not found | Prompt user to enter manually · Show closest AI suggestion |
| RoO check inconclusive | Show "Uncertain" badge · Apply standard rate · Recommend professional review |
| No internet (offline) | Serve last cached data · Full offline banner |

---

## 14. Accessibility & Performance

- WCAG 2.1 AA compliant
- Full keyboard navigation
- Screen reader labels on all interactive elements
- Skeleton loaders for all async data
- Optimistic UI updates where possible
- Redis cache ensures <100ms response for cached duty rates
- Target: First Contentful Paint <1.5s on 4G

---

## 15. Build Priority Mapping

| Phase | Dashboard Features Unlocked |
|---|---|
| Phase 1 — Backend skeleton | API health indicators in topbar and sidebar |
| Phase 2 — Live duty rates | Cost breakdown table · Rate Tables view |
| Phase 3 — AI agent (HS + RoO) | NL input autofill · HS confidence · RoO card · AI Chat |
| Phase 4 — React frontend | Full dashboard live |
| Phase 5 — VPS deployment | Production URL · TLS indicator in status bar |
| Phase 6 — Anti-dumping + excise | Anti-dumping warnings · Excise duty row in cost table |

---

*Export Calculator — Dashboard Spec v1.0 · Generated from architecture-spec.html*
