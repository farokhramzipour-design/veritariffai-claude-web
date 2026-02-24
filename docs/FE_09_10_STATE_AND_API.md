# FE_09 — State Management

## Architecture Overview

Two-layer state management:
- **Zustand** — global client state (auth, UI, calculator form)
- **TanStack Query** — server/async state (API data, caching, background refresh)

Never put server data in Zustand. Never put UI state in React Query.

---

## Zustand Stores

### Auth Store (`lib/stores/authStore.ts`)

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
  refreshAccessToken: () => Promise<boolean>
}

// Persistence: accessToken in sessionStorage via zustand/middleware persist
// Never persist to localStorage (security)
```

### Calculator Store (`lib/stores/calculatorStore.ts`)
Holds the in-progress calculator form state across wizard steps.

```typescript
interface CalculatorState {
  // Step 1
  jurisdiction: 'UK' | 'EU' | null
  originCountry: string | null
  destinationCountry: string | null
  incoterm: IncoTerms | null
  freightCost: MoneyInput | null
  insuranceCost: MoneyInput | null
  portOfEntry: string | null
  transportMode: TransportMode | null
  calculationDate: string
  
  // Step 2
  lines: ShipmentLineInput[]
  
  // Wizard state
  currentStep: 1 | 2 | 3
  isSubmitting: boolean
  lastSubmittedRequestId: string | null
  
  // Actions
  setStep1: (data: Step1Data) => void
  addLine: (line: ShipmentLineInput) => void
  updateLine: (index: number, updates: Partial<ShipmentLineInput>) => void
  removeLine: (index: number) => void
  reorderLines: (fromIndex: number, toIndex: number) => void
  reset: () => void
  hydrateFromResult: (requestId: string) => void  // For "duplicate" flow
}

// Persistence: sessionStorage via persist middleware
// Auto-clears on successful calculation completion
```

### UI Store (`lib/stores/uiStore.ts`)

```typescript
interface UIState {
  sidebarCollapsed: boolean
  toasts: Toast[]
  activeModal: string | null
  
  // Actions
  toggleSidebar: () => void
  addToast: (toast: ToastInput) => void
  removeToast: (id: string) => void
  openModal: (modalId: string) => void
  closeModal: () => void
}

// sidebarCollapsed: persisted to localStorage
```

---

## TanStack Query Patterns

### Query Keys Convention
```typescript
// lib/api/queryKeys.ts
export const queryKeys = {
  user: ['user', 'me'] as const,
  calculations: {
    list: (filters?: CalculationFilters) => ['calculations', 'list', filters],
    detail: (id: string) => ['calculations', id],
    status: (id: string) => ['calculations', id, 'status'],
    result: (id: string) => ['calculations', id, 'result'],
  },
  tariff: {
    search: (q: string, jurisdiction: string) => ['tariff', 'search', q, jurisdiction],
    detail: (code: string) => ['tariff', 'code', code],
  },
  subscription: ['subscription'] as const,
}
```

### Key Query Hooks

```typescript
// lib/api/hooks/useCalculations.ts

export function useCalculationResult(requestId: string) {
  return useQuery({
    queryKey: queryKeys.calculations.result(requestId),
    queryFn: () => api.calculations.getResult(requestId),
    enabled: !!requestId,
    staleTime: 1000 * 60 * 60,  // Results don't change — cache for 1 hour
    retry: 2,
  })
}

export function useCalculationStatus(taskId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.calculations.status(taskId!),
    queryFn: () => api.calculations.getStatus(taskId!),
    enabled: enabled && !!taskId,
    refetchInterval: (data) => {
      // Poll every 3s while pending/processing, stop when complete/failed
      if (data?.status === 'complete' || data?.status === 'failed') return false
      return 3000
    },
  })
}

export function useHSCodeSearch(query: string, jurisdiction: string) {
  return useQuery({
    queryKey: queryKeys.tariff.search(query, jurisdiction),
    queryFn: () => api.tariff.search(query, jurisdiction),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 10,  // Cache search results for 10 min
    placeholderData: keepPreviousData,  // No flicker on keystroke
  })
}

export function useSubmitCalculation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: CalculationRequest) => api.calculations.submit(request),
    onSuccess: (data) => {
      // Optimistically add to calculations list
      queryClient.invalidateQueries({ queryKey: queryKeys.calculations.list() })
      // Pre-populate result cache
      if (data.status === 'complete') {
        queryClient.setQueryData(
          queryKeys.calculations.result(data.request_id),
          data
        )
      }
    },
    onError: (error) => {
      useUIStore.getState().addToast({
        type: 'error',
        title: 'Calculation failed',
        message: error.message,
      })
    }
  })
}
```

---

## Form State (React Hook Form + Zod)

### Shared Zod Schemas (`lib/schemas/calculator.ts`)

```typescript
// These schemas mirror the backend Pydantic models
// Can be used for client-side validation before API call

export const MoneySchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
  currency: z.string().length(3),
})

export const ShipmentLineSchema = z.object({
  line_number: z.number().int().positive(),
  hs_code: z.string().regex(/^\d{8,10}$/, 'Must be 8–10 digits'),
  description: z.string().min(3).max(100),
  invoice_value: MoneySchema,
  quantity: z.number().positive(),
  quantity_unit: z.string().min(1),
  gross_weight_kg: z.number().positive(),
  country_of_origin: z.string().length(2),
  has_proof_of_origin: z.boolean(),
})

export const Step1Schema = z.object({
  jurisdiction: z.enum(['UK', 'EU']),
  origin_country: z.string().length(2),
  destination_country: z.string().length(2),
  incoterm: z.enum(['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']),
  freight_cost: MoneySchema.optional(),
  insurance_cost: MoneySchema.optional(),
})
```

### Form Reset on Navigation
The `calculatorStore` persists to sessionStorage. When navigating back to calculator:
- If `lastSubmittedRequestId` is set and user clicks "New Calculation" → ask "Start fresh or edit last?"
- If user returns via browser back button → form is pre-filled from store

---

# FE_10 — API Integration

## API Client (`lib/api/client.ts`)

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: inject auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle auth errors + transform responses
apiClient.interceptors.response.use(
  (response) => response.data.data,  // Unwrap standard envelope
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await useAuthStore.getState().refreshAccessToken()
      if (refreshed) {
        return apiClient(error.config)  // Retry with new token
      }
      // Refresh failed → redirect to login
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
    }
    
    if (error.response?.status === 403) {
      const errorCode = error.response.data?.error?.code
      if (errorCode === 'PLAN_UPGRADE_REQUIRED') {
        // Emit event for upgrade modal — don't throw
        eventBus.emit('plan_upgrade_required', error.response.data.error.details)
        return
      }
    }
    
    // Transform to friendly error
    throw new ApiError(
      error.response?.data?.error?.message || 'An unexpected error occurred',
      error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      error.response?.status
    )
  }
)
```

## API Methods (`lib/api/`)

```typescript
// lib/api/calculations.ts
export const calculationsApi = {
  submitSync: (request: CalculationRequest) =>
    apiClient.post<CalculationResult>('/calculations/sync', request),
    
  submitAsync: (request: CalculationRequest) =>
    apiClient.post<{ task_id: string; poll_url: string }>('/calculations/async', request),
    
  getStatus: (taskId: string) =>
    apiClient.get<{ status: string; progress?: Progress }>(`/calculations/${taskId}/status`),
    
  getResult: (requestId: string) =>
    apiClient.get<CalculationResult>(`/calculations/${requestId}/result`),
    
  getAuditTrail: (requestId: string) =>
    apiClient.get<AuditTrail>(`/calculations/${requestId}/audit`),
    
  list: (filters?: CalculationFilters) =>
    apiClient.get<PaginatedList<CalculationSummary>>('/calculations', { params: filters }),
    
  exportPdf: (requestId: string) =>
    apiClient.post<{ download_url: string }>(`/calculations/${requestId}/export/pdf`),
}

// lib/api/tariff.ts
export const tariffApi = {
  search: (q: string, jurisdiction: string, limit = 10) =>
    apiClient.get<HSCodeSearchResult[]>('/tariff/hs-codes/search', {
      params: { q, jurisdiction, limit }
    }),
    
  getCode: (code: string, jurisdiction: string) =>
    apiClient.get<HSCodeDetail>(`/tariff/hs-codes/${code}`, { params: { jurisdiction } }),
}
```

## Error Handling Hierarchy

```
Network Error → "Can't reach our servers. Check your connection."
  │
  ├── 400 VALIDATION_ERROR → Show field-level errors from API response
  ├── 400 INVALID_HS_CODE → Inline error on HS code field
  ├── 401 UNAUTHENTICATED → Auto-refresh → if fails, redirect to login
  ├── 403 PLAN_UPGRADE_REQUIRED → Open upgrade modal
  ├── 422 CALCULATION_ERROR → Show specific engine error message
  ├── 429 RATE_LIMIT_EXCEEDED → Toast: "You've reached your limit. Try again in X minutes"
  ├── 503 DATA_STALE → Toast warning: "Tariff data may be slightly outdated"
  └── 500 INTERNAL_ERROR → Toast: "Something went wrong. Our team has been notified."
```

## Loading State Patterns

**Consistent skeleton loading** — never show blank pages:

```typescript
// Pattern: data-dependent components always handle loading state

function CalculationResult({ id }: { id: string }) {
  const { data, isLoading, error } = useCalculationResult(id)
  
  if (isLoading) return <ResultPageSkeleton />
  if (error) return <ResultPageError error={error} />
  return <ResultPageContent data={data} />
}
```

**Optimistic updates** for write operations:
- Adding a line item: appears immediately, reverts on error
- Saving preferences: applies immediately, syncs to server in background
