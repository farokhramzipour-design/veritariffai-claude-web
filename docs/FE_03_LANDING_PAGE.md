# FE_03 — Landing Page

## Page Philosophy

The landing page must accomplish three things in 8 seconds:
1. Tell the user **exactly** what this does
2. Make them believe it's the **most accurate** tool available
3. Remove every barrier to **trying it immediately**

Design tone: Think Bloomberg Terminal meets Stripe's homepage. Dark, data-confident, professional — but with frictionless UX.

---

## Section 1: Navigation

### Layout
Full-width, sticky top. 72px height. `backdrop-filter: blur(12px)` on scroll.

```
[TradeCalc Logo]   [How It Works] [Features] [Pricing]   [Login] [Try Free →]
```

### Logo
- Wordmark + icon: custom SVG combining a globe arc + calculator grid motif
- Colors: primary text `#F0F4FF`, accent dot in brand emerald
- Height: 32px

### Behavior
- On scroll > 100px: nav background transitions from transparent to `rgba(10, 13, 18, 0.95)` with border-bottom
- Mobile: hamburger → slide-down menu overlay
- "Try Free →" button: primary variant, opens calculator directly

---

## Section 2: Hero

### Layout
Full viewport height (min 100vh). Centered content, constrained to 900px max-width.

### Background
```css
/* Animated mesh gradient background */
background: radial-gradient(ellipse at 20% 50%, rgba(0, 200, 150, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(77, 171, 247, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(192, 132, 252, 0.05) 0%, transparent 50%),
            var(--color-bg-base);

/* Subtle grid overlay */
background-image: linear-gradient(var(--color-border-subtle) 1px, transparent 1px),
                  linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px);
background-size: 60px 60px;
```

### Content Structure

**Pre-headline badge (animated in):**
```
[🛡️ Customs-grade accuracy · Powered by live TARIC + UKGT data]
```
Style: Pill badge, subtle border, brand emerald icon, small caps text.

**Main Headline:**
```
Know exactly what
your imports cost.
```
- Font: Syne 800, 72px (desktop), 48px (mobile)
- Color: `#F0F4FF`
- Line height: 1.0
- Animation: words fade up with 100ms stagger

**Sub-headline:**
```
The only trade cost calculator that combines real customs
valuation, live tariff measures, and origin rules — in one place.
Stop guessing. Start knowing.
```
- Font: DM Sans 400, 20px
- Color: `var(--color-text-secondary)`
- Max-width: 600px, centered

**CTA Group:**
```
[Calculate Your Import Cost →]   [Watch 2-min Demo ▷]
```
Primary button (XL size) + ghost button with play icon. Both inline.
Below: "No credit card required · Free for single HS code"

**Social Proof Strip (below CTAs):**
```
Trusted by 2,400+ importers · 98.2% accuracy on standard shipments · £2.3B calculated
```
Monospace font, small, tertiary text color. Numbers animated via countUp on viewport entry.

### Right Side: Live Demo Widget
(Desktop only — hidden on mobile)

```
┌─────────────────────────────────────┐
│ 🧮 Quick Estimate                   │
│ ─────────────────────────────────── │
│ HS Code: [8471300000              ] │
│ Origin:  [China (CN)          ▼   ] │
│ Value:   [$ 10,000               ] │
│ Incoterm:[FOB                  ▼  ] │
│                                     │
│       [Calculate →]                 │
│ ─────────────────────────────────── │
│ Estimated Import Duty               │
│ ──────────────                      │
│ UK Import Duty      £ 0.00    0%    │ ← Live result
│ UK VAT             £ 2,000   20%    │
│ Freight + CIF      £ 1,200          │
│ ─────────────────────────────────── │
│ Total Landed Cost  £13,200          │
│                  [Sign in for full →]│
└─────────────────────────────────────┘
```

This is a **functional** mini-calculator component. It calls the API and returns a real (simplified) result. It demonstrates the product is real, not vaporware.

Animation: Card floats in from right with slight rotation (`rotateY(-5deg)` → `0`) on page load.

---

## Section 3: Social Proof / Logos

### Layout
Full-width band. 120px height. `background: var(--color-bg-surface)`.

### Content
```
Trusted by customs brokers and importers at:

[Logo] [Logo] [Logo] [Logo] [Logo] [Logo]
```
- 6 company logos (greyscale, 40px height)
- Horizontal scroll on mobile with `overflow-x: auto`
- Logos fade in with stagger animation on viewport entry

---

## Section 4: The Problem / Why It Exists

### Layout
Two-column. Left: problem framing. Right: visual.

### Left Content
**Section label:** `WHY IT MATTERS`

**Headline:** `Getting import costs wrong is expensive.`

**Body copy (3 paragraphs, short):**
- Traditional brokers: slow, expensive, manual
- Spreadsheet estimates: miss anti-dumping duties, quota rates, FX timing
- "Calculator" tools: ad valorem only, ignore customs valuation rules

**Stat blocks (3, inline):**
```
47%     of importers              12%     average landing cost         £18K    average customs
        underpay or overpay       underestimation in complex trades    penalty per breach
        duty in year 1            (our audit sample, 2024)
```
All numbers in monospace, emerald color.

### Right Visual
Animated comparison card:
```
❌ Spreadsheet estimate    ✅ TradeCalc result
────────────────────        ────────────────────
Invoice value  £10,000     Customs value   £11,250
Duty rate       0%         Duty (anti-dumping) £1,237
VAT            £2,000      VAT             £2,497
─────────────              ─────────────────────
TOTAL          £12,000     TOTAL          £14,984

                           Difference:   £2,984 💸
```
The gap number pulses in red on viewport entry.

---

## Section 5: How It Works

### Layout
Centered, single column. Max-width 800px.

### Section label
`HOW IT WORKS`

### Headline
`From invoice to landed cost in 3 steps.`

### Step Cards (3 cards, horizontal on desktop, vertical mobile)

**Step 1: Describe Your Shipment**
- Icon: `Package` (Lucide)
- Copy: Enter your HS code, origin country, invoice value, and Incoterm. We validate your classification and flag any misclassification risk.

**Step 2: Engines Analyze Your Data**
- Icon: `Cpu` (Lucide)
- Copy: Our 11 calculation engines run simultaneously — customs valuation, tariff measures, origin rules, VAT, excise, and more. All using live TARIC and UKGT data.

**Step 3: Get Your Full Cost Breakdown**
- Icon: `BarChart3` (Lucide)
- Copy: See every cost component — duty, VAT, excise, clearance — with the formula behind each number. Export to PDF for your broker or finance team.

**Animation:** Cards reveal left → center → right with 150ms stagger on viewport entry.

---

## Section 6: Features (Free vs Pro)

### Layout
Two-column feature comparison table with a glow card highlighting Pro.

### Headline
`Built for how customs actually works.`

### Sub-headline
`We cover every engine that affects your real landed cost.`

### Feature Table

| Feature | Free | Pro |
|---|---|---|
| HS Code Validation | ✅ | ✅ |
| Basic Ad Valorem Duty | ✅ | ✅ |
| Standard VAT (20% UK) | ✅ | ✅ |
| Single HS line | ✅ | ✅ |
| Customs Valuation Engine | — | ✅ |
| Anti-Dumping + Safeguard Duties | — | ✅ |
| Tariff Quota Logic | — | ✅ |
| Rules of Origin / Preferential Rates | — | ✅ |
| Official HMRC / ECB FX Rates | — | ✅ |
| Excise Duty (Alcohol, Tobacco, Energy) | — | ✅ |
| Multi-line Invoice (up to 500 lines) | — | ✅ |
| Full Audit Trail | — | ✅ |
| PDF Export | — | ✅ |
| Compliance & Sanction Flags | — | ✅ |

Table style: dark, subtle borders, emerald checkmarks, lock icons for — cells with tooltip "Pro feature".

**CTA below table:** `[Start Free] [Upgrade to Pro →]`

---

## Section 7: Accuracy / Trust

### Layout
Dark section with brand accent. Centered.

### Headline
`Accuracy you can stake a shipment on.`

### Three stats (large, monospace):

```
95%+          90–94%         85–92%
accuracy      accuracy       accuracy
Simple        Standard       Complex
shipments     commercial     regulated goods
```

### Below stats:
Body copy explaining how confidence scoring works. Link to "How accuracy is measured →"

### Visual: Mini Audit Trail Preview
```
📋 Calculation Audit Trail

✅ HS Code validated: 8471300000 — "Portable computers"
✅ Customs value: £11,250 (FOB + freight + insurance, HMRC rate applied)
✅ Anti-dumping measure: CN0012 — 14.9% (Regulation (EU) 2023/1775)
✅ VAT base: £11,250 + £1,574 duty = £12,824
✅ Confidence score: 0.91
```
Monospace font, terminal-style. Lines type-in on viewport entry (typewriter effect, subtle).

---

## Section 8: Pricing Preview

### Layout
Centered. Two cards (Free, Pro).

### Headline
`Simple, honest pricing.`

### Cards

**Free Card:**
```
Free
─────
£0 / month
For single-line estimates

✓ HS code validation
✓ Basic duty lookup
✓ Standard VAT
✓ 10 calculations/hour
─────
[Start Free →]
```

**Pro Card (featured — brand border, glow):**
```
Pro            [Most Popular]
─────
£49 / month   (£39 billed annually)
For serious importers and brokers

Everything in Free, plus:
✓ All 11 calculation engines
✓ Anti-dumping, safeguards, quotas
✓ Rules of origin + preferences
✓ Up to 500 lines per calculation
✓ PDF export + audit trail
✓ 500 calculations/hour
─────
[Get Pro Access →]
```

Link: "See full feature comparison →" → /pricing

---

## Section 9: FAQ

### Layout
Two-column, accordion items. Left: 3 questions. Right: 3 questions.

### Questions
1. What countries/jurisdictions do you support?
2. How often is tariff data updated?
3. What's the difference between Free and Pro?
4. Can I use this for export calculations?
5. How accurate is the anti-dumping calculation?
6. Do you support multi-currency invoices?

### Behavior
Click to expand with smooth height animation (Framer Motion `AnimatePresence`).

---

## Section 10: CTA Banner

### Layout
Full-width, 280px height. Mesh gradient background (brand emerald + dark).

### Content
```
Calculate your true landed cost. Free to start.

The most accurate trade cost calculator — backed by live customs data.

[Calculate Free →]     [Talk to Sales]
```

---

## Section 11: Footer

### Layout
4-column grid. `border-top: 1px solid var(--color-border-subtle)`.

**Column 1: Brand**
- Logo + tagline
- "Built for customs professionals"
- Social links: LinkedIn, Twitter/X

**Column 2: Product**
- Features, Pricing, Changelog, API Docs

**Column 3: Company**
- About, Blog, Contact, Privacy Policy, Terms

**Column 4: Compliance**
- "Data sourced from TARIC and HMRC official databases"
- "Not a substitute for professional customs advice"
- GDPR notice

---

## SEO & Meta

```typescript
// app/page.tsx
export const metadata = {
  title: 'TradeCalc — Customs Import Duty Calculator with Live TARIC Data',
  description: 'Calculate your true import costs with customs-grade accuracy. Anti-dumping duties, rules of origin, VAT, excise — all from live TARIC and UKGT data.',
  keywords: 'import duty calculator, customs duty calculator, TARIC, landed cost calculator, anti-dumping duty, rules of origin',
  openGraph: {
    title: 'TradeCalc — Know exactly what your imports cost',
    description: '...',
    image: '/og-image.png',  // 1200×630, dark design with product screenshot
  }
}
```

## Performance Targets for Landing Page
- LCP < 2.0s
- FID < 100ms
- CLS < 0.1
- Landing page JS bundle: < 150KB gzipped
- Hero image: WebP, responsive sizes
- Above-the-fold: no layout shift
