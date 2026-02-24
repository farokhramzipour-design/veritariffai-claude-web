# AGENT PROMPT — TradeCalc Landing Page Implementation
# Ready-to-paste prompt for your AI coding agent (Cursor, Claude Code, Windsurf, etc.)
# ─────────────────────────────────────────────────────────────────────────────────

---

You are implementing the **complete landing page** for TradeCalc — a customs-grade trade cost engine for importers, freight forwarders, and customs brokers. This is a $50M-evaluated B2B SaaS product. The implementation must be **production-quality**, visually **stunning**, and **fully functional** with no placeholders.

Deliver a single file: `landing.html` — a self-contained, zero-dependency HTML page using only inline CSS and vanilla JavaScript. No frameworks, no npm, no build step. The page must work by opening the file in a browser.

---

## DESIGN IDENTITY

**Concept: "The Instrument"**
Think Bloomberg Terminal meets Stripe. Dark, precise, data-confident. This is NOT a generic startup page. It is a tool that professionals trust with serious money. Every pixel must communicate accuracy and authority.

**Mood:** Authoritative · Precise · Dark · Trustworthy · Efficient
**NOT:** Playful · Purple gradients · Corporate blue · Generic SaaS

---

## EXACT TECH SPEC

**Fonts** (load from Google Fonts CDN):
- `Syne` (weights: 600, 700, 800) — all headings, hero text, large numbers
- `DM Sans` (weights: 400, 500, 600) — all body text, UI labels, buttons
- `JetBrains Mono` (weights: 400, 500) — ALL monetary values, HS codes, data output

**Icons:** Use Unicode/emoji or inline SVG only. No icon libraries.

**Animations:** CSS keyframes + vanilla JS IntersectionObserver. No GSAP, no libraries.

**Colors (exact hex values — do not deviate):**
```
Background canvas:    #0A0D12
Surface (cards):      #111620
Elevated (modals):    #1A2030
Input background:     #161C28
Hover state:          #1E2738
Border subtle:        #1E2738
Border default:       #2A3347
Border strong:        #3D4F6B
Brand primary:        #00C896  ← The emerald. Use for CTAs, highlights, active states
Brand hover:          #00A37A
Accent/warning:       #FFD166  ← Amber. Use sparingly for Pro badge, attention
Text primary:         #F0F4FF
Text secondary:       #8899B4
Text tertiary:        #4D6080
Text brand:           #00C896
Error/duty:           #FF6B6B
VAT blue:             #4DABF7
Freight amber:        #FFD166
Excise purple:        #C084FC
```

---

## PAGE STRUCTURE — IMPLEMENT ALL SECTIONS IN ORDER

### SECTION 1: NAVIGATION
Sticky top nav, 68px height, `backdrop-filter: blur(16px)` on scroll.

**Left:** SVG logo — a globe arc intersecting a calculator grid. Wordmark "TradeCalc" in Syne 700. The dot in the logo is #00C896.

**Center links:** How It Works · Features · Pricing (DM Sans 500, #8899B4, hover → #F0F4FF with 0.2s transition)

**Right:** "Login" (ghost) + "Try Free Calculator →" (primary button, #00C896 fill, #0A0D12 text)

**Scroll behavior:** On scroll > 80px, nav background transitions from `transparent` to `rgba(10,13,18,0.95)` with `border-bottom: 1px solid #1E2738`. Smooth CSS transition.

---

### SECTION 2: HERO — The centerpiece. This section must be extraordinary.

**Background:**
```css
background: 
  radial-gradient(ellipse 80% 60% at 15% 50%, rgba(0,200,150,0.07) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 85% 20%, rgba(77,171,247,0.05) 0%, transparent 55%),
  radial-gradient(ellipse 50% 50% at 65% 85%, rgba(192,132,252,0.04) 0%, transparent 50%),
  #0A0D12;
```

Over this, render a subtle dot grid:
```css
background-image: radial-gradient(circle, #1E2738 1px, transparent 1px);
background-size: 32px 32px;
opacity: 0.6;
```

**Layout:** Two columns. Left 52%: text content. Right 48%: THE CALCULATION ANIMATION WIDGET (see detailed spec below).

**Left content (animate in with staggered fadeUp — each element 80ms after previous):**

1. **Pre-headline badge** (animates first):
   ```
   ● LIVE TARIC + UKGT DATA  ·  UPDATED DAILY
   ```
   Pill shape, border: 1px solid #2A3347, background: rgba(0,200,150,0.06), text: #00C896, font: DM Sans 500 11px, letter-spacing: 0.08em. The ● dot pulses with a CSS animation (scale 1→1.4→1, 2s loop, #00C896).

2. **Main headline** (animates second, 80ms delay):
   ```
   Know exactly what
   your imports cost.
   ```
   Font: Syne 800, 72px desktop / 48px tablet / 36px mobile. Color: #F0F4FF. Line height: 1.0. Each LINE animates separately: clip-path from `inset(0 0 100% 0)` to `inset(0 0 0% 0)`, 0.6s ease-out. Second line delayed 120ms.

3. **Sub-headline** (animates third, 160ms delay):
   ```
   The only trade cost calculator that combines real customs
   valuation, live tariff data, and origin preference rules
   — all in a single calculation.
   ```
   Font: DM Sans 400, 18px. Color: #8899B4. Max-width: 520px. Line height: 1.65.

4. **CTA group** (animates fourth, 240ms delay):
   - Primary: "Calculate Your Import Cost →" — height 52px, padding 0 32px, background #00C896, color #0A0D12, font DM Sans 700 16px, border-radius 8px. Hover: translateY(-2px) + box-shadow: 0 8px 24px rgba(0,200,150,0.25). Transition 0.2s.
   - Secondary: "▷  Watch 2-min Demo" — ghost, border: 1px solid #2A3347, color #8899B4, same height. Hover: border-color #00C896, color #F0F4FF.
   - Below buttons: `DM Sans 400 13px #4D6080`: "No credit card required · Free for single HS code"

5. **Social proof strip** (animates fifth, 320ms delay):
   Three stats separated by `·`:
   ```
   2,400+ importers    ·    98.2% accuracy    ·    £2.3B calculated
   ```
   Numbers: JetBrains Mono 500, #00C896. Labels: DM Sans 400, #8899B4, 13px.
   The numbers use a countUp animation triggered on page load (2 second duration).

---

### THE CALCULATION ANIMATION WIDGET (Right side of hero — THE STAR OF THE PAGE)

This is the most important element. Build a fully animated, looping simulation of a real customs calculation happening in real-time. It must look genuinely functional, not like a static mockup.

**Widget outer container:**
- Width: 440px. Dark card: background #111620, border: 1px solid #2A3347, border-radius: 16px, box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px #1E2738.
- Float in from right on page load: `translateX(40px) opacity(0)` → `translateX(0) opacity(1)`, 0.8s cubic-bezier(0.22,1,0.36,1), delay 0.4s.
- Subtle perpetual float: CSS animation, translateY(0px) → translateY(-8px) → translateY(0px), 6s ease-in-out infinite.

**Widget header bar:**
```
[ ● ● ● ]  Live Calculation Engine                    ↗
```
Three traffic-light dots (●●● in red #FF6B6B, amber #FFD166, green #00C896, 10px each, 6px gap). Title: DM Sans 500, 13px, #8899B4. Expand icon top-right: #4D6080. Border-bottom: 1px solid #1E2738. Padding: 14px 16px.

**Widget body — THE ANIMATED SEQUENCE:**

The widget runs a continuous looping animation cycle (~12 seconds total) that simulates a real calculation. Use JavaScript with `setTimeout` / CSS class toggling. The cycle:

**PHASE 1 — Input (0–2s): Show the shipment being entered**

Display a mini-form that appears to auto-fill character by character:

```
┌─ Shipment Details ─────────────────────────────┐
│                                                  │
│  HS Code    [8471 30 0000              ]  ✓     │
│  Origin     [🇨🇳 China (CN)           ]  ✓     │
│  Dest.      [🇬🇧 United Kingdom       ]  ✓     │
│  Incoterm   [FOB — Free On Board      ]  ✓     │
│  Value      [$ 48,500.00              ]  ✓     │
│                                                  │
│  [  Calculating...  ████████████░░░░  87%  ]    │
└──────────────────────────────────────────────────┘
```

Fields appear one by one with a 300ms delay each. Each field: background #161C28, border 1px solid #2A3347, border-radius 6px, padding 8px 12px, font JetBrains Mono 13px, color #F0F4FF. HS code types character by character (typewriter, 80ms/char). After all fields appear: show a progress bar filling from 0→87% over 1.2s. Color: #00C896.

**PHASE 2 — Engines Running (2–6s): The calculation animation heart**

Replace the form with an "Engines" view. This is the most visually impressive part.

Show 8 engine rows. Each engine has:
- Engine name (DM Sans 500, 13px, #8899B4)
- Status indicator that cycles through: `○ Queued` → `⟳ Running` (spinning) → `✓ Done`
- A result value that appears when done (JetBrains Mono 500, 13px, #F0F4FF)

```
ENGINE                    STATUS        RESULT

Classification         ✓ Done         8471.30 — Laptops
Customs Valuation      ✓ Done         £37,890.62
⟳ Tariff Measure       Running...     ──────────
○ Rules of Origin      Queued         ──────────
○ VAT Engine           Queued         ──────────
○ FX Conversion        Queued         ──────────
○ Excise Check         Queued         ──────────
○ Compliance Flags     Queued         ──────────
```

Stagger the completion: engines complete one by one every 400ms.

Engine status colors:
- Queued: `○` #4D6080
- Running: `⟳` #FFD166 with CSS rotation animation (spin 1s linear infinite)
- Done: `✓` #00C896

When each engine completes, its result value types in (JetBrains Mono) AND the row briefly flashes a subtle green highlight (background: rgba(0,200,150,0.08), 0.3s fade out).

Progress indicator below the engine list:
```
[████████████████████░░░░]  Processing 6 of 8 engines...
```
Updates as engines complete. Color: #00C896 fill on #1E2738 track.

**PHASE 3 — Results (6–10s): The payoff**

Engines view fades out, results slide up:

```
┌─ Calculation Complete ──────────────── ✓ ──────────┐
│                                                      │
│  TOTAL LANDED COST              Confidence Score     │
│  £ 54,284.17                    ████████░░  87%     │
│  JetBrains Mono 800 28px        emerald arc          │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  Customs Value    £ 37,890    ████████████  69.9%   │ ← #00C896
│  Import Duty      £  4,210    ████░░░░░░░░   7.8%   │ ← #FF6B6B  
│  VAT (20%)        £  8,420    ████████░░░░  15.5%   │ ← #4DABF7
│  Clearance        £  3,764    ████░░░░░░░░   6.8%   │ ← #FFD166
│                                                      │
│  ⚠  Anti-dumping measure detected — Pro required    │ ← amber badge
│                                                      │
│  [  View Full Analysis  →  ]                        │
└──────────────────────────────────────────────────────┘
```

The total number counts up from 0 to £54,284.17 over 1.5s (easeOutExpo curve).

Each cost bar animates from width 0 to final width (left to right) with 150ms stagger.

Confidence score arc: SVG arc element, stroke-dashoffset animates to represent 87%.

The anti-dumping warning badge: background rgba(255,209,102,0.1), border 1px solid rgba(255,209,102,0.3), text #FFD166, DM Sans 500 12px.

**PHASE 4 — Reset (10–12s): Seamless loop**

Results fade out over 0.8s, then widget resets smoothly back to Phase 1 with new data (cycle through 3 different shipment scenarios — laptops, wine from France, solar panels from China with anti-dumping).

**Scenario data to cycle through:**
```javascript
const scenarios = [
  {
    hs: "8471 30 0000", origin: "🇨🇳 China", dest: "🇬🇧 United Kingdom",
    incoterm: "FOB", value: "$ 48,500.00", currency: "GBP",
    customs: "£37,890", duty: "£0", vat: "£7,578", clearance: "£2,840",
    total: "£48,308.00", dutyType: "0% — Standard", confidence: 91
  },
  {
    hs: "2204 21 0100", origin: "🇫🇷 France", dest: "🇬🇧 United Kingdom",
    incoterm: "CIF", value: "€ 12,400.00", currency: "GBP",
    customs: "£10,592", duty: "£0", vat: "£2,118", clearance: "£940",
    total: "£13,650.00", dutyType: "0% — TCA Preference", confidence: 94
  },
  {
    hs: "8541 40 9000", origin: "🇨🇳 China", dest: "🇬🇧 United Kingdom",
    incoterm: "FOB", value: "$ 88,000.00", currency: "GBP",
    customs: "£69,280", duty: "£10,392", vat: "£15,934", clearance: "£4,200",
    total: "£99,806.00", dutyType: "14.9% — Anti-Dumping", confidence: 88
  }
];
```

---

### SECTION 3: TRUST STRIP

Full-width band, 100px height, background #111620, border-top/bottom: 1px solid #1E2738.

```
Used by customs professionals at leading importers and freight forwarders
```

Centered text: DM Sans 400, 13px, #4D6080, letter-spacing 0.05em.

Below the text, 6 placeholder company "logos" — render as stylized text in DM Sans 700, 18px, #2A3347 (greyscale, subdued). Examples: "CARGO CO." · "TRADE GROUP" · "IMPORT LABS" · "NEXUS FREIGHT" · "HARBOUR & CO." · "LOGISTIX"

On hover: color transitions to #8899B4. These fade in with 60ms stagger on viewport entry.

---

### SECTION 4: THE PROBLEM

Two columns, 120px vertical padding each side.

**Left column (55%):**

Section label: `WHY IT MATTERS` — DM Sans 600, 11px, #00C896, letter-spacing 0.12em, margin-bottom 24px.

Headline: `Getting import costs wrong is expensive.` — Syne 700, 42px, #F0F4FF, line-height 1.15.

Body paragraphs (DM Sans 400, 16px, #8899B4, line-height 1.7, max-width 480px):
- "Traditional brokers take days and cost thousands. Spreadsheet estimates miss anti-dumping duties, quota rates, and customs valuation rules. Most online 'calculators' apply one ad valorem rate to an entire invoice."
- "TradeCalc runs 11 calculation engines simultaneously — the same logic customs authorities use — and returns a result in seconds."

**Three stat blocks** (inline, left-aligned, 40px margin-top):

Each stat:
- Number: Syne 800, 48px, #00C896, JetBrains Mono — countUp on viewport entry
- Label: DM Sans 400, 14px, #8899B4, max-width 140px, margin-top 6px

Stats: `47%` "of importers under or overpay duty in year one" · `£2,984` "average missed cost per shipment in our audit sample" · `3 min` "average time to a complete landed cost breakdown"

**Right column (45%):**

An animated comparison card showing the difference between a spreadsheet estimate and TradeCalc:

```
┌─────────────────────────────────────────────────────┐
│   Spreadsheet Estimate        TradeCalc Result       │
│   ───────────────────         ─────────────────      │
│   Invoice value  £10,000      Customs value £11,250  │
│   Duty rate         0%        Anti-dump duty £1,574  │
│   VAT             £2,000      VAT           £2,565   │
│   ───────────────────         ─────────────────      │
│   TOTAL          £12,000      TOTAL        £15,389   │
│                                                       │
│               You were £3,389 short 💸               │
└─────────────────────────────────────────────────────┘
```

Left side: muted (#4D6080 text), crossed-out feel.
Right side: brand colors, confident.
The "£3,389 short" line pulses in #FF6B6B when card enters viewport.
Animate: right column slides in from right on viewport entry.

---

### SECTION 5: HOW IT WORKS

Centered, max-width 900px, 120px padding top/bottom. Background: subtle variation, `#0A0D12` with very faint grid.

Section label: `HOW IT WORKS` — same style as above.
Headline: `From invoice to landed cost in 3 steps.` — Syne 700, 48px.

**Three step cards** (horizontal on desktop, vertical on mobile):

Each card: background #111620, border 1px solid #1E2738, border-radius 12px, padding 32px. Hover: border-color #2A3347, translateY(-4px), 0.3s transition.

Between cards: animated dashed line with a moving dot (CSS animation).

**Step 1 — "Describe Your Shipment"**
Icon: A custom SVG — a box/package with an origin pin and destination flag.
Rendered as 48px icon, color #00C896.
Body: "Enter your HS code, origin country, invoice value, and Incoterm. We validate your classification against live tariff databases and flag misclassification risk."

**Step 2 — "11 Engines Analyze Your Data"**
Icon: CPU/processor SVG with emanating signal lines — 48px, #00C896.
Body: "Our engines run simultaneously: customs valuation, tariff measures, anti-dumping duties, origin preference rules, VAT, excise, and compliance flags. All powered by daily-updated TARIC and UKGT data."

Below body: Show 11 small engine badges (pill tags): `Classification` · `Customs Valuation` · `Anti-Dumping` · `Rules of Origin` · `VAT` · `Excise` · `FX Rate` · `Quota Logic` · `Compliance` · `Line-Level` · `Clearance`
Each badge: background #1A2030, border 1px solid #2A3347, text #8899B4, DM Sans 500 11px, border-radius 100px, padding 4px 10px.

**Step 3 — "Get Your Full Cost Breakdown"**
Icon: Bar chart SVG with an upward trend line — 48px, #00C896.
Body: "See every cost component — duty, VAT, excise, clearance fees — with the calculation formula behind each number. Export a PDF audit trail your broker and finance team can rely on."

Cards stagger-animate on viewport entry: card 1 → 150ms → card 2 → 150ms → card 3.

---

### SECTION 6: FEATURE BREAKDOWN

Background: #111620. Full-width. 120px padding.

Section label + headline:
```
BUILT FOR HOW CUSTOMS ACTUALLY WORKS

11 engines. Every cost covered.
```

Headline: Syne 700, 52px. Sub: DM Sans 400, 18px, #8899B4, "We cover every calculation that affects your real landed cost — not just the easy parts."

**Feature grid: 3 columns × 4 rows of feature cards.**

Each card: background #0A0D12, border 1px solid #1E2738, border-radius 10px, padding 24px. Hover: border-color #00C896 with 0.15s transition, box-shadow: 0 0 0 1px rgba(0,200,150,0.1).

**12 Feature Cards:**

1. **HS Code Classification** — `Classification icon` — "8–10 digit validation against live TARIC and UKGT. Supplementary unit detection. Misclassification risk scoring." — Tag: FREE
2. **Customs Valuation** — `Scale icon` — "Full WTO Transaction Value method: CIF gap analysis, royalties, assists, related-party adjustments, Incoterm-aware." — Tag: PRO
3. **Anti-Dumping Duties** — `Shield-alert icon` — "Country and exporter-specific rates. Compound with standard import duty. Regulation number in audit trail." — Tag: PRO
4. **Rules of Origin** — `Globe icon` — "UK-EU TCA, GSP, and 15+ agreements. CTH, CTSH, and RVC rule validation. MFN fallback if proof unavailable." — Tag: PRO
5. **Tariff Quota Logic** — `PieChart icon` — "In-quota vs out-of-quota rate switching. Real-time quota status from TARIC. Order number tracking." — Tag: PRO
6. **VAT Engine** — `Receipt icon` — "Correct VAT base: customs value + duty + excise. Postponed accounting (PIVA). Reduced and zero-rated goods." — Tag: FREE/PRO
7. **Excise Duty** — `FlaskRound icon` — "Alcohol (ABV-based), tobacco, energy products. Plastic Packaging Tax. CBAM carbon border adjustment." — Tag: PRO
8. **Official FX Rates** — `DollarSign icon` — "HMRC monthly customs rates (UK). ECB daily reference rates (EU). Not market rates — the rates customs uses." — Tag: PRO
9. **Multi-Line Invoice** — `List icon` — "Up to 500 HS lines per shipment. Per-line duty, VAT, and origin. Pro-rata freight allocation. Mixed-origin support." — Tag: PRO
10. **Compliance Flags** — `AlertTriangle icon` — "Restricted goods warnings. License and certificate requirements. Sanctions screening. CITES detection." — Tag: PRO
11. **Full Audit Trail** — `FileText icon` — "Every calculation step logged: formula, inputs, rate source, FX rate, effective date. Export-ready for customs authorities." — Tag: PRO
12. **PDF Export** — `Download icon` — "Professional report with all engine outputs, audit steps, and compliance flags. Branded and ready for your broker." — Tag: PRO

Tag styles:
- FREE: background rgba(0,200,150,0.08), border 1px solid rgba(0,200,150,0.2), text #00C896, 10px DM Sans 600
- PRO: background rgba(255,209,102,0.08), border 1px solid rgba(255,209,102,0.2), text #FFD166, 10px DM Sans 600

Cards animate in with stagger (50ms each) on viewport entry.

---

### SECTION 7: ACCURACY / TRUST

Background: #0A0D12. Centered. 120px padding.

Section label: `ACCURACY THAT MATTERS`
Headline: `Calculation confidence you can stake a shipment on.` — Syne 700, 48px, max-width 700px, centered.

**Three accuracy stat cards** (centered row, gap 24px):

Each card: background #111620, border 1px solid #1E2738, border-radius 12px, padding 40px 32px, text-align center, min-width 220px.

```
Card 1:                Card 2:                Card 3:
95%+                   90–94%                 85–92%
Simple shipments       Standard commercial    Complex regulated goods
Single HS · Ad valorem Standard trade · MFN   Anti-dump · Origin · Excise
```

Number: Syne 800, 56px, #00C896. Category: DM Sans 600, 14px, #F0F4FF, margin-top 8px. Description: DM Sans 400, 13px, #4D6080, margin-top 4px.

Numbers count up when entering viewport.

**Below stats: Animated Audit Trail Preview**

A terminal-style card: background #0D1117 (slightly different dark), border 1px solid #1E2738, border-radius 12px, font-family JetBrains Mono, padding 24px 28px.

Header bar: `● ● ●` dots + `Audit Trail — CN → GB · 8471300000 · Feb 23 2026`

Lines type in one by one (typewriter, each line appears after previous completes):
```
✓  HS Code validated: 8471300000 — "Portable automatic data processing machines"
✓  Customs value: £37,890.62 (FOB → CIF: added freight £1,500 + insurance £78)
✓  Official FX rate: USD/GBP 0.7818 (HMRC monthly, February 2026)
✓  Tariff measure: 0% ad valorem (UK Global Tariff, valid from 01/01/2021)
✓  Anti-dumping check: No measure active for CN × 8471.30
✓  VAT base: £37,890 + £0 duty = £37,890. VAT @ 20% = £7,578
✓  Confidence score: 0.91 (all engines successful, proof of origin not required)
```

Each line: `✓` in #00C896, rest in #F0F4FF. Cursor blinking after last line. Lines appear every 600ms with a subtle slide-in from left.

---

### SECTION 8: PRICING

Background: #111620. 120px padding.

Section label: `PRICING`
Headline: `Simple, transparent pricing.`

**Billing toggle:**
```
Monthly  [ toggle ]  Annual  — Save 20%
```
Toggle: pill with sliding indicator, CSS-only. Active state: #00C896. "Save 20%" badge in amber when Annual selected. Clicking toggle updates all prices with a smooth number transition.

**Two pricing cards:**

**Free Card** (background #0A0D12, border #2A3347):
```
Free
─────
£0 / month

For single-line estimates

──── What's included ────

✓  HS code validation & lookup
✓  Basic ad valorem duty
✓  Standard VAT (20% UK / EU)
✓  Market FX rate
✓  Single HS line per calculation
✓  10 calculations / hour
✓  5 saved calculations

─────────────────────────
[  Start Free  ]
```
Button: outlined, border #2A3347, color #F0F4FF, hover: border #00C896.

**Pro Card** (brand border, glow shadow — the FEATURED card):
```
⭐ Most Popular

Pro
─────
£49 / month  ← (£39/mo when Annual selected — animate the number)
Billed monthly · Cancel anytime

For importers and customs brokers

──── Everything in Free, plus ────

✓  Customs Valuation Engine (WTO method)
✓  Anti-dumping · Safeguard · Countervailing
✓  Tariff quota logic (in/out of quota)
✓  Rules of Origin + Preferential rates
✓  Official HMRC / ECB customs FX rates
✓  Excise duty (alcohol, tobacco, energy, CBAM)
✓  Up to 500 HS lines per calculation
✓  Full calculation audit trail
✓  PDF export (broker-ready)
✓  Compliance + sanctions flags
✓  Unlimited calculation history
✓  Priority support

─────────────────────────
[ ⚡ Get Pro Access → ]
```

Pro card styles: background #111620, border: 1px solid #00C896, box-shadow: 0 0 0 1px rgba(0,200,150,0.1), 0 24px 60px rgba(0,0,0,0.4). Pro button: background #00C896, color #0A0D12, DM Sans 700.

Below Pro card: `🛡️ 30-day money-back guarantee — no questions asked.` DM Sans 400, 13px, #4D6080.

---

### SECTION 9: FAQ

Background: #0A0D12. Max-width 800px, centered. 120px padding.

Headline: `Frequently asked questions` — Syne 700, 42px.

**8 FAQ items** as an accordion. Click to expand. Smooth height transition (CSS `max-height` transition, 0.3s ease). Only one open at a time.

Each item: border-bottom 1px solid #1E2738, padding 20px 0. Question: DM Sans 600, 16px, #F0F4FF + `+` / `−` indicator (right-aligned, #00C896). Answer: DM Sans 400, 15px, #8899B4, line-height 1.65, padding-top 12px.

**Questions and answers:**

1. **What countries and trade directions do you support?**
   "Currently UK imports (using UK Global Tariff / UKGT) and EU imports (using TARIC). UK-EU TCA preferential rates fully supported. We're adding export calculations and additional jurisdictions in Q3 2026."

2. **How fresh is your tariff data?**
   "TARIC and UKGT data is ingested daily and reconciled weekly against official databases. HMRC monthly FX rates are loaded on publication. Our system flags a warning if data is older than 26 hours. Every calculation shows its data timestamp."

3. **How do you handle anti-dumping duties?**
   "We maintain the full EU and UK anti-dumping measure database, including country-specific and exporter-specific rates, compound calculation with standard duties, and the applicable regulation reference. Rates are updated daily from official sources."

4. **What's the difference between Free and Pro?**
   "Free gives you HS code validation, basic ad valorem duty, and standard VAT — useful for quick estimates. Pro runs all 11 engines: customs valuation, anti-dumping, rules of origin, quota logic, excise, official FX rates, and full audit trail. Pro is what serious importers and brokers use."

5. **Can I trust this for real customs declarations?**
   "TradeCalc is a calculation and planning tool, not a substitute for a licensed customs agent for formal declarations. Our results are used for cost planning, budgeting, pricing decisions, and briefing brokers. For live declarations, use our output to check and brief your customs agent."

6. **Do you support multi-currency invoices?**
   "Yes. Each line item can have its own currency. Pro users get official HMRC and ECB customs FX rates (the rates customs authorities actually use). Free users get indicative market rates."

7. **What is a confidence score?**
   "Every calculation includes a confidence score (0–100%) reflecting engine coverage, data quality, and completeness. Missing proof of origin, supplementary unit mismatches, or related-party transactions reduce the score. A score above 85% is reliable for budgeting decisions."

8. **How do I get the audit trail?**
   "Pro users get a full step-by-step audit trail showing every calculation formula, input value, rate source, and effective date. You can export this as a PDF — useful for briefing brokers, internal finance sign-off, and compliance documentation."

---

### SECTION 10: FINAL CTA BANNER

Full-width. 280px minimum height. Centered.

Background:
```css
background: 
  radial-gradient(ellipse 70% 80% at 50% 50%, rgba(0,200,150,0.1) 0%, transparent 70%),
  #0A0D12;
border-top: 1px solid #1E2738;
```

Content:

**Pre-headline:** `GET STARTED FREE` — 11px, DM Sans 600, #00C896, letter-spacing 0.12em
**Headline:** `Calculate your true landed cost.` — Syne 800, 56px, #F0F4FF
**Sub:** `The most accurate customs calculation tool — backed by live tariff data updated daily.` — DM Sans 400, 18px, #8899B4
**CTAs:** Same as hero — "Calculate Free →" (primary) + "Talk to Sales" (ghost)

Headline animates: scale(0.96) opacity(0) → scale(1) opacity(1) on viewport entry, 0.6s ease.

---

### SECTION 11: FOOTER

Background: #0A0D12. Border-top: 1px solid #1E2738. Padding: 64px 0 40px.

**Four columns:**

**Col 1 — Brand (30%):**
Logo + wordmark. Tagline: "Customs-grade accuracy for modern importers." DM Sans 400, 14px, #4D6080. Social icons: LinkedIn, Twitter/X — square icon buttons, border #1E2738, hover border #2A3347.

**Col 2 — Product:**
Title: "Product" — DM Sans 600, 13px, #8899B4, letter-spacing 0.06em.
Links: Features · Pricing · Accuracy · API · Changelog
Link style: DM Sans 400, 14px, #4D6080, hover #F0F4FF, 0.15s transition, line-height 2.4.

**Col 3 — Company:**
Title: "Company"
Links: About · Blog · Careers · Contact · Privacy Policy · Terms of Service

**Col 4 — Data & Compliance:**
Title: "Data Sources"
Small print items (DM Sans 400, 13px, #4D6080, line-height 1.8):
- "Tariff data: TARIC (EU) · UKGT (UK)"
- "FX rates: HMRC monthly · ECB daily"
- "Updated: Daily (working days)"
- "Last sync: Today"
A subtle green pulsing dot next to "Today" to indicate live data.

**Bottom bar:** Full-width, border-top #1E2738, padding-top 24px, margin-top 48px.
Left: `© 2026 TradeCalc Ltd. All rights reserved.`
Right: `Not a substitute for professional customs advice.`
Both: DM Sans 400, 13px, #4D6080.

---

## JAVASCRIPT REQUIREMENTS

Implement these functions in a `<script>` tag at bottom of body:

### 1. Sticky Nav
```javascript
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  nav.classList.toggle('scrolled', window.scrollY > 80);
});
```

### 2. CountUp Animation
```javascript
function countUp(element, target, duration = 2000, prefix = '', suffix = '') {
  // Use requestAnimationFrame, easeOutExpo curve
  // Format final number with toLocaleString()
  // Support decimal targets
}
// Trigger on IntersectionObserver entry
```

### 3. Viewport Entry Animations
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```
CSS:
```css
[data-animate] { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1); }
[data-animate].animate-in { opacity: 1; transform: translateY(0); }
[data-animate-delay="1"] { transition-delay: 0.1s; }
[data-animate-delay="2"] { transition-delay: 0.2s; }
/* ...up to delay 8 */
```

### 4. The Calculation Widget Animation Loop
Full implementation of the 4-phase loop described above. Must be robust — no flickers, no broken states. Use a clean state machine approach with a `runPhase(n)` pattern.

```javascript
const CalcWidget = {
  scenarios: [...],  // the 3 scenarios defined above
  currentScenario: 0,
  phase: 0,
  
  init() { this.runPhase(1); },
  runPhase(n) { /* switch on n, call appropriate animation */ },
  animateInputs() { /* Phase 1 */ },
  animateEngines() { /* Phase 2 — the star */ },
  animateResults() { /* Phase 3 */ },
  reset() { /* Phase 4 — cycle scenario, loop back */ },
}
CalcWidget.init();
```

### 5. Pricing Toggle
```javascript
const toggle = document.querySelector('.billing-toggle');
toggle.addEventListener('click', () => {
  const isAnnual = toggle.classList.toggle('annual');
  // Animate price numbers: opacity 0 → update → opacity 1
  document.querySelector('.pro-price').textContent = isAnnual ? '£39' : '£49';
  document.querySelector('.pro-period').textContent = isAnnual ? '/mo billed annually' : '/month';
});
```

### 6. FAQ Accordion
```javascript
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
```

### 7. Typewriter Effect
```javascript
function typewriter(element, text, speed = 70, callback) {
  let i = 0;
  element.textContent = '';
  const interval = setInterval(() => {
    element.textContent += text[i++];
    if (i >= text.length) { clearInterval(interval); callback?.(); }
  }, speed);
}
```

### 8. Smooth Scroll for Nav Links
```javascript
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
  });
});
```

---

## RESPONSIVE BREAKPOINTS

Implement these with CSS media queries:

**< 768px (mobile):**
- Hero: single column, stack text above widget. Widget: simplified (show only Phase 3 result, no full animation). Font sizes: headline 36px, sub 16px.
- How It Works: vertical stack.
- Features: 1 column.
- Pricing: cards stack vertically.
- Nav: hamburger → slide-down overlay menu.

**768–1024px (tablet):**
- Hero: two columns but tighter.
- Features: 2 columns.
- Pricing: side by side.

**1024px+ (desktop):**
- Full layout as specified.

---

## QUALITY CHECKLIST — VERIFY BEFORE DELIVERING

- [ ] Navigation sticks and transitions on scroll
- [ ] Hero headline animates in correctly on page load
- [ ] Widget animation loops infinitely without glitch — verify all 3 scenarios work
- [ ] Widget engine "Running" spinner actually rotates
- [ ] Widget result total counts up from 0
- [ ] Widget cost bars animate from left
- [ ] All section elements animate in on scroll (IntersectionObserver)
- [ ] Stat numbers count up on viewport entry
- [ ] Audit trail types in character by character
- [ ] Pricing toggle switches between £49 and £39
- [ ] FAQ accordion opens/closes smoothly
- [ ] All font families load (Syne, DM Sans, JetBrains Mono)
- [ ] All colors match the exact hex values specified
- [ ] Page is fully responsive at 375px, 768px, 1280px
- [ ] No horizontal scroll at any viewport width
- [ ] Hover states work on all buttons, cards, nav links, feature cards
- [ ] Smooth scroll works for nav anchor links
- [ ] The page looks extraordinary — not generic

---

## FINAL INSTRUCTION

This landing page represents a $50M product. Every detail matters. Do not take shortcuts. Do not use placeholder colors. Do not skip animations. Do not use generic layouts.

The widget animation is what will make visitors stop scrolling. The typewriter audit trail is what will build trust. The pricing section is what will convert. Each section has a job — execute them all.

Deliver the complete `landing.html` file. All CSS in a `<style>` tag in `<head>`. All JavaScript in a `<script>` tag before `</body>`. Zero external dependencies except Google Fonts.
