# FE_05 — Auth Flow & Onboarding

## Authentication Architecture (Frontend)

Firebase Auth JS SDK handles all Google OAuth interactions. The backend issues its own JWT after Firebase token verification.

### Token Storage Strategy
- **Access Token:** `sessionStorage` (cleared on tab close) — acceptable security trade-off for JWTs
- **Refresh Token:** HttpOnly cookie (set by backend) — cannot be read by JS
- On app load: check sessionStorage for access token → if present, validate expiry → if expired, call refresh endpoint → if no refresh token cookie, require login

---

## Login Page (`/login`)

### Layout
Split screen (desktop):
- Left 55%: Product value proposition + animated illustration
- Right 45%: Login card (centered)

### Left Panel Content
```
[Logo]

"Customs calculations
that professionals trust."

• Live TARIC + UKGT data
• 11 calculation engines
• Full audit trail

[Mini calculation animation playing in background]
```

### Right Panel: Login Card

```
┌─────────────────────────────────────┐
│                                     │
│   Welcome to TradeCalc              │
│                                     │
│   Sign in to save your              │
│   calculations and unlock           │
│   your full results.                │
│                                     │
│   ┌──────────────────────────────┐  │
│   │  🇬  Continue with Google    │  │
│   └──────────────────────────────┘  │
│                                     │
│   By signing in you agree to our    │
│   Terms of Service and Privacy      │
│   Policy.                           │
│                                     │
│   ─── Or ───────────────────────   │
│                                     │
│   [← Back without signing in]       │
│                                     │
└─────────────────────────────────────┘
```

**Google Button Spec:**
- Width: 100% of card
- Height: 48px
- Background: `#FFFFFF`
- Text: "Continue with Google", 15px, DM Sans 500
- Google `G` logo: official SVG
- Hover: subtle shadow lift

**"Back without signing in" link:**
Returns to calculator or landing page. Users who were mid-calculator keep their form state (stored in Zustand, persisted to sessionStorage).

### Login Flow
1. User clicks "Continue with Google"
2. Firebase Auth opens Google OAuth popup
3. Firebase returns ID token (Google credential)
4. Frontend sends ID token to `POST /api/v1/auth/google`
5. Backend verifies, returns `{access_token, user}`
6. Store `access_token` in sessionStorage
7. Update Zustand auth store with user object
8. Redirect to: `?next` param, or `/dashboard` if new user, or `/calculator/result` if came from calculator

### Loading States
- Google button shows spinner after click while popup opens
- After popup closes, button shows "Signing you in..."
- On error: button resets, toast shows error

### Error States
- Popup blocked: "Please allow popups for this site to sign in with Google"
- Network error: "Couldn't connect to our server. Please try again."
- Account suspended: "Your account has been suspended. Contact support."

---

## OAuth Callback (`/login/callback`)

For environments where popup isn't possible (some mobile browsers), use redirect flow:
- `signInWithRedirect` → user leaves to Google → returns to `/login/callback`
- Callback page: full-screen loading state while token exchange happens
- Same success/error handling as popup flow

---

## New User Onboarding

First time a user signs in (new account), show a lightweight onboarding overlay on the Dashboard:

### Onboarding Overlay (3 steps, modal)

**Step 1: Welcome**
```
👋 Welcome to TradeCalc

You're signed in as user@example.com

You're on the Free plan.
• 10 calculations per hour
• 1 HS code per calculation
• Basic duty + VAT

Start calculating, or upgrade to Pro for the full picture.

[Run Your First Calculation →]   [See Pro Features]
```

**Step 2: Quick Tutorial (if user clicks "Run First Calculation")**
Tooltip-based product tour using a library like `react-joyride`:
1. Point to sidebar: "Your navigation"
2. Point to "New Calculation": "Start here"
3. Point to plan badge: "Upgrade anytime"

Keep tutorial < 3 steps. Users hate long tours. Let the product speak.

**Step 3: (optional) Industry/Use case**
Single question — not required:
```
What best describes you?
○ Importer (I buy goods from overseas)
○ Customs broker / freight forwarder
○ Finance / procurement team
○ Other
```
Used for analytics only. Skip button prominent.

---

## Plan Gate UI Patterns

### 1. Inline Feature Lock (most common)
Within a section of the result page:
```
┌─────────────────────────────────────────────────┐
│ 🔒 Anti-Dumping & Special Measures              │
│                                                 │
│ Your HS code 8517120000 (mobile phones from CN) │
│ may be subject to anti-dumping duties.          │
│                                                 │
│ [Blurred preview of the actual data]            │
│ [████████████████████] £1,574.00                │
│                                                 │
│ [⚡ Unlock with Pro — See exact duty →]         │
└─────────────────────────────────────────────────┘
```
- Teaser copy uses real detected data (not generic lorem ipsum)
- The blurred number creates specific curiosity

### 2. Action Intercept (for "Add Line" multi-line attempt)
```
Modal:

📦 Multiple HS Lines Require Pro

You've added 2 lines. TradeCalc Pro supports
up to 500 lines per calculation.

Free plan: 1 line   Pro plan: Up to 500 lines

[Upgrade to Pro — from £39/mo →]
[Calculate first line only →]
[Cancel]
```

### 3. Inline Upgrade CTA (in sidebar/dashboard)
```
[Plan: FREE]
─────────────────
Unlock all 11 engines with Pro.
Anti-dumping · Preferences · Excise
PDF export · Unlimited history

[Upgrade to Pro →]
```

---

## Session Management

### Auth State (Zustand store)
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  login: (googleIdToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  setUser: (user: User) => void
}
```

### Token Refresh Logic
- On API call returning 401: auto-call `POST /auth/refresh` → retry original request
- If refresh fails (expired cookie): redirect to `/login?next={current_path}`, preserve calculator state in sessionStorage
- Proactive refresh: 5 minutes before access token expiry (`exp - now < 300s`)

### Logout Flow
1. Call `DELETE /auth/session` (removes refresh token cookie on backend)
2. Clear sessionStorage access token
3. Reset Zustand auth store
4. Redirect to `/` (landing page)
5. Toast: "You've been signed out"
