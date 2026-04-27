# Architecture

**Analysis Date:** 2026-04-06

## Pattern Overview

**Overall:** Multi-layer client-server architecture with file-based routing (Expo Router v6), React Query data management, and dual-token authentication system.

**Key Characteristics:**
- Single codebase targeting iOS, Android, and web via React Native 0.81 + Expo SDK 54
- Expo Router v6 file-based routing with dynamic segments (`[slug]`, `[episodeId]`)
- Centralized API client with request/response interceptors for auth and error handling
- Dual-token auth: API key (app-level) + user token (per-user JWT)
- React Query cache management for optimistic UI and cache invalidation patterns
- TailwindCSS via NativeWind for styling across all platforms
- Platform-specific implementations via `.web.ts` / `.native.ts` file extensions

## Layers

**Routing & Presentation (`app/`):**
- Purpose: Route handlers and screen-level entry points
- Location: `app/`, `app/(tabs)/`, `app/drama/`, `app/watch/`, `app/login.tsx`, `app/subscribe.tsx`
- Contains: Page components, route layouts, redirects, error boundaries
- Depends on: Components, hooks, context (auth), React Query
- Used by: Browser/native OS routing

**Components (`components/`):**
- Purpose: Reusable UI elements (screens, cards, rails, overlays)
- Location: `components/`
- Contains: React Native/Expo components with TailwindCSS styling
- Depends on: Context (auth), hooks, API layer, types
- Used by: Route handlers and other components

**State Management & Context (`context/`, `hooks/`):**
- Purpose: Shared state, authentication, data fetching patterns
- Location: `context/AuthContext.tsx`, `hooks/*.ts`
- Contains: React Context providers, custom hooks for queries/mutations
- Depends on: API layer, lib utilities
- Used by: All components and routes

**API Layer (`api/`):**
- Purpose: Server communication with request/response mapping
- Location: `api/`
- Contains: API client, endpoint handlers, field mappers, response normalization
- Depends on: axios, auth-storage, mappers
- Used by: React Query hooks and components

**Authentication & Storage (`lib/auth-*.js`, `lib/firebase.js`):**
- Purpose: Token management, secure credential storage, Firebase integration
- Location: `lib/auth-storage.js`, `lib/auth-invalid.js`, `lib/auth-service.js`, `lib/firebase.js`
- Contains: Token persistence (AsyncStorage/SecureStore), auth state callbacks
- Depends on: Platform (React Native vs web), Firebase SDK
- Used by: AuthContext, API client interceptors

**Types & Data (`lib/*.ts`):**
- Purpose: Shared type definitions and data transformers
- Location: `lib/drama-detail-types.ts`, `lib/drama-data.ts`, `lib/types.ts`, `lib/date-utils.ts`
- Contains: TypeScript interfaces for API responses, drama shapes, episode metadata
- Depends on: None
- Used by: All layers

**Analytics (`lib/analytics-service.{web,native}.ts`):**
- Purpose: Event tracking via Mixpanel, MoEngage, Firebase Analytics
- Location: `lib/analytics-service.ts`, `.web.ts`, `.native.ts`
- Contains: Platform-specific analytics initialization and event dispatch
- Depends on: Platform detection, Firebase, Mixpanel SDK
- Used by: AuthContext, route handlers

## Data Flow

**Authentication Flow:**

1. User opens app → `app/_layout.tsx` → `AuthProvider` initializes
2. `AuthContext.refreshToken()` checks stored user token via `auth-storage.js`
3. On login: `handleVerifyPhoneOtp()` → backend API → `setUserFromResponse()` → token persisted to AsyncStorage/SecureStore
4. API requests: `api/client.js` interceptor calls `getAuthToken()` → returns API key (priority) or user token
5. On 401: `api/client.js` → `triggerAuthInvalid()` → `AuthContext.onAuthInvalid()` → clears session (only if no API key)

**Home Screen Data Flow:**

1. Home route (`app/(tabs)/index.tsx`) mounts
2. Three React Query fetches run in parallel:
   - `["dramas"]` → `fetchDramas()` → `api/dramas.js` → maps response with `mapDramaItem()` → UI renders hero + fallback rail
   - `["rails"]` → `fetchRails()` → `api/rails.js` → filters hero rails out, sorts by `display_order`
   - `["continue-watching"]` → `fetchContinueWatching()` → only for authenticated users
3. `GenreChips` filters rails client-side without re-fetching
4. `useQuery` caching prevents refetch on tab navigation

**Drama Detail → Video Player Flow:**

1. User taps drama on home/rail → navigate to `app/drama/[slug].tsx`
2. `DramaDetailScreen` fetches `["drama", slug]` via `fetchDramaDetail()`
3. User selects episode → `usePlaybackRequest()` checks:
   - Locked episode + no subscription → redirect to `/subscribe?episode={id}`
   - Locked episode + subscribed → allow play
   - Free episode + no token → redirect to `/login?redirect=/watch/{id}`
   - Free episode + token → play
4. Navigate to `app/watch/[episodeId].tsx`
5. `EpisodeFeed` mounts with `dramaId` (parsed from `episodeId` format: `{slug}-{number}`)
6. `EpisodeFeed` fetches drama detail (shared cache `["drama", dramaId]`)
7. `SingleEpisodePlayer` renders current episode, streams video via `expo-av`
8. On completion: auto-advance to next episode or redirect to subscribe if locked

**Watchlist State Management:**

1. `useWatchlist()` hook (in `hooks/useWatchlist.ts`) manages cache key `["watchlist"]`
2. `toggleWatchlist()` mutation invalidates `["watchlist"]` on success
3. Any component can call `isInWatchlist(dramaId)` for UI state (e.g., heart icon)
4. Optimistic UI via React Query's `onMutate` (if implemented)

**State Management:**

- Global state: `AuthContext` (user, token, isSubscribed)
- Server state: React Query (`["dramas"]`, `["rails"]`, `["drama", slug]`, `["watchlist"]`, `["continue-watching"]`)
- UI state: Local component state (scroll position, form inputs, modals)
- Side effects: Callbacks via `onAuthInvalid()` for 401 handling, analytics via `analyticsService`

## Key Abstractions

**API Field Mapping:**
- Purpose: Handle inconsistent field names across backend endpoints
- Examples: `api/dramas.js`, `api/rails.js`, `api/mappers.js`
- Pattern: Fallback chains for image URLs (`thumbnail_url → banner_url → ... → placeholder`)
  - Title: `title → name`
  - ID: `slug → id → drama_id`
  - Image resolution: `resolveImageUrl()` handles relative/absolute/protocol-relative URLs with CDN prefix

**Episode ID Format:**
- Purpose: Encode drama slug + episode number in a single identifier
- Format: `{drama-slug}-{episode-number}` (e.g., `love-in-accra-3`)
- Parsed in `app/watch/[episodeId].tsx` to extract `dramaId` and episode number
- Enables URL-based episode navigation and deep linking

**Dual-Token Auth System:**
- Purpose: Separate app-level auth (API key) from user-level auth (JWT)
- API Key: Set via `window.__MYUZE_AUTH_TOKEN__` (web deploy) or `EXPO_PUBLIC_AUTH_TOKEN` (env)
- User Token: Per-user JWT stored in SecureStore (native) or AsyncStorage (web)
- Priority in `getAuthToken()`: API key first, user token as fallback
- Test Accounts: Hardcoded in `AuthContext.tsx` (phone `+10000000001`/`+10000000002`, OTP `123456`)

**React Query Cache Keys:**
- Purpose: Normalize data fetching and enable cache invalidation
- Keys:
  - `["dramas"]` → all dramas list (home hero + fallback rail)
  - `["rails"]` → curated content rails (filtered, sorted)
  - `["drama", slug]` → single drama detail (shared between detail page and player)
  - `["watchlist"]` → user's saved dramas
  - `["continue-watching"]` → user's in-progress dramas

## Entry Points

**Root Layout (`app/_layout.tsx`):**
- Location: `app/_layout.tsx`
- Triggers: App startup (Expo dev server / native entry)
- Responsibilities:
  - Wrap with `SafeAreaProvider`, `QueryClientProvider`, `AuthProvider`
  - Attach global `ErrorBoundary` (class component for React error handling)
  - Mount `AuthGate` to enforce authentication + redirect to login
  - Show `SplashTransition` while auth is loading
  - Track screen views via `analyticsService.screenView()`

**Tabs Layout (`app/(tabs)/_layout.tsx`):**
- Location: `app/(tabs)/_layout.tsx`
- Triggers: After auth gate passes
- Responsibilities:
  - Manage bottom tab navigation (home, watchlist, profile)
  - Animate tab transitions via `TabTransition` component
  - Render `Slot` for child route content

**Home Screen (`app/(tabs)/index.tsx`):**
- Location: `app/(tabs)/index.tsx`
- Triggers: User navigates to home tab
- Responsibilities:
  - Fetch dramas, rails, continue-watching in parallel
  - Render `DynamicBackground` (animated blurred image)
  - Render `HeroUnit` (featured drama from dramas list)
  - Render genre filter chips (client-side filtering)
  - Render `ContinueWatchingRail` (if authenticated)
  - Render content rails (sorted by `display_order`)

**Drama Detail (`app/drama/[slug].tsx`):**
- Location: `app/drama/[slug].tsx`
- Triggers: User taps drama card
- Responsibilities:
  - Fetch drama detail and all dramas (for "more like this")
  - Filter "more like this" by genre overlap
  - Render `DramaDetailScreen` with episodes, description, ratings

**Watch Player (`app/watch/[episodeId].tsx`):**
- Location: `app/watch/[episodeId].tsx`
- Triggers: User requests playback (from `usePlaybackRequest()`)
- Responsibilities:
  - Parse `episodeId` into `dramaId` and episode number
  - Render `EpisodeFeed` (vertical episode scroll)
  - Handle close (back button, fallback to drama detail)

**Login (`app/login.tsx`):**
- Location: `app/login.tsx`
- Triggers: Unauthenticated user tries to access protected route
- Responsibilities:
  - Render `LoginScreen` (phone OTP or Google sign-in)
  - Support `?redirect=` param for post-login navigation
  - Call `AuthContext.sendPhoneOtp()` and `verifyPhoneOtp()`

**Subscribe (`app/subscribe.tsx`):**
- Location: `app/subscribe.tsx`
- Triggers: User tries to play locked episode without subscription
- Responsibilities:
  - Render `SubscribeScreen` with subscription options
  - Support `?episode=` param for context (which episode triggered the paywall)
  - Initiate subscription flow (payment gateway integration)

## Error Handling

**Strategy:** Errors are caught at multiple levels:
- Component level: `try-catch` in event handlers, error states in React Query
- HTTP level: `api/client.js` interceptor catches 401, triggers auth invalid
- Global level: `ErrorBoundary` catches unhandled exceptions, shows retry UI
- Silent failures: `saveProgress()` fire-and-forget with console warning (playback never interrupted)

**Patterns:**

1. **401 (Unauthorized):**
   - Triggered by: `api/client.js` response interceptor
   - Handled by: `AuthContext.onAuthInvalid()` callback
   - Decision tree: If API key exists → log warning (server issue). If no API key → clear user token + session

2. **React Query Errors:**
   - Handled by: Components checking `isError`, rendering error UI
   - Example: `app/drama/[slug].tsx` shows "Failed to load drama" message
   - User action: Can retry by pressing retry button or navigating away

3. **Playback Errors:**
   - Video load failure: `SingleEpisodePlayer` shows error overlay with retry
   - Network timeout: Caught by `api/client.js`, handled as React Query error
   - OOM/crash: `ErrorBoundary` shows "Something went wrong" screen

## Cross-Cutting Concerns

**Logging:** 
- Uses `console.log()` for debugging (should migrate to production logger)
- Auth flow: `[AuthContext]`, `[auth-storage]` prefixes
- API: `[saveProgress]` for specific operations
- Production: Firebase Crashlytics via `@react-native-firebase/crashlytics`

**Validation:** 
- Input validation at system boundaries: `app/login.tsx` validates phone format before OTP
- API response validation: Fallback chains in field mappers (e.g., `item.slug ?? item.id ?? item.drama_id`)
- Type safety via TypeScript in shared types (`lib/drama-detail-types.ts`, `lib/types.ts`)

**Authentication:**
- Firebase Auth (native + web): Phone OTP, Google sign-in
- Test accounts bypass Firebase (hardcoded in `AuthContext.tsx`)
- API key + user token dual system (see Key Abstractions)
- Token refresh: `refreshToken()` in `AuthContext` on app startup, checked on every request

**Analytics:**
- Platform-specific: `lib/analytics-service.{web,native}.ts`
- Events tracked: Screen views, user identification, auth events
- Providers: Mixpanel (web), MoEngage (native), Firebase Analytics (all platforms)
- Reset on logout: `analyticsService.reset()`

---

*Architecture analysis: 2026-04-06*
