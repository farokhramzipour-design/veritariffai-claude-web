# AGENT PROMPT — TradeCalc Complete Brand Identity & Color System
# Ready-to-paste for any AI design or coding agent
# Deliver: brand.html — a single self-contained brand guidelines page
# ─────────────────────────────────────────────────────────────────────

---

You are creating the **complete brand identity system** for **TradeCalc** — a customs-grade trade cost calculation engine for importers, freight forwarders, and customs brokers. This is a $50M-evaluated B2B SaaS product that calculates import duties, VAT, anti-dumping tariffs, and rules of origin using live government tariff databases.

Deliver a single file: `brand.html` — a beautiful, self-contained brand guidelines page that a designer, developer, or agency could use to implement this brand consistently. Zero dependencies except Google Fonts. All CSS inline. All JS inline.

---

## BUSINESS CONTEXT (Read carefully — every brand decision must serve this)

**What it does:** Calculates the true landed cost of importing goods across borders using live TARIC (EU) and UKGT (UK) tariff data. Runs 11 calculation engines simultaneously.

**Who uses it:**
- Professional importers moving £500K–£50M of goods annually
- Licensed customs brokers preparing cost estimates for clients  
- Freight forwarders quoting landed costs
- Finance and procurement teams at mid-market companies

**What they need to feel when they see this brand:**
- **Trust** — "This is accurate. I can stake real money on it."
- **Precision** — "This was built by people who understand customs, not just software."
- **Authority** — "This is the professional tool, not the consumer toy."
- **Efficiency** — "This will save me hours, not add complexity."

**What the brand must NOT feel:**
- Playful or casual (this is not a consumer app)
- Generic SaaS (purple gradients, rounded blobs, bubbly fonts)
- Corporate/boring (not a traditional enterprise software aesthetic)
- Overly technical/cold (it must still be human and approachable)

**The precise aesthetic target:** Bloomberg Terminal × Stripe × a Swiss precision watch brand. Data-dense confidence with refined taste.

---

## BRAND NAME & WORDMARK

**Primary name:** TradeCalc
**Pronunciation:** "Trade-Calc" (not "Trade-Cal")
**Tagline:** "Know exactly what your imports cost."
**Secondary tagline (for product context):** "Customs-grade accuracy. Live tariff data."

**Wordmark construction:**
- "Trade" in Syne 700, color: #F0F4FF (white-cool)
- "Calc" in Syne 700, color: #00C896 (brand emerald)
- No space between words in the primary lockup
- The contrast between white "Trade" and emerald "Calc" is the core visual identity moment

**Alternate wordmark (monochrome):**
- All white on dark: "Trade" #F0F4FF + "Calc" #F0F4FF
- All dark on light: full #0A0D12

---

## LOGO ICON (The Mark)

The logomark is a **globe arc intersected by a grid** — representing the intersection of global trade (the globe) and calculation precision (the grid).

**Construction:**
- A partial circle arc (the globe — represents international borders, trade routes)
- A 3×3 grid of dots or a hashtag/grid pattern overlaid at the center-right
- The intersection point is highlighted in brand emerald (#00C896)
- The overall shape fits within a square bounding box
- Weight: medium stroke (not too thin, not heavy). Stroke width: 1.5–2px equivalent at standard size.
- The arc is NOT a full circle — approximately 270 degrees, open at bottom-right
- Inside the arc, 3 horizontal lines suggest latitude lines on a globe
- The grid element (3×3 dots or 2×2 crossing lines) overlaps the arc at the right side

**Logo sizes:**
- 16px: icon only (favicon) — simplify to just the arc + single dot in emerald
- 24px: icon only — arc + minimal grid
- 32px: icon + wordmark
- 48px+: full lockup

**Icon colors:**
- Arc and grid: #F0F4FF (primary text color — readable on dark background)
- Intersection accent dot: #00C896 (brand emerald)
- On light backgrounds: arc and grid: #0A0D12, accent: #00A37A

Render the logo as an SVG inline in the brand page. Implement it geometrically using SVG `<circle>`, `<line>`, `<path>` elements. Make it precise and elegant.

---

## COLOR SYSTEM — COMPLETE SPECIFICATION

### THE STORY OF THE PALETTE

The palette is built around a single insight: **customs professionals work in high-stakes environments where errors cost real money**. The dark backgrounds reduce eye strain during long work sessions (like Bloomberg Terminal). The emerald primary color was chosen because:
1. It does not appear in any major competitor's branding
2. Green universally signals "approved", "verified", "proceed" — exactly what users want to feel when they see their calculation result
3. It reads clearly on dark backgrounds at small sizes (unlike yellow or light blue)
4. It conveys precision without coldness (unlike pure cyan or electric blue)

The amber accent (#FFD166) is used exclusively for Pro tier features and warnings — creating a secondary status language.

### PRIMARY PALETTE

**Brand Emerald — The Action Color**
```
Name:     TradeCalc Green
Hex:      #00C896
RGB:      0, 200, 150
HSL:      162°, 100%, 39%
Usage:    Primary buttons, active states, brand text, success indicators,
          checkmarks, confidence score arc, live data pulse dots,
          calculation result highlights
Personality: Trust, precision, verified, live, active
```

**Brand Emerald Dark — The Depth Color**
```
Name:     TradeCalc Green Deep
Hex:      #00A37A
RGB:      0, 163, 122
HSL:      162°, 100%, 32%
Usage:    Button hover states, pressed states, gradient endpoints,
          border on brand-colored cards
```

**Brand Emerald Subtle — The Surface Color**
```
Name:     TradeCalc Green Tint
Hex:      rgba(0, 200, 150, 0.08)
Usage:    Card backgrounds when brand-highlighted, section tints,
          success state backgrounds
```

**Brand Amber — The Attention Color**
```
Name:     TradeCalc Amber
Hex:      #FFD166
RGB:      255, 209, 102
HSL:      44°, 100%, 70%
Usage:    Pro tier badge, Pro feature labels, billing/pricing CTAs,
          warning states, "upgrade" buttons, attention-required flags
          RULE: Never use for errors (that's red). Only Pro + warnings.
Personality: Premium, exclusive, "this costs money", attention
```

**Brand Amber Subtle**
```
Hex:      rgba(255, 209, 102, 0.10)
Usage:    Pro badge backgrounds, warning card backgrounds
```

### BACKGROUND SCALE (Dark Theme — Primary)

The background scale has 5 levels, each exactly 8–10% lighter than the previous. This creates a clear visual hierarchy without harsh contrast.

```
Level 0 — Canvas (deepest)
Name:     Void
Hex:      #0A0D12
RGB:      10, 13, 18
Usage:    Page background, outermost container, hero backgrounds
Note:     This is NOT pure black. The slight blue undertone (#0D) makes it
          feel premium rather than harsh.

Level 1 — Surface
Name:     Slate Dark
Hex:      #111620
RGB:      17, 22, 32
Usage:    Cards, panels, sidebar backgrounds, table rows
Note:     8px more blue than canvas. The slight blue cast is intentional —
          it keeps the dark theme feeling cool and professional.

Level 2 — Elevated
Name:     Slate Mid
Hex:      #1A2030
RGB:      26, 32, 48
Usage:    Modal backgrounds, dropdown menus, elevated popovers,
          selected states, secondary cards
Note:     The blue component increases here — elevated surfaces are
          noticeably cooler in tone.

Level 3 — Input
Name:     Input Field
Hex:      #161C28
RGB:      22, 28, 40
Usage:    Form inputs, search fields, text areas
Note:     Slightly between Level 0 and Level 1 — creates a subtle
          inset effect for interactive form elements.

Level 4 — Hover
Name:     Interactive Hover
Hex:      #1E2738
RGB:      30, 39, 56
Usage:    Hover state for interactive elements (nav links, table rows,
          list items, clickable cards). Always used as a hover overlay,
          never as a base background.
```

### BORDER SCALE

```
Subtle   #1E2738  — Used between sections of the same surface (dividers)
Default  #2A3347  — Standard card borders, input field borders
Strong   #3D4F6B  — Focused input borders, selected state borders
Brand    #00C896  — Featured card borders, active/selected tabs, brand borders
```

### TEXT SCALE

```
Primary    #F0F4FF  — Headings, important content, active labels
           Note: Not pure white. The slight blue tint (#F4, #FF) means it
           looks crisp on dark backgrounds without the harshness of #FFFFFF.

Secondary  #8899B4  — Body copy, descriptions, secondary labels, placeholder
                      hints that are still readable

Tertiary   #4D6080  — Disabled text, placeholder text, timestamps,
                      metadata, footer fine print

Brand      #00C896  — Brand-colored text (use sparingly — links, highlights,
                      active navigation, key data points)

Warning    #FFD166  — Warning messages, Pro tier labels

Error      #FF6B6B  — Error messages, failed states, duty cost amounts
                      (red connotes cost/risk in financial contexts)

Success    #00C896  — Success messages (same as brand — intentional)
```

### DATA VISUALIZATION PALETTE

These colors are for charts, graphs, and the cost breakdown donut. Each color represents a specific cost category and must be used consistently everywhere:

```
Goods Value   #00C896  — Brand emerald (the "good" number — what you paid)
Import Duty   #FF6B6B  — Coral red (cost of non-compliance / tariff)
VAT           #4DABF7  — Sky blue (government tax, neutral)
Excise        #C084FC  — Soft purple (regulatory/special category)
Clearance     #FFD166  — Amber (logistics cost)
Freight       #F97316  — Orange (transport cost)
Insurance     #34D399  — Mint (protection cost, softer green than brand)
```

**Data palette contrast ratios on #0A0D12 background:**
All colors above achieve minimum 3:1 contrast ratio against the canvas background. All achieve 4.5:1 against pure black — WCAG AA compliant.

### LIGHT THEME (Secondary — for PDF exports and print)

```
Background:  #FFFFFF
Surface:     #F8FAFC
Elevated:    #F1F5F9
Border:      #E2E8F0
Text Primary: #0A0D12  (same as dark theme canvas — maintains brand)
Text Secondary: #475569
Brand Primary: #00A37A  (darker emerald — maintains contrast on white)
Brand Amber:   #D97706  (darker amber — maintains contrast on white)
```

---

## TYPOGRAPHY SYSTEM

### Font Stack

**Display — Syne**
```
Source:   Google Fonts
Weights:  600 (semibold), 700 (bold), 800 (extrabold)
CSS:      font-family: 'Syne', sans-serif;

Character: Syne is a geometric display typeface with slightly wide proportions
           and architectural precision. At 700+ weight, headlines feel
           monumental but not aggressive. The wide letterforms give a sense
           of space and confidence.

Used for:  All headings H1–H4, hero text, pricing numbers, section titles,
           the wordmark itself

Anti-pattern: Never use Syne for body copy or text smaller than 16px —
              the wide proportions become awkward at small sizes.
```

**Body — DM Sans**
```
Source:   Google Fonts
Weights:  300 (light), 400 (regular), 500 (medium), 600 (semibold)
CSS:      font-family: 'DM Sans', sans-serif;

Character: DM Sans is a warm geometric sans with excellent legibility at
           small sizes. The circular dots on 'i', 'j' give it a slightly
           friendly character that prevents the brand from feeling cold.
           It pairs naturally with Syne because both are geometric.

Used for:  All body text, UI labels, buttons, nav links, form labels,
           table content, tooltips, descriptions

Anti-pattern: Never use for headings larger than 20px — Syne should own
              the display role.
```

**Data/Code — JetBrains Mono**
```
Source:   Google Fonts
Weights:  400 (regular), 500 (medium)
CSS:      font-family: 'JetBrains Mono', monospace;

Character: JetBrains Mono is a monospace font with ligature support and
           carefully balanced character widths. Critical for TradeCalc because
           columns of monetary values must align perfectly — proportional fonts
           make financial data hard to scan.

Used for:  ALL monetary values (£12,450.00), HS codes (8471.30.0000),
           confidence scores (0.91), exchange rates (0.7818),
           audit trail text, code snippets, data table values

Rule:      Every number that represents a financial amount or a code
           must use JetBrains Mono. No exceptions.
```

### Type Scale

```
Display 2XL: Syne 800, 72px, line-height 1.0
             → Hero headline only

Display XL:  Syne 700, 56px, line-height 1.05
             → Page titles, section hero headlines

Display LG:  Syne 700, 42px, line-height 1.1
             → Section headlines (H2 equivalent)

Display MD:  Syne 600, 32px, line-height 1.15
             → Subsection titles, card headlines (H3 equivalent)

Display SM:  Syne 600, 24px, line-height 1.25
             → Panel headers, feature titles (H4 equivalent)

Body XL:     DM Sans 400, 20px, line-height 1.6
             → Hero sub-headline, feature descriptions

Body LG:     DM Sans 400, 18px, line-height 1.65
             → Standard body copy, long-form text

Body MD:     DM Sans 400, 15px, line-height 1.6
             → UI body text, secondary descriptions

Body SM:     DM Sans 400, 13px, line-height 1.5
             → Captions, timestamps, metadata, fine print

Label LG:    DM Sans 600, 14px, line-height 1.4
             → Form labels, table column headers

Label MD:    DM Sans 600, 12px, letter-spacing 0.06em, line-height 1.4
             → Section labels (e.g. "HOW IT WORKS"), badge text

Label SM:    DM Sans 500, 11px, letter-spacing 0.08em, line-height 1.3
             → Tag text, keyboard shortcut labels

Data XL:     JetBrains Mono 500, 28px, line-height 1.2
             → Large result totals in calculator

Data LG:     JetBrains Mono 500, 18px, line-height 1.3
             → Prominent data values, HS codes in headings

Data MD:     JetBrains Mono 400, 14px, line-height 1.4
             → Table monetary values, inline codes, audit trail

Data SM:     JetBrains Mono 400, 12px, line-height 1.4
             → Compact data, small badges
```

---

## SPACING SYSTEM

Based on an 8px base unit. Every spacing value is a multiple of 4px.

```
4px   (space-1)  — Icon inner padding, between label and icon
8px   (space-2)  — Tight inline spacing, between badge elements
12px  (space-3)  — Input padding vertical, compact card inner spacing
16px  (space-4)  — Standard inner card padding (compact), list item height
20px  (space-5)  — Form field gap, list item padding
24px  (space-6)  — Standard inner card padding, section element gap
32px  (space-8)  — Card padding (comfortable), between cards in grid
40px  (space-10) — Section sub-element gap
48px  (space-12) — Between major content blocks within a section
64px  (space-16) — Section internal padding (top/bottom)
80px  (space-20) — Comfortable section padding
96px  (space-24) — Generous section padding (hero, pricing)
128px (space-32) — Major section separation on large screens
```

---

## SHAPE & RADIUS SYSTEM

```
2px  — Sharp inner elements (code blocks, keyboard shortcuts)
4px  — Subtle rounding (small badges, tags, table cells)
8px  — Standard (buttons, inputs, small cards)
12px — Cards and panels (the main workhorse)
16px — Large cards, modals, feature blocks
24px — Hero widget, oversized cards
9999px — Pills (badges, toggles, chip selectors)
```

**Philosophy:** TradeCalc uses restrained rounding. Corners are never fully square (too harsh) but never heavily rounded (too consumer/playful). The 8–12px range covers 80% of UI elements.

---

## SHADOW SYSTEM

All shadows have a strong dark backdrop (no white/grey shadows on dark theme).

```
Shadow SM:   0 1px 3px rgba(0,0,0,0.4)
             → Subtle depth for inputs, small interactive elements

Shadow MD:   0 4px 16px rgba(0,0,0,0.5)
             → Cards, dropdowns, standard depth

Shadow LG:   0 8px 32px rgba(0,0,0,0.6)
             → Modals, elevated panels, heavy depth

Shadow XL:   0 24px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)
             → Widget hero, featured pricing card

Shadow Brand: 0 0 24px rgba(0,200,150,0.15)
              → Brand-colored glow, used on active/featured elements

Shadow Glow:  0 0 0 1px #00C896, 0 0 16px rgba(0,200,150,0.2)
              → Focused inputs, selected states
```

---

## ICONOGRAPHY SYSTEM

**Library:** Lucide React (or equivalent SVG icons from lucide.dev)
**Default stroke-width:** 1.5 (not 1, not 2 — exactly 1.5 is the TradeCalc standard)
**Default size:** 16px inline, 20px standalone, 48px feature icons, 24px nav
**Color:** Inherits from text color context unless specifically overridden

**Icon categories in use:**

Calculation & Data:
- `Calculator` — main product identity, calculator entry point
- `BarChart3` — results, breakdown charts
- `TrendingUp` — cost analysis, increases
- `Table` — line-item data, invoice view
- `PieChart` — cost distribution

Navigation & Trade:
- `Globe` — international, jurisdiction, trade routes
- `Package` — goods, shipment, inventory
- `Truck` — logistics, delivery
- `Anchor` — sea freight, port
- `Plane` — air freight

Security & Compliance:
- `Shield` — compliance, protection, accuracy
- `ShieldCheck` — verified, confirmed, passed
- `AlertTriangle` — warning, attention required
- `AlertCircle` — error state
- `Lock` — Pro feature gate

Finance:
- `DollarSign` / `PoundSterling` — currency, payment
- `Receipt` — VAT, invoices
- `CreditCard` — payment, billing

System:
- `CheckCircle` — success, complete, verified
- `XCircle` — failed, rejected
- `Loader2` — loading (with animate-spin class)
- `ChevronRight/Down` — navigation, accordion
- `ExternalLink` — opens new tab
- `Download` — export, PDF
- `Copy` — clipboard

**Icon don'ts:**
- Never mix Lucide with other icon libraries
- Never use filled icon variants (stroke-only throughout)
- Never use stroke-width other than 1.5
- Never animate icons except Loader2 (spin) and the brand pulse dot

---

## MOTION & ANIMATION SYSTEM

### Timing Functions (CSS Easings)

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
/* Use for: entrances — things entering the screen */

--ease-in-expo: cubic-bezier(0.7, 0, 0.84, 0);
/* Use for: exits — things leaving the screen */

--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
/* Use for: satisfying confirmations — checkmarks, success states */

--ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
/* Default for most UI transitions */

--ease-linear: linear;
/* Only for: looping animations (spinner, progress bars) */
```

### Duration Scale

```
Instant:   0ms   — State changes that should feel immediate (color on hover)
Fast:      100ms — Micro-interactions (button press, icon swap)
Quick:     150ms — Hover effects on interactive elements
Normal:    200ms — Standard UI transitions (dropdown open, fade)
Medium:    300ms — Page element transitions, slide-ins
Slow:      500ms — Page-level reveals, card entrances
Deliberate: 800ms — Hero animations, impactful reveals
```

### Animation Tokens

```
Scroll reveal:     fadeUp — translateY(24px) opacity(0) → (0px) opacity(1)
                   Duration: 500ms, ease-out-expo
                   Stagger: 80ms between siblings

Hero entrance:     Each element delays 80ms from previous
                   Total sequence: ~400ms for full hero

Count-up:          Duration: 1800ms, easeOutExpo curve
                   Only on IntersectionObserver entry

Brand pulse dot:   scale(1) → scale(1.5) → scale(1)
                   Duration: 2s, ease-in-out, infinite

Progress bar fill: Width 0 → target%, 1.2s ease-out-expo

Widget float:      translateY(0) → translateY(-8px) → translateY(0)
                   Duration: 6s, ease-in-out, infinite

Loading spinner:   rotate(0) → rotate(360)
                   Duration: 0.8s, linear, infinite
```

### Reduced Motion
Always wrap all animations in:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## BRAND VOICE & COPY STYLE

### Voice Attributes
- **Precise:** Never vague. "0.91 confidence score" not "high accuracy."
- **Confident:** No hedging. "Your customs value is £37,890" not "approximately £38K."
- **Direct:** Lead with the number, explain after. Not "We calculate your duty using..." but "Your duty: £4,210."
- **Expert but not jargon-heavy:** Use correct customs terminology but explain it once.

### Headline Formulas That Work
- Verb + exact noun: "Know exactly what your imports cost."
- Problem + relief: "Stop guessing. Start knowing."
- Precision claim: "Customs-grade accuracy. Live tariff data."
- Authority: "The calculation engine that customs professionals use."

### Copy Don'ts
- No exclamation marks in product copy (this isn't a consumer app)
- No "amazing", "powerful", "seamless", "robust", "game-changing"
- No passive voice in UI labels ("Calculation complete" not "Your calculation has been completed")
- No ellipsis in UI ("Calculating..." → "Calculating" is fine, prefer "Processing")

### Number Formatting (Critical for a calculation product)
```
Currency:    £12,450.00   (always 2 decimal places for financial values)
HS Codes:    8471.30.0000 (dot-separated in display, no dots in API)
Percentage:  14.9%        (1 decimal place for duty rates)
Score:       0.91         (2 decimal places, range 0.00–1.00)
Large nums:  £2.3M        (abbreviated in stats, full in calculations)
```

---

## BRAND APPLICATIONS

### App Icon (Favicon / PWA)

**16×16 favicon:**
Dark background #0A0D12, single emerald dot with arc hint.

**32×32:**
Simplified logo mark — arc + 3-dot grid, emerald accent.

**512×512 PWA icon:**
Full logo mark on #0A0D12 background, with subtle radial glow: `radial-gradient(circle at center, rgba(0,200,150,0.12) 0%, transparent 70%)`.

### Open Graph Image (1200×630)

Layout:
- Background: #0A0D12 with mesh gradients and dot grid
- Left 60%: Logo mark (large, 120px) + wordmark + tagline
- Right 40%: Mini version of the calculation widget showing a result
- Bottom bar: "Powered by live TARIC + UKGT data" in DM Sans 13px #4D6080

### Email Signature

```
[TradeCalc Logo SVG]
[Name] · [Title]
TradeCalc Ltd.
tradecalc.com · hello@tradecalc.com
─────────────────────────────────
Customs-grade accuracy. Live tariff data.
```

---

## BRAND GUIDELINES PAGE — WHAT TO BUILD

Build `brand.html` as a **beautiful, scrollable brand guidelines page** with these sections:

### Section 1: Cover
Full-width dark hero. Logo mark (large, centered, 80px). Wordmark below. Tagline. "TradeCalc Brand Guidelines 2026" in small caps. The brand emerald radial glow in the background.

### Section 2: The Brand
Two columns. Left: "Our Identity" — the business context paragraph, brand voice attributes (precise, confident, direct, expert). Right: the wordmark in all three variants:
1. Primary (dark bg): Trade white + Calc emerald
2. Monochrome dark (dark bg): All white
3. Monochrome light (white bg, shown as inset card): All dark

### Section 3: Logo Mark
Show the SVG logo mark at: 16px, 32px, 48px, 80px, 120px — in a row on dark background.
Below: Logo construction diagram with annotations (arc, grid, accent dot, bounding box).
Below: Clear space rule — show minimum padding (equal to the width of the "T" in TradeCalc).
Below: Logo don'ts — 4 examples: wrong color, distorted, rotated, on busy background.

### Section 4: Color System
**Primary Palette:**
For each color: a large color swatch (200×120px rounded card), hex value in JetBrains Mono, RGB, HSL, color name, and usage note. Render: Brand Emerald, Brand Emerald Deep, Brand Emerald Subtle, Brand Amber, Brand Amber Subtle.

**Background Scale:**
Show all 5 levels as stacked rectangles (each 100% wide, 60px tall) with the hex value and name overlaid. The rectangles show the actual color difference — not just labels.

**Text Scale:**
Show each text color as sample text: "The customs value is £37,890.62" — rendered in that color on the dark canvas background.

**Data Visualization Palette:**
Show as a donut chart (built with SVG) using all 7 data colors. Label each segment with the cost category name.

### Section 5: Typography
For each font family (Syne, DM Sans, JetBrains Mono):
- Font name and source
- Personality description
- Character specimen: ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
- All available weights rendered

Then: Type Scale examples — show each scale step as live text:
- Display 2XL: "Know exactly what your imports cost."
- Display LG: "Customs Valuation Engine"
- Body LG: "Our engines run simultaneously: customs valuation, tariff measures..."
- Data XL (JetBrains Mono): "£ 54,284.17"
- Label MD (caps): "HOW IT WORKS"

### Section 6: Spacing & Shape
**Spacing:** Show each spacing token as a colored bar of that exact height, labeled with the value and token name.
**Shape:** Show a square card rendered at each border-radius value (2, 4, 8, 12, 16, 24, pill), labeled.
**Shadow:** Show each shadow applied to an identical card, labeled.

### Section 7: Icons
Show a 6×4 grid of the most-used icons from the icon list above, rendered at 24px, in #F0F4FF on dark cards. Each icon labeled with its Lucide name. Render as actual SVG paths (not an icon library — inline the SVG paths for the 24 most important icons).

### Section 8: Motion
For each animation token, show a live animated demonstration:
- fadeUp: A card entering from below (loops every 3s)
- brandPulse: The pulsing dot (infinite)
- countUp: A number counting from 0 to £54,284 (loops every 4s)
- progressFill: A bar filling to 87% (loops every 3s)
- float: The widget floating up and down (infinite)

Use CSS keyframes for all — no JS libraries.

### Section 9: Voice & Copy
Show correct vs incorrect copy side-by-side for 5 examples:
1. Headline: ✓ "Know exactly what your imports cost." vs ✗ "Powerful trade calculations made easy!"
2. Data: ✓ "£37,890.62" vs ✗ "approximately £38K"
3. Status: ✓ "Calculation complete" vs ✗ "Your calculation has been successfully completed!"
4. Error: ✓ "HS code not found in UK tariff database." vs ✗ "Invalid input. Please try again."
5. Action: ✓ "Calculate →" vs ✗ "Click here to calculate"

Each pair: green ✓ indicator and red ✗ indicator, DM Sans, on dark card.

### Section 10: UI Components Preview
Show the actual components rendered:

**Buttons:** All variants side-by-side — Primary, Secondary, Ghost, Pro/Amber, Destructive — at all 3 sizes.

**Inputs:** Default, Focused (brand glow border), Error state, with icon prefix — all labeled.

**Badges/Tags:** FREE badge, PRO badge, all status colors (success, warning, error, info).

**Cards:** Default card, elevated card, brand-border highlighted card — with sample content.

**Sample Calculator Result:** A mini version of the result card showing:
- "TOTAL LANDED COST" label
- "£ 54,284.17" in JetBrains Mono 800 28px #F0F4FF
- Confidence score bar (87%, brand emerald)
- 4 cost rows (Customs Value, Duty, VAT, Clearance) with colored bars

---

## TECHNICAL IMPLEMENTATION REQUIREMENTS

**HTML Structure:** Semantic HTML5. `<section>` for each guidelines section. `<h2>` for section titles. Clean, readable markup.

**CSS:** One `<style>` block in `<head>`. Use CSS custom properties matching the exact variable names specified. No CSS frameworks.

**Fonts:** Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Navigation:** Sticky left sidebar nav (desktop) linking to each section. Smooth scroll. Active section highlighted. On mobile: hide sidebar, show at top.

**Color swatches:** Render using `<div>` with inline background-color. Show hex values in JetBrains Mono. Include a "Copy" button on each swatch that copies the hex to clipboard (JS).

**Live components in Section 10:** All button hover effects must work. Input focus states must work. The mini result card must have the correct fonts and data colors.

**The donut chart:** Build with SVG `<circle>` elements and stroke-dasharray/stroke-dashoffset to create segments. Animate the segments drawing in on page load.

**Overall quality:** This page itself IS the brand. It must look extraordinary. If a designer opened this page, they should immediately feel the precision and authority of the TradeCalc brand. Generous whitespace. Perfect typography. No shortcuts.

---

## DELIVERABLE

A single `brand.html` file.

- Complete brand guidelines page
- All sections implemented
- All live demonstrations working
- All colors, fonts, and spacing exactly as specified
- Responsive at 375px, 768px, 1280px
- Print-friendly (a designer should be able to print this as a PDF reference)
- Zero broken states — every section works independently
- The page itself proves the brand system works by being beautiful

When complete, a designer should be able to hand this page to any developer or agency and have them implement the TradeCalc brand perfectly across any surface.
