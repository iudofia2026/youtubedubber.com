# YT Dubber Frontend

YT Dubber’s App Router frontend for creating, tracking, and downloading multilingual dubs. The UI combines a four-step job wizard with job management, billing, and support pages that communicate with the backend API.

## Tech Stack
- Next.js 15 (App Router)
- React 19 with client-focused components
- TypeScript with strict ESLint configuration
- Tailwind CSS v4, shadcn/ui primitives, and Framer Motion
- Supabase auth helpers (optional)
- Stripe Elements integration for payments

## Getting Started

### Prerequisites
- Node.js 18 or newer
- npm (or yarn/pnpm)
- Backend API reachable at the value of `NEXT_PUBLIC_API_URL`

### Installation
```bash
git clone <repository-url>
cd frontend
npm install
```

### Environment

A checked-in `.env.local` file keeps the configuration that `lib/config.ts` validates. Update the values to match your environment:

```env
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

- Set `NEXT_PUBLIC_DEV_MODE=true` (or set `localStorage.setItem('dev-mode-preference', 'true')`) to enable the development auth bypass provided by `AuthProvider`.
- The billing flow requires `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` because `PaymentForm` calls `loadStripe` when it mounts.

### Run the application
```bash
npm run dev
```
Visit `http://localhost:3000`.

### Scripts
- `npm run dev` – Next.js development server (Turbopack)
- `npm run build` – Production build
- `npm run start` – Serve the production build
- `npm run lint` – Run ESLint on the project

### Environment variables

| Variable | Required | Default (.env.local) | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:8000` | Base URL for every API call |
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` | Used for redirects and generated links |
| `NEXT_PUBLIC_WS_URL` | Optional | `ws://localhost:8000/ws` | Placeholder for future realtime updates |
| `NEXT_PUBLIC_DEV_MODE` | Optional | `false` | Enables mock auth when set to `true` |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | — | Required with `NEXT_PUBLIC_SUPABASE_ANON_KEY` to talk to Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | — | Supabase anon key for auth |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | — | Needed for the Stripe Elements payment form |
| `NEXT_PUBLIC_GA_TRACKING_ID` | Optional | — | Google Analytics measurement ID |

`lib/config.ts` enforces that the required variables are present. Keep `.env.local` in sync before starting Next.js.

## Feature Overview

### Job creation (`app/new`)
- `JobCreationWizard` walks through voice track upload, optional background upload, language selection, and review/submit.
- `FileUpload` validates type/size (audio plus MP4), extracts duration via `lib/audio-utils`, exposes preview controls, and auto-advances when configured.
- Language selection supports 12 predefined languages with search, validation, and animated feedback.
- Submissions call `submitDubbingJob`, which requests signed URLs, uploads files via `uploadFileToStorage`, and finalizes the job with `notifyUploadComplete`.

### Job management (`app/jobs`)
- Pages are wrapped in `ProtectedRoute`, honoring Supabase authentication or the development bypass.
- `JobHistory` provides status filters, free-text search, sort options, and grid/list toggles that synchronize with URL query parameters.
- Users can refresh data, delete jobs, and open the detail view; feedback is surfaced through `ToastNotifications`.
- Breadcrumbs and contextual headers come from shared navigation components.

### Job status (`app/jobs/[id]`)
- `pollJobStatus` performs exponential-backoff polling against `/api/jobs/{id}` and falls back to mock data only when development mode is active.
- `IndividualLanguageProgress` displays per-language progress, while `DownloadManager` exposes download actions once assets are ready.
- Terminal errors are captured, surfaced via toasts, and provide navigation back to the job list.

### Downloads (`app/downloads`)
- `fetchDownloads` retrieves download history; the page offers searching, language/file-type filtering, sorting, and grid/list layouts.
- Expired files are detected and call toasts instead of attempting downloads; refresh/start-over actions are available.

### Billing & payments (`app/billing`)
- Credit balances persist locally through `lib/credits`.
- `fetchTransactions` hydrates history from the backend (falling back to an empty list when unavailable) and the UI offers tabs for history and purchasing.
- Pricing cards reuse `components/payment/PricingCard`. Purchasing a pack triggers `createPaymentIntent` and renders `PaymentForm` (Stripe Elements) to complete checkout, then updates credits locally.

### Authentication
- `AuthProvider` initializes Supabase when credentials are provided; otherwise it exits early and, when dev mode is on, injects a mock user/session.
- `ProtectedRoute` gates pages by default and accepts `requireAuth={false}` for public routes (e.g., `/auth/signup`).
- `AuthForm` handles sign in, sign up, and password reset with zod validation, Supabase integration, and linked terms/privacy acknowledgements.

### Marketing & support pages
- Landing (`app/page.tsx`), features, pricing, how-it-works, help center, contact, status, and legal routes are all implemented with shared navigation and footer components.
- Help center provides search and category filtering for the FAQ data; status page renders mock service health metrics.
- Legal routes (`/legal/terms`, `/legal/privacy`, `/legal/cookies`) back the authentication flow’s consent copy.

### Shared utilities
- `lib/api.ts` centralizes API calls: signed upload helpers, job CRUD, polling, downloads, and billing requests.
- `components/ToastNotifications` deliver app-wide toasts; `components/ErrorBoundary` protects the React tree from crashes.
- `components/jobs`, `components/payment`, and `components/downloads` expose reusable building blocks (see `components/payment/README.md` for module-level guidance).

## API Integration

The frontend expects the backend to provide the endpoints below. Configure your API to match.

- `POST /api/jobs/upload-urls` – return signed URLs for voice/background uploads.
- `POST /api/jobs/` – finalize job creation after uploads complete.
- `GET /api/jobs` / `GET /api/jobs/{id}` / `DELETE /api/jobs/{id}` – list, fetch, and delete jobs.
- `GET /api/jobs/{id}/download` – return per-language asset URLs; relative URLs are resolved against `NEXT_PUBLIC_API_URL`.
- `GET /api/downloads` – download history metadata.
- `GET /api/billing/transactions` and `POST /api/billing/create-payment-intent` – billing endpoints the payment UI calls.

Network failures currently fall back to empty UI states and error toasts. Mock responses are only injected when development mode is enabled.

## Project Structure
```
frontend/
├── app/                 # App Router pages (auth, billing, jobs, downloads, marketing, legal)
├── components/          # Reusable UI: navigation, jobs, payment, downloads, toasts, etc.
├── lib/                 # API client, configuration, Supabase helpers, utilities
├── public/              # Static assets
├── types/               # Shared TypeScript types and schemas
├── tailwind.config.ts   # Tailwind CSS configuration
└── eslint.config.mjs    # ESLint setup
```

## Error Handling & Environment Controls
- `lib/api.ts` centralizes fetch logic. `createApiError` maps status codes to the `ApiError` shape and feeds helpers such as `withRetry`.
- `withRetry` adds exponential backoff (3 attempts, 1s base) and only retries requests that return `retryable: true`.
- `types/index.ts` exports the `ApiError` interface that downstream components (toasts, job views) consume.
- Logging is currently ad hoc: `lib/api.ts` logs API configuration and token-selection decisions in every environment, and `createApiError` always exposes backend payloads via `details`. Sanitize or gate this before production.
- The repository does not include the previously documented backend health check component or environment-aware logging utilities. Add them when ready and update this section instead of relying on stale guides.
- `scripts/validate-env.js` is a lightweight sanity check for `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL`. Run it manually (`node scripts/validate-env.js`) or wire it into an npm `prebuild` script if you need automated enforcement.

```ts
// Example: wrap an API call with retry semantics from lib/api.ts
await withRetry(async () => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw createApiError(await response.json().catch(() => ({})), response);
  }
  return response.json();
});
```

## Backend Integration

The frontend is fully prepared for backend integration with the following improvements:

### 1. Backend Response Mapping ✅
- `lib/api.ts` includes mapping functions that handle both camelCase (official Pydantic schema) and snake_case (database fields) for backward compatibility
- All API responses are validated and mapped through `mapJobResponse()`, `mapLanguageProgress()`, and `mapJobSummary()`
- Download URLs are automatically resolved (relative → absolute) via `resolveDownloadUrl()`
- Progress values are clamped to 0-100 range with fallback defaults

### 2. Runtime Type Validation ✅
- Type guard functions in `types/index.ts` validate all backend responses before mapping
- Invalid array items are skipped rather than failing entire requests (graceful degradation)
- `ValidationError` class provides user-friendly error messages while preserving technical details
- Supports flexible field naming (camelCase/snake_case) during API migrations

### 3. Error Handling Status ⚠️
- `lib/api.ts` exports `createApiError`, which always forwards backend payloads in `details` and prints console diagnostics regardless of environment.
- `withRetry` relies on those `retryable` flags but there is no structured logging layer wrapped around fetch calls.
- `ErrorBoundary.tsx` captures errors and trims information in production, yet there is no reporting service integration or automated way to disable verbose logs elsewhere.

### Integration Checklist
- [ ] Backend running at `NEXT_PUBLIC_API_URL`
- [ ] Set `NEXT_PUBLIC_DEV_MODE=false` for production
- [ ] Run `node scripts/validate-env.js` (manually or via an npm hook) to ensure required env vars exist
- [ ] Test all API endpoints with real backend responses and monitor the retry helper
- [ ] Verify type guards handle backend response format without throwing

## Development Notes
- The repository does not ship automated tests; rely on manual QA and ESLint.
- Turbopack is enabled for development/build; clear `.next` if you encounter cache glitches.
- `PaymentForm` assumes a working Stripe publishable key and backend intent endpoint—without them the billing flow will surface errors.
- Supabase integration requires both URL and anon key; otherwise, authentication falls back to the development bypass.
- Mobile interactions use `navigator.vibrate` where supported and gracefully no-op elsewhere.
- Run `node scripts/validate-env.js` locally (or via an npm `prebuild` hook) to verify the minimum environment variables.

## Known Gaps
- Realtime updates are still handled with polling; WebSocket/SSE wiring is not in place.
- There is no dedicated profile or settings page beyond Supabase metadata.
- Credit balances are tracked locally and not yet synchronized with backend state.
- Several marketing claims (e.g., retention windows, premium tiers) are static copy until the backend delivers matching capabilities.
- API logging lacks sanitization: `lib/api.ts` prints configuration details and auth-token decisions in all environments.
- `createApiError` surfaces backend payloads in `details`; tighten messages for production before exposing users to them.
- No guard rails prevent deploying with `NEXT_PUBLIC_DEV_MODE=true`; add a build-time check in `lib/config.ts` or a script.
- There is no structured request logging, health-check component, or error-reporting integration—add them if those flows are required.
- Automated tests for the error-handling helpers and configuration logic are still missing.

## Backlog
- [ ] (High priority, scheduled last) Instrument product analytics tailored to the dubbing workflow: track account activation and time-to-first-job submission, language-upload wizard drop-off by step, per-language processing success/failure, download completion rates, credit balance burn vs. top-up cadence, billing plan conversion, support ticket response/resolution, and retention signals (DAU/WAU stickiness, 30-day new-job churn). Standardize event schemas around jobs, uploads, credit purchases, and downloads, then integrate a warehouse-friendly pipeline (Segment or RudderStack) feeding Amplitude/Mixpanel/PostHog plus GA4 for acquisition attribution.

## Contributing & Support
1. Create a feature branch and make your changes.
2. Run `npm run lint`.
3. Submit a pull request for review.

Use the repository issue tracker for bug reports or feature requests.
