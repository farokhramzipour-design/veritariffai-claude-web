# FE_11 — Performance

## Core Web Vitals Targets

| Metric | Target | Tool |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.0s | PageSpeed Insights |
| FID / INP (Interaction) | < 100ms | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTFB (Time to First Byte) | < 600ms | WebPageTest |
| FCP (First Contentful Paint) | < 1.2s | Lighthouse |

---

## Next.js Optimization Strategy

### Image Optimization
- Use `next/image` for ALL images (automatic WebP conversion, lazy loading, blur placeholder)
- Hero illustration: preload with `priority` prop (above the fold)
- Customer logos: lazy load (below fold)
- OG image: static, pre-generated

### Font Optimization
```typescript
// app/layout.tsx
import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',  // FOUT acceptable, prevents FOIT
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-body',
})
// JetBrains Mono loaded via @font-face in CSS (only used in app shell, not landing)
```

### Bundle Size Targets
| Bundle | Target |
|---|---|
| Landing page (route chunk) | < 150KB gzipped |
| Calculator (route chunk) | < 200KB gzipped |
| Shared vendor chunk | < 200KB gzipped |
| Total initial JS | < 350KB gzipped |

### Code Splitting
- Route-level splitting via Next.js App Router (automatic)
- Calculator wizard steps: dynamically imported
  ```typescript
  const Step2LineItems = dynamic(() => import('./Step2LineItems'), {
    loading: () => <StepSkeleton />,
    ssr: false  // Calculator is purely client-side
  })
  ```
- Charts: dynamic import (Recharts is large)
  ```typescript
  const CostBreakdownChart = dynamic(() => import('./CostBreakdownChart'), {
    loading: () => <ChartSkeleton />,
    ssr: false
  })
  ```
- PDF export: dynamic import (triggered on demand)

### Server Components Strategy (App Router)

| Component | Type | Reason |
|---|---|---|
| Landing page sections | Server Component | SEO, no interactivity |
| Navigation | Server Component + Client island | Static structure + auth state |
| Dashboard | Server Component shell + Client islands | Initial data via RSC |
| Calculator | Client Component | Highly interactive |
| Result page | Server Component + Client islands | SSR the static parts, hydrate charts |

### React Query + RSC Pattern
For pages that need both SSR and interactivity:
```typescript
// app/(app)/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  // Fetch initial data server-side (no loading state for initial render)
  const initialData = await serverApi.calculations.list()
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient initialData={initialData} />
    </HydrationBoundary>
  )
}
```

### Caching Strategy

| Data | Next.js Cache | Duration |
|---|---|---|
| Landing page HTML | Static (ISR) | Revalidate every 24h |
| Pricing page | Static (ISR) | Revalidate every 1h |
| HS code search results | React Query | 10 minutes |
| Calculation results | React Query | 1 hour (immutable) |
| User profile | React Query | 5 minutes |

### Performance Monitoring
- Vercel Speed Insights (built-in)
- Custom `PerformanceObserver` for:
  - Calculator form submit latency
  - HS code search latency
  - Time-to-result (form submit → result displayed)
- Log to PostHog as custom events

---

# FE_12 — Accessibility

## Standards
WCAG 2.1 AA compliance throughout. This is not negotiable — customs professionals include those with disabilities, and enterprise buyers have accessibility procurement requirements.

## Key Requirements

### Keyboard Navigation
- ALL interactive elements reachable by Tab (correct `tabIndex` order)
- Calculator wizard: fully operable by keyboard only
- Custom dropdowns (Country, HS code search): keyboard navigation (arrow keys, Enter, Escape)
- Modal: focus trapped inside, Escape to close, focus returns to trigger on close
- Drag-and-drop line items: keyboard alternative (up/down buttons with `aria-label`)

### Screen Reader Support
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<aside>`, `<section>`
- All form inputs have associated `<label>` elements (never `placeholder` as label)
- Icons: `aria-hidden="true"` on decorative icons, `aria-label` on icon-only buttons
- Live regions for dynamic content:
  ```html
  <!-- HS code search results -->
  <div role="status" aria-live="polite" aria-atomic="true">
    {results.length} codes found
  </div>
  
  <!-- Calculation progress -->
  <div role="status" aria-live="polite">
    Processing: {progressMessage}
  </div>
  ```
- Results page: heading hierarchy is correct (H1: page title, H2: sections, H3: subsections)

### Color & Contrast
- All text: minimum 4.5:1 contrast ratio (AA)
- Large text: minimum 3:1
- UI components: minimum 3:1 against adjacent colors
- NEVER rely on color alone to communicate meaning (always add icon or text)
  - ✅ Error state: red border + `AlertCircle` icon + error text
  - ❌ Not: just red border

### Focus Indicators
- Custom focus ring on all interactive elements:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-brand-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
  ```
- Never `outline: none` without a visible alternative

### Motion / Animation
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```
- Framer Motion: `useReducedMotion()` hook to disable animations for users who prefer reduced motion

### Forms
- Required fields: marked with `aria-required="true"` AND visible indicator (not asterisk alone)
- Validation errors: `aria-describedby` pointing to error message element
- Success/error toasts: announced via `role="alert"` for errors, `role="status"` for success

---

# FE_13 — Testing Strategy

## Testing Stack
- **Unit + Integration:** Vitest + React Testing Library
- **Visual Regression:** Chromatic (Storybook-based)
- **E2E:** Playwright
- **Accessibility:** axe-core (in tests + CI)

---

## Unit / Component Tests

### What to Test
- All `components/ui/` primitives: render, interactions, accessibility
- Zustand stores: all actions and computed state
- Zod schemas: valid inputs, invalid inputs, edge cases
- API hooks: with mocked API client (MSW — Mock Service Worker)
- Utility functions: currency formatting, number parsing, etc.

### Test Patterns

```typescript
// Example: CurrencyInput component test
import { render, screen, userEvent } from '@testing-library/react'

test('formats amount on blur', async () => {
  render(<CurrencyInput name="value" label="Invoice Value" />)
  const input = screen.getByLabelText('Invoice Value')
  
  await userEvent.type(input, '10000')
  await userEvent.tab()  // blur
  
  expect(input).toHaveValue('10,000.00')
})

test('shows error for invalid amount', async () => {
  render(<CurrencyInput name="value" label="Invoice Value" />)
  const input = screen.getByLabelText('Invoice Value')
  
  await userEvent.type(input, 'abc')
  await userEvent.tab()
  
  expect(screen.getByRole('alert')).toHaveTextContent('Invalid amount')
})
```

### MSW API Mocking
```typescript
// tests/mocks/handlers.ts
export const handlers = [
  http.post('/api/v1/calculations/sync', () => {
    return HttpResponse.json({ data: mockCalculationResult })
  }),
  http.get('/api/v1/tariff/hs-codes/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    return HttpResponse.json({ data: { results: mockHSCodes.filter(c => c.code.includes(q)) } })
  }),
]
```

### Coverage Targets
| Area | Coverage Target |
|---|---|
| `components/ui/` | 90% |
| `lib/stores/` | 95% |
| `lib/schemas/` | 100% |
| `lib/api/` | 80% |
| `components/calculator/` | 75% |

---

## Accessibility Tests (Automated)

```typescript
// Every component test includes axe check
import { axe, toHaveNoViolations } from 'jest-axe'
expect.extend(toHaveNoViolations)

test('has no accessibility violations', async () => {
  const { container } = render(<CalculatorStep1 />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

Also run `axe` in Playwright E2E tests on each page.

---

## Visual Regression (Chromatic)

All `components/ui/` have Storybook stories covering:
- Default state
- All variants (size, color, disabled)
- Loading state
- Error state
- Edge cases (very long text, empty, etc.)

Chromatic runs on every PR. Snapshots must be approved when UI intentionally changes.

---

## E2E Tests (Playwright)

### Key Scenarios

```typescript
// tests/e2e/calculator.spec.ts

test('Free user can complete a basic calculation', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Try Free Calculator')
  
  // Step 1
  await page.click('[data-testid=jurisdiction-UK]')
  await page.selectOption('[data-testid=origin-country]', 'CN')
  await page.selectOption('[data-testid=incoterm]', 'FOB')
  await page.fill('[data-testid=freight-cost]', '1500')
  await page.click('text=Continue')
  
  // Step 2
  await page.fill('[data-testid=hs-code-search]', '8471300000')
  await page.click('[data-testid=hs-result-8471300000]')
  await page.fill('[data-testid=invoice-value]', '10000')
  await page.fill('[data-testid=quantity]', '10')
  await page.click('text=Review & Calculate')
  
  // Step 3 (requires login)
  // [Mock Firebase login]
  await page.click('text=Calculate')
  
  // Result
  await expect(page.locator('[data-testid=total-landed-cost]')).toBeVisible()
  await expect(page.locator('[data-testid=confidence-score]')).toBeVisible()
})

test('Pro feature shows upgrade prompt for Free user', async ({ page }) => {
  // [Login as free user]
  await page.goto('/calculator/result/mock-result-id')
  
  const antidumpingSection = page.locator('[data-testid=antidumping-section]')
  await expect(antidumpingSection.locator('[data-testid=pro-lock]')).toBeVisible()
  await expect(antidumpingSection.locator('text=Unlock with Pro')).toBeVisible()
})
```

### E2E Test Environments
- Run against: staging environment with seeded test data
- Test accounts: fixed test Google accounts (Firebase test project)
- Stripe: use Stripe test mode + test card `4242 4242 4242 4242`

### CI Integration
```yaml
# .github/workflows/e2e.yml
on:
  push:
    branches: [main]
  
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```
