# FinTrack Admin Dashboard — Claude Code Prompt

You are building the FinTrack Admin Dashboard — an internal web application for monitoring the FinTrack platform. The designs are in the attached `Fintrack_Admin.zip`. Read every file in that zip before writing any code — the CSS variables, component structure, chart patterns, data shapes, and page layouts are all defined there and must be followed exactly.

---

## Stack

| Concern | Library |
|---|---|
| Build tool | Vite + React + TypeScript |
| Routing | React Router v6 |
| Server state | TanStack Query v5 (`@tanstack/react-query`) |
| HTTP | Axios |
| Charts | Recharts |
| Auth state | Zustand |
| Icons | Lucide React |

Do not install any library not listed above. The designs use custom SVG charts — replace all of them with equivalent Recharts implementations. Every other visual (layout, colours, typography, badges, progress bars, tables, sidebar) must match the designs exactly.

---

## Project Structure

```
fintrack-admin/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  .env
  src/
    main.tsx
    App.tsx
    styles/
      tokens.css          ← all CSS variables from designs/styles.css
      global.css          ← reset + base styles from designs/styles.css
      components.css      ← card, badge, progress, table, sidebar, grid classes
      charts.css          ← chart-area, chart-svg, legend, tooltip classes
    constants/
      api-endpoints.ts
      query-keys.ts
      storage-keys.ts
    network/
      api-client.ts       ← axios instance with auth header injection + 401 handling
    state/
      auth.state.ts       ← zustand store: token, email, login(), logout()
    types/
      admin.types.ts      ← all response types matching the admin API
    utils/
      fmt.ts              ← all fmt.* formatters from designs/src/components.jsx
    components/
      layout/
        Sidebar.tsx
        PageHeader.tsx
        SectionHeader.tsx
      ui/
        MetricCard.tsx
        Badge.tsx
        Progress.tsx
        StatChips.tsx
        Funnel.tsx
        EmptyState.tsx
        Tabs.tsx
        Spinner.tsx
        ErrorState.tsx
      charts/
        LineChart.tsx      ← Recharts LineChart wrapper
        BarChart.tsx       ← Recharts BarChart wrapper (horizontal + vertical)
        DonutChart.tsx     ← Recharts PieChart wrapper
        SparkLine.tsx      ← Recharts tiny inline sparkline
    pages/
      Login.tsx
      Overview.tsx
      RegexEngine.tsx
      Ingestion.tsx
      Transactions.tsx
      Users.tsx
      AIUsage.tsx
    hooks/
      use-overview.ts
      use-regex-health.ts
      use-regex-templates.ts
      use-audit-queue.ts
      use-regex-gaps.ts
      use-regex-corrections.ts
      use-ingestion-health.ts
      use-ingestion-timeline.ts
      use-transaction-volume.ts
      use-user-stats.ts
      use-ai-usage.ts
      use-login.ts
```

---

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:3000/api
```

The admin JWT is stored in `localStorage` under the key `ft_admin_token`. The axios instance reads it from there on every request.

---

## CSS / Design System

Copy all CSS variables and class definitions directly from the design files:

- `styles.css` in the zip → split into `tokens.css` (`:root {}` block) and `global.css` (everything else)
- All component class names used in the designs (`card`, `metric-card`, `badge`, `progress`, `progress-fill`, `grid`, `col-3`, `col-4`, `sidebar`, `nav-item`, `page-header`, etc.) must be defined and match the designs exactly

**Do not use Tailwind or any CSS-in-JS.** All styling is plain CSS using the design file classes and CSS variables.

Import order in `main.tsx`:
```typescript
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/charts.css';
```

---

## API Client (`src/network/api-client.ts`)

```typescript
import axios from 'axios';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { useAuthStore } from '@/state/auth.state';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Inject admin JWT on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: clear session and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default apiClient;
```

---

## Auth State (`src/state/auth.state.ts`)

```typescript
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('ft_admin_token'),
  email: localStorage.getItem('ft_admin_email'),
  login: (token, email) => {
    localStorage.setItem('ft_admin_token', token);
    localStorage.setItem('ft_admin_email', email);
    set({ token, email });
  },
  logout: () => {
    localStorage.removeItem('ft_admin_token');
    localStorage.removeItem('ft_admin_email');
    set({ token: null, email: null });
  },
}));
```

---

## Routing (`src/App.tsx`)

```typescript
// If no token → show Login
// If token → show shell (Sidebar + page content) with React Router
// Routes:
//   /          → Overview
//   /regex     → RegexEngine
//   /ingestion → Ingestion
//   /transactions → Transactions
//   /users     → Users
//   /ai        → AIUsage
```

Match the sidebar nav item IDs from the designs exactly: `overview`, `regex`, `ingestion`, `transactions`, `users`, `ai`.

---

## API Endpoints (`src/constants/api-endpoints.ts`)

```typescript
export const API_ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: '/admin/auth/login',
  ADMIN_LOGOUT: '/admin/auth/logout',
  ADMIN_ME: '/admin/auth/me',

  // Dashboard
  OVERVIEW: '/admin/overview',
  REGEX_HEALTH: '/admin/regex/health',
  REGEX_TEMPLATES: '/admin/regex/templates',
  AUDIT_QUEUE: '/admin/regex/audit-queue',
  REGEX_GAPS: '/admin/regex/gaps',
  REGEX_CORRECTIONS: '/admin/regex/corrections',
  INGESTION_HEALTH: '/admin/ingestion/health',
  INGESTION_TIMELINE: '/admin/ingestion/timeline',
  TRANSACTION_VOLUME: '/admin/transactions/volume',
  USER_STATS: '/admin/users/stats',
  AI_USAGE: '/admin/ai/usage',

  // Actions
  PROMOTE_TEMPLATE: (id: number) => `/admin/regex/templates/${id}/promote`,
  AUDIT_TEMPLATE: (id: number) => `/admin/regex/templates/${id}/audit`,
} as const;
```

---

## Query Keys (`src/constants/query-keys.ts`)

```typescript
export const QUERY_KEYS = {
  OVERVIEW: 'admin-overview',
  REGEX_HEALTH: 'admin-regex-health',
  REGEX_TEMPLATES: 'admin-regex-templates',
  AUDIT_QUEUE: 'admin-audit-queue',
  REGEX_GAPS: 'admin-regex-gaps',
  REGEX_CORRECTIONS: 'admin-regex-corrections',
  INGESTION_HEALTH: 'admin-ingestion-health',
  INGESTION_TIMELINE: 'admin-ingestion-timeline',
  TRANSACTION_VOLUME: 'admin-transaction-volume',
  USER_STATS: 'admin-user-stats',
  AI_USAGE: 'admin-ai-usage',
} as const;
```

---

## Types (`src/types/admin.types.ts`)

Derive all types directly from the admin spec and mock data in `designs/src/data.js`. Every API response shape must have a corresponding TypeScript interface. Key types to define:

```typescript
// Auth
interface AdminLoginResponse { access_token: string; expires_in: string; }

// Overview
interface AdminOverviewResponse {
  snapshot_at: string;
  transactions: {
    total_count: number; total_count_30d: number;
    handled_by_regex: number; handled_by_ai: number;
    regex_rate_pct: number; regex_rate_30d_pct: number;
    failed_ingestion_count: number; unverified_count: number;
  };
  regex_engine: {
    total_templates: number; production: number; candidate: number;
    failed_audit: number; degrading: number;
    avg_confidence_score: number;
    banks_with_coverage: number; banks_without_coverage: number;
  };
  users: {
    total: number; active_30d: number;
    plan_free: number; plan_pro: number; plan_premium: number;
    onboarding_complete: number; email_connected: number;
  };
  ingestion: {
    connections_active: number; connections_stale: number;
    emails_processed_30d: number; emails_failed_30d: number;
    avg_parse_time_ms: number | null;
  };
  ai_cost: {
    estimated_cost_today_usd: number; estimated_cost_30d_usd: number;
    total_tokens_30d: number; cost_per_transaction_30d: number;
  };
}

// Define all remaining types following the same pattern as the admin spec DTOs
// for: RegexHealthResponse, RegexTemplateListResponse, AuditQueueResponse,
// RegexGapsResponse, RegexCorrectionsResponse, IngestionHealthResponse,
// IngestionTimelineResponse, TransactionVolumeResponse, UserStatsResponse,
// AiUsageResponse
```

---

## Formatters (`src/utils/fmt.ts`)

Port all formatters from `designs/src/components.jsx` exactly:

```typescript
export const fmt = {
  num: (n: number) => n.toLocaleString('en-US'),
  numK: (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    if (n >= 10_000)    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
    if (n >= 1_000)     return (n / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'k';
    return n.toLocaleString('en-US');
  },
  usd: (n: number, dp = 2) =>
    '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }),
  pct: (n: number, dp = 1) => n.toFixed(dp) + '%',
  cpt: (n: number) => '$' + n.toFixed(6),
  date: (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
};
```

---

## Hooks

Each hook follows the same pattern — `useQuery` with the appropriate query key and API call. All accept an optional `dateRange?: { from?: string; to?: string }` param where the endpoint supports it.

```typescript
// Example pattern — apply to all hooks
export function useOverview() {
  return useQuery({
    queryKey: [QUERY_KEYS.OVERVIEW],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminOverviewResponse>(API_ENDPOINTS.OVERVIEW);
      return data;
    },
    staleTime: 60_000,
  });
}
```

For the `use-login.ts` hook, use `useMutation`:
```typescript
export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await apiClient.post<AdminLoginResponse>(API_ENDPOINTS.ADMIN_LOGIN, payload);
      return data;
    },
    onSuccess: (data, variables) => {
      login(data.access_token, variables.email);
    },
  });
}
```

---

## Chart Components

Replace all custom SVG chart primitives from the designs with Recharts. Match the visual style as closely as possible using the CSS variables.

### Recharts global config

Apply these to every Recharts chart:
- Background: transparent
- Grid lines: `stroke="var(--border)"` `strokeDasharray="0"`
- Axis text: `fill="var(--text-tertiary)"` `fontFamily="var(--font-sans)"` `fontSize={11}`
- Tooltip: custom styled to match the design's dark tooltip style
- Animation: `isAnimationActive={false}` — data dashboards should not animate

### `LineChart.tsx`

```typescript
// Props: data, series ({ key, label, color, areaOpacity? }[]),
//        height, xKey, yFormatter, annotation?
// Use Recharts: ComposedChart + Line + Area + XAxis + YAxis + Tooltip + ReferenceLine
// annotation renders as a ReferenceLine with a label
```

### `BarChart.tsx`

```typescript
// Two modes via `direction` prop: 'vertical' | 'horizontal'
// Vertical: standard BarChart for timeline/category data
// Horizontal: BarChart layout="vertical" for bank/currency breakdowns
// Props: data, dataKey, nameKey, color?, colors?[]
```

### `DonutChart.tsx`

```typescript
// Props: data ({ name, value, color }[]), size?
// Use Recharts PieChart + Pie with innerRadius
// Render a custom legend below the chart matching the designs
```

### `SparkLine.tsx`

```typescript
// Tiny inline sparkline rendered inside MetricCard
// Props: values: number[], color: string, height?: number (default 40)
// Use Recharts LineChart with no axes, no grid, no tooltip
// Width: 100% of parent
```

---

## Component Specifications

Build these components fully — not stubs:

### `Sidebar.tsx`
Matches the designs exactly. Nav items: Overview, Regex Engine, Ingestion, Transactions, Users, AI Usage. Use `NavLink` from React Router for active state styling. Active item has `var(--brand)` left border and `var(--bg-elev)` background. Sign out button calls `useAuthStore().logout()` then navigates to `/login`.

### `MetricCard.tsx`
```typescript
interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: React.ReactNode;
  trend?: string;
  trendDir?: 'up' | 'down';
  trendGood?: boolean;   // up-good or down-good depends on the metric
  info?: string;         // tooltip text
  children?: React.ReactNode; // for sparkline slot at bottom
}
```

### `Badge.tsx`
```typescript
type BadgeKind = 'production' | 'audited' | 'candidate' | 'failed_audit' | 'degrading' |
                 'healthy' | 'warning' | 'no_coverage' | 'critical' | 'neutral';
```
Each kind maps to a CSS class. Class definitions must match the design.

### `Progress.tsx`
```typescript
interface ProgressProps {
  value: number;   // 0–100
  kind?: 'healthy' | 'warning' | 'critical';  // auto-computed if not provided
  showLabel?: boolean;
  dp?: number;
}
// Auto kind: value >= 85 → healthy, >= 70 → warning, < 70 → critical
```

### `Funnel.tsx`
Horizontal funnel showing step name, proportional bar, count, and drop-off %. Matches the design's funnel component exactly.

### `Spinner.tsx` and `ErrorState.tsx`
Used as loading/error states on every page. Match the design's empty state style.

---

## Page Specifications

Each page fetches real data from its hook — no mock data in production code. During development, the API may not be running; pages should show `ErrorState` with a message when the fetch fails.

### `Login.tsx`
- Centered card on full-height dark background
- FinTrack wordmark + "Admin" chip
- Email + password inputs
- Primary CTA calls `useLogin().mutate({ email, password })`
- On success: navigates to `/`
- Show inline error message on failed login (wrong credentials)
- No "forgot password" link

### `Overview.tsx`
Sections in order:
1. Top row: 4 metric cards (Total transactions, Regex rate, Active users 30d, AI cost this month) — each with a `SparkLine` at the bottom
2. Regex engine snapshot: 3 cards (Templates in production, Avg confidence, Bank coverage)
3. AI → Regex handoff: full-width `LineChart` with dual series (regex, AI) and annotation at 80% crossing
4. Bottom row: 3 panels (Ingestion health summary, Audit queue preview, User funnel)

### `RegexEngine.tsx`
Sections in order:
1. `StatChips` bar: production / audited / candidate / failed_audit / degrading counts + avg confidence
2. Full-width `LineChart`: regex rate trend over selected date range, with bank filter dropdown
3. By-bank health table: sortable, with `Badge` status column and `Progress` bar for regex rate
4. Full-width paginated template table: expandable rows showing individual regex rules
5. Two side-by-side panels: audit queue (with "Trigger audit" button per row) and regex gaps

### `Ingestion.tsx`
Sections in order:
1. Connection health: 3 metric cards (active, stale, revoked)
2. Pipeline metrics: 4 metric cards (emails processed, success rate, failed, non-transaction)
3. Outcomes `DonutChart`: parsed / non-transaction / failed
4. Full-width stacked `BarChart`: daily timeline (parsed, failed, non-transaction) with date range picker

### `Transactions.tsx`
Sections in order:
1. Date range filter across the top
2. 4 metric cards: total, debit value, credit value, unique banks
3. Horizontal `BarChart`: by bank (transaction count)
4. Two side-by-side charts: by currency (grouped bar), by category (horizontal bar or donut)
5. Corrections table: ranked by correction rate, amber > 5%, red > 15%

### `Users.tsx`
Sections in order:
1. 4 metric cards: total users, new this month, active 30d, onboarding completion %
2. Plan distribution: horizontal segmented bar (Free / Pro / Premium) with counts and percentages
3. Onboarding `Funnel`: signed up → email connected → onboarding complete → first transaction
4. Retention panel: 2-metric card (7d and 30d)

### `AIUsage.tsx`
Sections in order:
1. 5 metric cards: total tokens, prompt/completion split, cost USD 30d, cost per transaction, total calls
2. Full-width dual-axis `LineChart`: daily cost (left axis) + cost-per-transaction (right axis) with dashed target line at the configured CPT ceiling
3. By-operation table: sorted by cost descending, with token counts and % of total
4. `DonutChart`: cost distribution by operation using chart palette colors

---

## Date Range Picker

The designs show a `<select>` with `7d`, `30d`, `90d` options on pages that support date filtering. Implement as a controlled component that converts the selection to `from`/`to` ISO strings passed to the relevant hook. Default to `30d` on all pages.

---

## Error and Loading States

Every page section that fetches data must handle three states:

```typescript
if (isLoading) return <Spinner />;
if (isError)   return <ErrorState message="Failed to load data. Is the backend running?" />;
// render data
```

Do not show skeleton placeholders — use the simple spinner pattern from the designs.

---

## Template Row Expansion (Regex Engine page)

The template table rows are expandable. Clicking a row toggles an expanded section showing:
- Each regex rule for that template: field name, regex pattern (monospace), capture group
- The regex string must be rendered in `var(--font-mono)` and be selectable

Use local `useState` for the expanded row ID — no server call needed on expand (rules are already in the template response).

---

## Trigger Audit Action

On the audit queue panel (Regex Engine page), each pending template has a "Trigger audit" button. Clicking it calls `POST /admin/regex/templates/:id/audit`. Use `useMutation` in the `RegexEngine` page, invalidate `QUERY_KEYS.AUDIT_QUEUE` and `QUERY_KEYS.REGEX_HEALTH` on success. Show a brief success toast or inline state change on the row.

---

## What Claude Code Must Deliver

1. All files listed in the project structure — fully implemented, not stubbed
2. All CSS from the design files correctly ported into the four CSS files
3. All 7 pages fully implemented with real API calls via hooks
4. All chart components wrapping Recharts — visually matching the designs
5. Working auth flow: login → token stored → protected routes → 401 clears session
6. `vite.config.ts` with path alias `@` → `src/`
7. `package.json` with all dependencies listed above

After scaffolding, run:
```bash
npm install
npm run build
```
Report any TypeScript or build errors before ending the session.
