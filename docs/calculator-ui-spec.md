# Export Calculator — UI Component Specification
## For UI Agent Implementation

> **Stack:** React + Vite + Tailwind CSS  
> **Theme:** Dark cyber-industrial — `#060910` base, `#00e5ff` cyan accent, `#ff6b35` orange, `#00d97e` green  
> **Fonts:** `Syne` (display/headings, weights 400–800) + `JetBrains Mono` (data/mono) — import from Google Fonts  
> **Component:** `CalculatorPanel` — self-contained, lives inside the main dashboard content area

---

## 1. Design System Tokens

```css
/* Paste into your global CSS / Tailwind config */
:root {
  /* Backgrounds */
  --bg:       #060910;
  --s1:       #0c1220;
  --s2:       #111b2e;
  --s3:       #162038;

  /* Borders */
  --border:   #1c2d47;
  --border2:  #243550;

  /* Accent colours */
  --cyan:     #00e5ff;
  --orange:   #ff6b35;
  --green:    #00d97e;
  --gold:     #ffd166;
  --purple:   #b388ff;
  --red:      #ff5370;

  /* Text */
  --text:     #dce9ff;
  --muted:    #4a6a8a;
  --muted2:   #6a8aaa;
}
```

---

## 2. Page-Level Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  TOPBAR (fixed, 56px)                                           │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  SIDEBAR     │  MAIN CONTENT AREA                               │
│  240px       │  flex-col gap-6 p-6                              │
│  (fixed)     │                                                  │
│              │  ┌──────────────────────────────────────────┐   │
│              │  │  CALCULATOR PANEL  (primary, ~60% width) │   │
│              │  └──────────────────────────────────────────┘   │
│              │  ┌──────────────────────────────────────────┐   │
│              │  │  RESULTS PANEL  (appears after submit)   │   │
│              │  └──────────────────────────────────────────┘   │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

On desktop (≥1280px): Calculator and Results sit side-by-side in a 60/40 split.  
On tablet (<1280px): Stacked vertically, Calculator on top.  
On mobile (<768px): Full width, sidebar collapses to bottom nav.

---

## 3. CalculatorPanel Component

### 3.1 Panel Shell

```
Background:    var(--s1)
Border:        1px solid var(--border)
Border-radius: 8px
Padding:       32px
Position:      relative (for corner accents)
```

**Corner accent decoration** — pure CSS, no images:
- Top-left corner: 16px × 16px cyan bracket `⌐` shape using `::before` / `::after` pseudo-elements
- Bottom-right corner: matching bracket in muted color
- These are just decorative borders using `border-top + border-left` on a positioned element

**Panel header:**
```
┌─────────────────────────────────────────────────────┐
│  [🧮 icon]  EXPORT CALCULATOR          [?] help btn  │
│  Calculate landed cost, duties & tariffs             │
└─────────────────────────────────────────────────────┘
```
- Title: `Syne`, 16px, weight 700, `var(--text)`
- Subtitle: `JetBrains Mono`, 11px, `var(--muted2)`
- Help button: 20px icon button, opens tooltip/modal with explanation

---

### 3.2 Section A — Natural Language Input

This is the top, most prominent section of the calculator.

```
┌─────────────────────────────────────────────────────────────────┐
│  🧠  AI AUTOFILL                                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Describe your shipment...                              │   │
│  │                                                         │   │
│  │  e.g. "leather shoes from Birmingham to Paris, £2,000"  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [ ✦ Autofill fields with AI ]          [ ✕ Clear ]            │
└─────────────────────────────────────────────────────────────────┘
```

**Textarea:**
- Background: `var(--bg)`
- Border: `1px solid var(--border)`
- Border on focus: `1px solid var(--cyan)` + `box-shadow: 0 0 0 3px rgba(0,229,255,0.08)`
- Font: `JetBrains Mono`, 13px, `var(--text)`
- Placeholder: `var(--muted)`, italic
- Min-height: 80px, max-height: 160px (auto-expands)
- Resize: vertical only
- Padding: 14px 16px
- Border-radius: 6px

**Autofill button:**
- Background: `rgba(0,229,255,0.08)`
- Border: `1px solid rgba(0,229,255,0.2)`
- Color: `var(--cyan)`
- Font: `Syne`, 12px, weight 700, letter-spacing 0.08em
- Padding: 10px 20px
- Border-radius: 4px
- Hover: `background: rgba(0,229,255,0.14)`, `border-color: var(--cyan)`
- Loading state: replace icon with spinning circle, text becomes "Analysing..."
- The `✦` icon is a unicode star/sparkle — use `✦` (U+2736) or a lucide `Sparkles` icon

**Section label style** (reuse for all sections):
```css
font-family: 'Syne';
font-size: 10px;
font-weight: 700;
letter-spacing: 0.18em;
text-transform: uppercase;
color: var(--muted);
display: flex;
align-items: center;
gap: 10px;
margin-bottom: 16px;
/* line after the label: */
::after { content: ''; flex: 1; height: 1px; background: var(--border); }
```

---

### 3.3 Section B — Structured Input Fields

Two-column grid on desktop, single column on mobile.

```
┌────────────────────────────────┬────────────────────────────────┐
│  PRODUCT DESCRIPTION           │  HS CODE                       │
│  [________________________]    │  [__________] [🔍 Lookup]      │
│                                │  ● 94% confidence              │
├────────────────────────────────┼────────────────────────────────┤
│  ORIGIN COUNTRY                │  DESTINATION COUNTRY           │
│  [🔽 United Kingdom       ]    │  [🔽 France                ]   │
├────────────────────────────────┼────────────────────────────────┤
│  DECLARED VALUE                │  CURRENCY                      │
│  [2000.00__________________]   │  [🔽 GBP £             ]       │
├────────────────────────────────┼────────────────────────────────┤
│  GROSS WEIGHT                  │  INCOTERMS                     │
│  [_____________________kg ]    │  [🔽 FOB - Free on Board  ]    │
└────────────────────────────────┴────────────────────────────────┘
```

#### Field Component Spec (applies to all text inputs)

```
Label:        JetBrains Mono, 10px, var(--muted2), letter-spacing 0.1em, uppercase
              margin-bottom: 6px

Input:        background: var(--bg)
              border: 1px solid var(--border)
              border-radius: 5px
              padding: 11px 14px
              font: JetBrains Mono 13px var(--text)
              width: 100%

Focus:        border-color: var(--cyan)
              box-shadow: 0 0 0 3px rgba(0,229,255,0.07)
              outline: none

AI-filled:    border-color: rgba(0,229,255,0.35)
              background: rgba(0,229,255,0.03)
              show small "AI" badge top-right of field (see below)

Error:        border-color: var(--red)
              show error message below in var(--red), 11px

Disabled:     opacity: 0.4, cursor: not-allowed
```

**AI-filled badge** (appears when value was set by AI autofill):
```
Position: absolute, top: -8px, right: 8px
Background: rgba(0,229,255,0.1)
Border: 1px solid rgba(0,229,255,0.2)
Color: var(--cyan)
Font: JetBrains Mono, 9px, letter-spacing 0.1em
Text: "AI"
Padding: 1px 6px
Border-radius: 3px
```

#### HS Code Field — Special Behaviour

```
┌──────────────────────────────────────────┐
│  HS CODE                          [AI]   │
│  ┌──────────────────┐ [🔍 Lookup]        │
│  │  6403510000      │                    │
│  └──────────────────┘                    │
│  ●●●●●●●●●░ 94% confidence              │
│  Footwear with outer soles of rubber...  │
│  [↗ View on Trade Tariff]                │
└──────────────────────────────────────────┘
```

- Confidence bar: thin 4px height bar, cyan fill, `border-radius: 2px`, animates in on fill
- Confidence text: `JetBrains Mono`, 11px
  - ≥85% → `var(--green)`
  - 70–84% → `var(--gold)`
  - <70% → `var(--red)`
- Description text: 11px, `var(--muted2)`, 1 line truncated with ellipsis
- "View on Trade Tariff" link: 10px, `var(--cyan)`, opens in new tab
- Lookup button: same style as a secondary icon button — `var(--border2)` background, magnifier icon

**HS Code Drawer** (slides in from right on "Lookup" click, or from bottom on mobile):
```
Width:        400px (desktop), full-width (mobile)
Background:   var(--s1)
Border-left:  1px solid var(--border)
Padding:      24px

Contents:
  - Title: "HS Code Lookup"
  - Search input (autofocused)
  - Results list: each item shows code + description + confidence score
  - Selected item highlighted with cyan left border
  - "Use this code" button (cyan, full-width, bottom)
  - "Manual override" toggle (allows free-text entry)
```

#### Country Dropdown Spec

```
Trigger:      Same as input field style + dropdown chevron on right
              Chevron: var(--muted), rotates 180° when open

Dropdown:     Position: absolute, z-index: 50
              Background: var(--s2)
              Border: 1px solid var(--border2)
              Border-radius: 6px
              Box-shadow: 0 8px 32px rgba(0,0,0,0.5)
              Max-height: 240px, overflow-y: auto
              Padding: 6px

Search input inside dropdown:
              Sticky at top
              Background: var(--bg)
              Border-bottom: 1px solid var(--border)
              No border-radius

Country item:
              Padding: 10px 14px
              Font: JetBrains Mono, 12px, var(--text)
              Display: flex, gap: 10px
              Flag emoji on left (use country flag emoji)
              Hover: background var(--s3)
              Selected: background rgba(0,229,255,0.08), left border 2px cyan
```

#### Incoterms Dropdown

Same dropdown style as country, but shows 4 options with descriptions:
```
EXW  Ex Works          — Buyer takes all risk from seller's premises
FOB  Free on Board     — Seller responsible until goods on vessel
CIF  Cost Insurance    — Seller covers cost, insurance, freight
DDP  Delivered Duty    — Seller responsible for all costs to destination
```
Each row: code in `var(--cyan)`, description in `var(--muted2)`.

---

### 3.4 Section C — Advanced Options (Collapsed by Default)

```
┌─────────────────────────────────────────────────────────────┐
│  ▶ ADVANCED OPTIONS                                [toggle] │
└─────────────────────────────────────────────────────────────┘
```

When expanded:
```
┌────────────────────────────────┬────────────────────────────┐
│  INSURANCE VALUE (optional)    │  FREIGHT COST (optional)   │
│  [_________________________]   │  [_______________________] │
├────────────────────────────────┴────────────────────────────┤
│  ☐  Include anti-dumping check                              │
│  ☐  Include excise duty (alcohol/tobacco/energy)            │
│  ☐  Goods are of UK origin (for TCA RoO preference)         │
└─────────────────────────────────────────────────────────────┘
```

Checkboxes:
```
Custom checkbox:  16px × 16px square
                  Background: var(--bg), border: 1px solid var(--border)
                  Border-radius: 3px

Checked:          Background: var(--cyan), border-color: var(--cyan)
                  Checkmark: white SVG icon inside

Label:            JetBrains Mono, 12px, var(--text)
```

---

### 3.5 Section D — Calculate Button

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│         [ ⚡ Calculate Export Costs → ]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Default state:**
```
Background:     linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,229,255,0.06))
Border:         1px solid rgba(0,229,255,0.3)
Color:          var(--cyan)
Font:           Syne, 14px, weight 700, letter-spacing 0.08em
Padding:        14px 32px
Width:          100%
Border-radius:  5px
Cursor:         pointer
```

**Hover state:**
```
Background:     rgba(0,229,255,0.18)
Border-color:   var(--cyan)
Box-shadow:     0 0 24px rgba(0,229,255,0.15)
Transform:      translateY(-1px)
Transition:     all 0.2s ease
```

**Disabled state** (fields not complete):
```
Opacity:        0.35
Cursor:         not-allowed
Tooltip on hover showing which fields are missing
```

**Loading state** (API call in progress):
```
Background:     rgba(0,229,255,0.06)
Color:          var(--muted2)
Cursor:         wait

Replace button content with:
  [spinning arc icon]  Calculating...

Show progress steps BELOW the button (animated in one by one):
  ✅ HS code validated
  ✅ Duty rate fetched (UK Trade Tariff)
  ✅ FX rate fetched · GBP → EUR: 1.170
  ⏳ Checking Rules of Origin...
  ○  Building cost estimate...

Step item style:
  Font: JetBrains Mono, 11px
  ✅ = var(--green)
  ⏳ = var(--cyan) with pulsing opacity animation
  ○  = var(--muted)
  Stagger animation: each step fades in 300ms after previous
```

---

## 4. ResultsPanel Component

Appears to the right of (desktop) or below (tablet/mobile) the calculator after a successful calculation. Animates in with `fadeInUp` (translateY 12px → 0, opacity 0 → 1, 0.3s ease).

---

### 4.1 Confidence Score Meter

```
┌─────────────────────────────────────────────────────────────┐
│  ESTIMATE CONFIDENCE                                        │
│                                                             │
│  ████████████████████░░░░  91%                             │
│                                                             │
│  HS Code accuracy     ████████████  +30%   LIVE            │
│  Duty rate            ██████████░░  +25%   LIVE            │
│  Rules of Origin      ██████░░░░░░  +15%   CHECKED         │
│  VAT rate             ████░░░░░░░░  +10%   STATIC          │
│  Anti-dumping         ███░░░░░░░░░  +8%    LIVE            │
│  FX rate              ██░░░░░░░░░░  +5%    LIVE 1h cache   │
└─────────────────────────────────────────────────────────────┘
```

**Master score number:**
```
Font:           Syne, 48px, weight 800
Color:          ≥90% → var(--green) | 70–89% → var(--gold) | <70% → var(--red)
Animation:      Count up from 0 to final value over 1s using requestAnimationFrame
```

**Master bar:**
```
Height:         8px
Background:     var(--border)
Border-radius:  4px
Fill:           linear-gradient(90deg, var(--cyan), var(--purple))
Animate:        width 0 → final% over 1.2s cubic-bezier(0.4, 0, 0.2, 1)
```

**Factor rows:**
```
Each row:       grid, columns: 160px 1fr 48px 80px, gap: 12px, align: center
                Padding: 8px 0
                Border-bottom: 1px solid rgba(28,45,71,0.5)
                Clickable — expands to show source URL and reasoning

Factor name:    JetBrains Mono, 11px, var(--text)
Mini bar:       Height 4px, border-radius 2px
                Cyan fill for top factors, fades to muted for lower ones
Impact:         JetBrains Mono, 11px, weight 600, var(--cyan)
Source badge:   Tiny pill — "LIVE" in green, "STATIC" in gold, "AI" in purple
                Font: 8px, letter-spacing 0.12em, padding 1px 5px, border-radius 2px
```

---

### 4.2 Cost Breakdown Table

```
┌────────────────────────────────────────────────────────────────────┐
│  COST BREAKDOWN                   [GBP ▼]  [EUR ▼]  [USD ▼]       │
│                                                                    │
│  Component              Rate       GBP           EUR              │
│  ─────────────────────────────────────────────────────────────    │
│  Declared Value         —          £2,000.00      €2,340.00       │
│  Import Duty (MFN)      4.5%       £90.00         €105.30    [i]  │
│  Import VAT             20%        £418.00        €489.06    [i]  │
│  Freight (CIF add.)     —          £0.00          €0.00      [i]  │
│  Anti-Dumping           0%         £0.00          €0.00      [i]  │
│  ─────────────────────────────────────────────────────────────    │
│  TOTAL LANDED COST                 £2,508.00      €2,934.36       │
└────────────────────────────────────────────────────────────────────┘
```

**Table shell:**
```
Background:     var(--s1)
Border:         1px solid var(--border)
Border-radius:  6px
Overflow:       hidden
```

**Header row:**
```
Background:     var(--s2)
Padding:        10px 20px
Font:           JetBrains Mono, 9px, var(--muted), letter-spacing 0.14em, uppercase
Border-bottom:  1px solid var(--border)
```

**Data rows:**
```
Padding:        13px 20px
Font:           JetBrains Mono, 13px
Border-bottom:  1px solid var(--border)
Hover:          background var(--s2), transition 0.12s

Component name: var(--text)
Rate:           var(--muted2)
Amount GBP:     var(--text)
Amount EUR:     var(--muted2) (secondary currency, slightly dimmer)
```

**Total row:**
```
Background:     rgba(0,229,255,0.04)
Border-top:     1px solid rgba(0,229,255,0.15)
Font:           Syne, 14px, weight 700
Color:          var(--cyan)
No border-bottom
```

**Currency toggle buttons** (top right of table):
```
Three pill buttons: GBP / EUR / USD
Active:         Background rgba(0,229,255,0.1), border 1px solid rgba(0,229,255,0.25), color var(--cyan)
Inactive:       Background transparent, border 1px solid var(--border), color var(--muted2)
Font:           JetBrains Mono, 10px, weight 600
Padding:        4px 10px
Border-radius:  3px
```

**[i] info icon** (each row):
```
16px circle, var(--muted), on hover shows tooltip:
  "Source: UK Trade Tariff API · Last updated: 2 min ago · Cached"
  Background: var(--s3), border var(--border2), font JetBrains Mono 11px
```

---

### 4.3 Warnings & Flags Panel

Appears only when there are warnings. Each warning is its own card.

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠  Rules of Origin — Preferential Rate NOT Applied            │
│                                                                │
│  This product may not qualify for the UK-EU TCA 0% preferential│
│  duty rate. Standard MFN rate of 4.5% has been applied.        │
│                                                                │
│  [ View RoO Details ]                                          │
└────────────────────────────────────────────────────────────────┘
```

**Warning card:**
```
Background:     rgba(255,209,102,0.05)
Border:         1px solid rgba(255,209,102,0.2)
Border-left:    3px solid var(--gold)
Border-radius:  5px
Padding:        16px 20px
Margin-bottom:  8px

Icon:           ⚠ in var(--gold), 16px
Title:          Syne, 13px, weight 700, var(--gold)
Body:           JetBrains Mono, 11px, var(--muted2), line-height 1.6
```

**Error card** (critical):
```
Same but: background rgba(255,83,112,0.05), border var(--red), icon ✕ in var(--red)
```

**Info card** (low severity):
```
Same but: background rgba(0,229,255,0.04), border var(--cyan), icon ℹ in var(--cyan)
```

---

### 4.4 Rules of Origin Detail Card

Expandable, collapsed by default. Triggered by "View RoO Details" button.

```
┌──────────────────────────────────────────────────────────────┐
│  RULES OF ORIGIN — TCA ASSESSMENT            [▲ Collapse]   │
│                                                              │
│  HS Chapter:   64 — Footwear                                 │
│  TCA Rule:     Manufacture from materials of any heading,    │
│                except from headings 64.01 to 64.05           │
│                                                              │
│  AI Assessment:   ⚠ UNCERTAIN                               │
│  Confidence:      ████████░░  62%                            │
│                                                              │
│  Reasoning:                                                  │
│  "Unable to confirm origin of materials used in              │
│   manufacture. If materials are sourced from UK/EU,          │
│   the product likely qualifies. Recommend verification."     │
│                                                              │
│  Recommended Action:                                         │
│  → Obtain supplier declaration confirming UK/EU origin       │
│     of uppers and soles                                      │
│  → Consider applying for a Binding Tariff Information (BTI)  │
└──────────────────────────────────────────────────────────────┘
```

**Assessment badge:**
```
QUALIFIES:          Background rgba(0,217,126,0.1), color var(--green), border green
DOES NOT QUALIFY:   Background rgba(255,83,112,0.1), color var(--red), border red
UNCERTAIN:          Background rgba(255,209,102,0.1), color var(--gold), border gold
Font:               Syne, 10px, weight 700, letter-spacing 0.12em, uppercase
Padding:            3px 10px, border-radius: 3px
```

---

### 4.5 Action Bar (bottom of Results)

```
┌────────────────────────────────────────────────────────────────┐
│  [ 📄 Export PDF ]   [ 🔄 Recalculate ]   [ 💬 Ask AI ]        │
└────────────────────────────────────────────────────────────────┘
```

**Export PDF:**
```
Background: rgba(255,209,102,0.08)
Border:     1px solid rgba(255,209,102,0.2)
Color:      var(--gold)
```

**Recalculate:**
```
Background: rgba(255,107,53,0.08)
Border:     1px solid rgba(255,107,53,0.2)
Color:      var(--orange)
```

**Ask AI:**
```
Background: rgba(179,136,255,0.08)
Border:     1px solid rgba(179,136,255,0.2)
Color:      var(--purple)
```

All buttons:
```
Font:           Syne, 12px, weight 700, letter-spacing 0.06em
Padding:        10px 20px
Border-radius:  4px
Hover:          +10% opacity, translateY(-1px)
Transition:     all 0.18s
```

---

## 5. AI Chat Widget

A floating drawer on the right side of the screen. Triggered by clicking the "Ask AI" button or the floating chat button in the bottom-right corner.

```
┌────────────────────────────────────────────┐
│  🧠 AI ASSISTANT                  [✕ close]│
│  ─────────────────────────────────────────│
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  [Claude avatar]                     │ │
│  │  Hello! I can help you understand    │ │
│  │  your export calculation. What       │ │
│  │  would you like to know?             │ │
│  └──────────────────────────────────────┘ │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  [User avatar]                       │ │
│  │  Why is the duty rate 4.5%?          │ │
│  └──────────────────────────────────────┘ │
│                                           │
│  ┌──────────────────────────────────────┐ │
│  │  [Claude avatar]                     │ │
│  │  The 4.5% rate applies because...    │ │
│  │  [ Use this HS code ]                │ │
│  └──────────────────────────────────────┘ │
│                                           │
│  ─────────────────────────────────────────│
│  ┌─────────────────────────────────┐ [↑] │
│  │  Ask about this calculation...  │     │
│  └─────────────────────────────────┘     │
└────────────────────────────────────────────┘
```

**Drawer shell:**
```
Width:          380px (desktop), 100vw (mobile)
Height:         calc(100vh - 56px)  /* below topbar */
Position:       fixed, right: 0, top: 56px
Background:     var(--s1)
Border-left:    1px solid var(--border)
Transform:      translateX(100%) → translateX(0) when open
Transition:     transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)
Z-index:        40
```

**Message bubbles:**
```
Claude messages:  Background var(--s2), border 1px solid var(--border)
                  Border-radius: 0 8px 8px 8px
                  Margin-left: 0, margin-right: 32px

User messages:    Background rgba(0,229,255,0.06), border 1px solid rgba(0,229,255,0.12)
                  Border-radius: 8px 0 8px 8px
                  Margin-left: 32px, margin-right: 0

Font:             JetBrains Mono, 12px, var(--text), line-height 1.6
Padding:          12px 16px
```

**Typing indicator** (while Claude is responding):
```
Three dots animating with staggered scale pulse
Color: var(--cyan)
Size: 6px each, gap: 4px
```

**"Use this code" action button** (inside AI message, when AI suggests an HS code):
```
Display: block, margin-top: 8px
Background: rgba(0,229,255,0.08)
Border: 1px solid rgba(0,229,255,0.2)
Color: var(--cyan)
Font: JetBrains Mono, 10px
Padding: 5px 12px
Border-radius: 3px
```

**Chat input:**
```
Background:     var(--bg)
Border:         1px solid var(--border)
Border-radius:  5px
Font:           JetBrains Mono, 12px
Padding:        10px 14px
Focus:          border-color var(--cyan)
Send button:    Icon button with cyan arrow-up icon, right side of input
```

---

## 6. Floating Elements

### 6.1 API Status Bar (bottom of screen, fixed)

```
┌────────────────────────────────────────────────────────────────────┐
│  ● UK Tariff  LIVE    ● FX  LIVE  GBP/EUR: 1.170   ● TARIC  LIVE  │
│  Last calc: 2 min ago · Session confidence avg: 91%               │
└────────────────────────────────────────────────────────────────────┘
```

```
Height:         36px
Background:     rgba(6,9,16,0.95)
Border-top:     1px solid var(--border)
Font:           JetBrains Mono, 10px
Color:          var(--muted2)
Backdrop-filter: blur(8px)
Padding:        0 24px
Display:        flex, align-items: center, gap: 20px
```

Status dots:
```
● LIVE:    6px, var(--green), box-shadow 0 0 6px var(--green), pulse animation
● CACHED:  6px, var(--gold), no pulse
● DOWN:    6px, var(--red), pulse animation (faster, 0.8s)
```

### 6.2 Floating AI Chat Button (mobile / collapsed state)

```
Position:       fixed, bottom: 80px (above status bar), right: 20px
Width/Height:   48px circle
Background:     var(--s2)
Border:         1px solid var(--border)
Box-shadow:     0 4px 20px rgba(0,0,0,0.4)
Icon:           🧠 or Lucide `MessageSquare` in var(--purple)
Hover:          border-color var(--purple), box-shadow 0 0 16px rgba(179,136,255,0.2)
```

---

## 7. Micro-interactions & Animations

### Required Animations

```css
/* Fade in up — for results panel appearing */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Bar fill — for confidence and progress bars */
@keyframes barFill {
  from { width: 0; }
  to   { width: var(--target-width); }
}

/* Pulse dot — for live status indicators */
@keyframes pulseDot {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px currentColor; }
  50%       { opacity: 0.4; box-shadow: 0 0 2px currentColor; }
}

/* Skeleton loading */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--s2) 25%, var(--s3) 50%, var(--s2) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Typing indicator dots */
@keyframes typingDot {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
}
```

### Interaction Rules

- All hover transitions: `0.15s–0.2s ease`
- Panel open/close: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Confidence bar fill: `1.2s cubic-bezier(0.4, 0, 0.2, 1)` on mount
- Score counter: `1s` requestAnimationFrame count-up
- Results panel entrance: `fadeInUp 0.3s ease` with 0.1s delay
- Progress steps: stagger 300ms between each step
- Field AI-fill: each field fills with 80ms stagger between fields

---

## 8. Empty / Loading / Error States

### Skeleton Loader (while API responds)

Replace Results Panel with:
```
┌────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░  (confidence bar) │
│                                            │
│  ░░░░░░░░░░░  ░░░░░  ░░░░░░░░░░           │
│  ░░░░░░░░░░░  ░░░░░  ░░░░░░░░░░           │
│  ░░░░░░░░░░░  ░░░░░  ░░░░░░░░░░           │
│  ░░░░░░░░░░░  ░░░░░  ░░░░░░░░░░           │
└────────────────────────────────────────────┘
```
Use `.skeleton` class (shimmer animation) on placeholder divs.

### Empty State (first load, no calculation yet)

Show a subtle placeholder in the Results area:
```
[calculator icon, large, var(--border)]
Enter your shipment details and click
"Calculate Export Costs" to see your
full cost breakdown and duty estimate.
```

### API Error State

```
┌────────────────────────────────────────────┐
│  ✕  Calculation Failed                     │
│                                            │
│  UK Trade Tariff API is unavailable.       │
│  Using cached rates from 3 hours ago.      │
│  Confidence reduced to 65%.               │
│                                            │
│  [ Retry ]  [ Use Cached Data ]            │
└────────────────────────────────────────────┘
```

---

## 9. Responsive Breakpoints

```
≥1280px  (xl):  Two-column layout. Calculator left (60%), Results right (40%)
                Sidebar fixed, AI chat drawer on right
                Status bar always visible

1024–1279px:    Two-column layout narrows. 55/45 split.
                Sidebar collapsible with hamburger

768–1023px:     Single column. Calculator full width, Results below.
                Sidebar hidden by default, overlay on hamburger click.

<768px:         Full-width single column.
                Bottom navigation replaces sidebar (4 icons: Calc, History, HS Browse, Settings)
                Status bar hidden (accessible from menu)
                AI chat full-screen overlay
```

---

## 10. Accessibility Requirements

- All interactive elements: visible focus ring (`outline: 2px solid var(--cyan), outline-offset: 2px`)
- Color is never the only indicator — always pair with icon or text
- Dropdown menus: proper `role="listbox"`, `aria-selected`, keyboard nav (arrow keys + Enter + Escape)
- Loading states: `aria-live="polite"` region for progress steps
- Error messages: `role="alert"`, linked to input via `aria-describedby`
- Confidence score: `aria-label="Estimate confidence: 91 percent"`
- All icon-only buttons: `aria-label` attribute
- Minimum touch target: 44px × 44px on mobile

---

## 11. Component File Structure (Suggested)

```
src/
├── components/
│   ├── Calculator/
│   │   ├── CalculatorPanel.tsx       ← main wrapper
│   │   ├── NLInput.tsx               ← natural language textarea + autofill
│   │   ├── FieldGrid.tsx             ← the 2-col structured fields
│   │   ├── HSCodeField.tsx           ← HS code input + confidence + drawer
│   │   ├── CountrySelect.tsx         ← searchable country dropdown
│   │   ├── IncotermsSelect.tsx       ← Incoterms dropdown with descriptions
│   │   ├── AdvancedOptions.tsx       ← collapsible advanced section
│   │   └── CalculateButton.tsx       ← button + progress steps
│   │
│   ├── Results/
│   │   ├── ResultsPanel.tsx          ← main wrapper
│   │   ├── ConfidenceMeter.tsx       ← master score + factor bars
│   │   ├── CostTable.tsx             ← breakdown table + currency toggle
│   │   ├── WarningCards.tsx          ← amber/red warning banners
│   │   ├── RoODetail.tsx             ← rules of origin expandable card
│   │   └── ResultsActions.tsx        ← PDF / Recalculate / Ask AI buttons
│   │
│   ├── AIChat/
│   │   ├── ChatDrawer.tsx            ← slide-in drawer shell
│   │   ├── MessageList.tsx           ← chat history
│   │   ├── MessageBubble.tsx         ← individual message
│   │   ├── TypingIndicator.tsx       ← three-dot animation
│   │   └── ChatInput.tsx             ← input + send button
│   │
│   └── shared/
│       ├── StatusBar.tsx             ← bottom API status strip
│       ├── FloatingChatButton.tsx    ← mobile chat trigger
│       ├── Tooltip.tsx               ← reusable tooltip
│       ├── Badge.tsx                 ← reusable badge (AI / LIVE / STATIC)
│       └── SkeletonBlock.tsx         ← shimmer placeholder
│
├── hooks/
│   ├── useCalculator.ts              ← form state + submit logic
│   ├── useHSLookup.ts                ← HS code search + confidence
│   ├── useFX.ts                      ← FX rate polling + currency conversion
│   └── useAIChat.ts                  ← chat history + send message
│
└── api/
    ├── client.ts                     ← base axios/fetch instance
    ├── calculate.ts                  ← POST /api/calculate
    ├── hsLookup.ts                   ← POST /api/hs-lookup
    ├── dutyRate.ts                   ← GET /api/duty-rate
    └── fxRate.ts                     ← GET /api/fx-rate
```

---

## 12. API Integration Points

```typescript
// CalculateButton submits this payload:
interface CalculateRequest {
  product_description: string;
  hs_code: string;
  origin_country: string;        // ISO 2-letter e.g. "GB"
  destination_country: string;   // ISO 2-letter e.g. "FR"
  declared_value: number;
  currency: "GBP" | "EUR" | "USD";
  gross_weight_kg?: number;
  incoterms: "EXW" | "FOB" | "CIF" | "DDP";
  insurance_value?: number;
  freight_cost?: number;
  include_anti_dumping: boolean;
  include_excise: boolean;
  goods_uk_origin: boolean;
}

// Results panel consumes this response:
interface CalculateResponse {
  confidence: number;             // 0–100
  confidence_factors: {
    factor: string;
    contribution: number;
    source: "live" | "cached" | "static" | "ai";
    reasoning?: string;
  }[];
  cost_breakdown: {
    component: string;
    rate: string;
    amount_gbp: number;
    amount_eur: number;
    amount_usd: number;
    source?: string;
  }[];
  total_landed_cost: {
    gbp: number; eur: number; usd: number;
  };
  warnings: {
    type: "error" | "warning" | "info";
    title: string;
    message: string;
    action?: string;
  }[];
  roo: {
    qualifies: "yes" | "no" | "uncertain";
    confidence: number;
    tca_rule: string;
    reasoning: string;
    recommended_actions: string[];
  };
  hs_code: string;
  hs_description: string;
  hs_confidence: number;
  fx_rates: { gbp_eur: number; gbp_usd: number; updated_at: string; };
}
```

---

*Export Calculator — Calculator UI Spec v1.0*  
*Generated to complement architecture-spec.html and dashboard-features.md*
