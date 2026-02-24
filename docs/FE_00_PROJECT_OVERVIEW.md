# Frontend Project Overview — Trade Cost Engine

## Project Identity

| Field | Value |
|---|---|
| Product Name | TradeCalc (working title) |
| Stack | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion |
| State Management | Zustand (global) + React Query (server state) |
| Forms | React Hook Form + Zod |
| Auth | Firebase Auth (Google OAuth) — matches backend |
| Payments | Stripe.js + Stripe Elements |
| Deployment | Vercel (primary) or AWS CloudFront + S3 |
| Target Devices | Desktop-first (complex calculator UX) + responsive mobile |
| Design Philosophy | Precision instrument — confident, data-dense, trustworthy |

---

## Document Index

| File | Scope |
|---|---|
| `FE_00_PROJECT_OVERVIEW.md` | This file |
| `FE_01_DESIGN_SYSTEM.md` | Tokens, typography, colors, spacing, components |
| `FE_02_INFORMATION_ARCHITECTURE.md` | Pages, routes, nav structure, user flows |
| `FE_03_LANDING_PAGE.md` | Full landing page section-by-section spec |
| `FE_04_CALCULATOR_UX.md` | Calculator wizard flow, input design, result display |
| `FE_05_AUTH_FLOW.md` | Google login, onboarding, plan gate UI |
| `FE_06_DASHBOARD.md` | User dashboard, history, saved calculations |
| `FE_07_UPGRADE_FLOW.md` | Pro upgrade, pricing page, Stripe checkout |
| `FE_08_COMPONENT_LIBRARY.md` | All reusable components with prop specs |
| `FE_09_STATE_MANAGEMENT.md` | Zustand stores, React Query patterns |
| `FE_10_API_INTEGRATION.md` | API client, error handling, loading states |
| `FE_11_PERFORMANCE.md` | Core Web Vitals targets, optimization strategy |
| `FE_12_ACCESSIBILITY.md` | WCAG 2.1 AA compliance, keyboard nav |
| `FE_13_TESTING_STRATEGY.md` | Unit, integration, visual regression, E2E |

---

## Core UX Principles

### 1. Progressive Disclosure
Never overwhelm. Show only what the user needs at each step. The calculator wizard reveals complexity gradually — not all 11 engines at once.

### 2. Confidence Through Transparency
Customs calculations feel like a black box to most users. The UI must make the engine's work visible: show the formula, the exchange rate used, why a duty is applied. Trust = transparency.

### 3. Instant Gratification for Free Users
Free users should reach a result in under 2 minutes with zero friction. No registration wall before trying. Show the value before asking for payment.

### 4. Frictionless Upgrade
The moment a user hits a Pro feature, the upgrade path must be immediate, clear, and non-hostile. Never block with a rude modal — instead, show a preview of what they'd get and offer one-click upgrade.

### 5. Data Density Done Right
This is a professional tool. Unlike consumer apps, users want detail. But data density must be structured — hierarchy, whitespace, and visual grouping prevent overwhelm.

---

## Tech Stack Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for landing page SEO, RSC for performance, file-based routing |
| Language | TypeScript (strict mode) | Type safety catches API contract errors, IDE support |
| Styling | Tailwind CSS + CSS Modules for complex components | Rapid development + escape hatch for complex animations |
| Animations | Framer Motion | Professional-grade animation, layout animations, gesture support |
| Icons | Lucide React | Consistent, tree-shakeable, well-maintained |
| Charts | Recharts | For cost breakdown visualization |
| Forms | React Hook Form + Zod | Performance-first forms, shared schema validation with backend |
| HTTP Client | Axios with interceptors | Request/response transformation, auth header injection |
| Server State | TanStack Query (React Query) | Caching, background refresh, optimistic updates |
| Global State | Zustand | Lightweight, TypeScript-native, no boilerplate |
| Auth | Firebase Auth JS SDK | Matches backend Firebase Admin |
| Payments | @stripe/stripe-js + @stripe/react-stripe-js | PCI-compliant Stripe Elements |
| Analytics | PostHog | Product analytics, session recording, feature flags (client-side) |
| Error Tracking | Sentry | Frontend error tracking |
| Testing | Vitest + Testing Library + Playwright | Fast unit tests, E2E |

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.tradecalc.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_SENTRY_DSN=...
```

Never expose: backend JWT secret, Stripe secret key, any server-side credentials.

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── (app)/                    # Protected routes (require auth)
│   │   ├── layout.tsx            # App shell layout
│   │   ├── dashboard/page.tsx
│   │   ├── calculator/
│   │   │   ├── page.tsx          # Calculator wizard
│   │   │   └── result/[id]/page.tsx
│   │   ├── history/page.tsx
│   │   └── settings/page.tsx
│   ├── pricing/page.tsx
│   └── api/                      # Next.js API routes (thin proxy / auth)
│       └── auth/[...nextauth]/
│
├── components/
│   ├── ui/                       # Primitive components (Button, Input, etc.)
│   ├── calculator/               # Calculator-specific components
│   ├── results/                  # Result display components
│   ├── landing/                  # Landing page sections
│   ├── dashboard/                # Dashboard components
│   └── layout/                   # Header, Footer, Sidebar
│
├── lib/
│   ├── api/                      # API client + React Query hooks
│   ├── auth/                     # Firebase auth helpers
│   ├── stores/                   # Zustand stores
│   ├── schemas/                  # Zod schemas (shared with forms)
│   └── utils/                    # Formatting, calculations helpers
│
├── styles/
│   ├── globals.css               # Tailwind base + CSS variables
│   └── fonts.css                 # Font-face declarations
│
└── types/                        # TypeScript type definitions
    ├── api.ts                    # API response types
    ├── calculator.ts             # Calculator domain types
    └── user.ts                   # User and plan types
```
