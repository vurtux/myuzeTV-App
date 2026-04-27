# External Integrations

**Analysis Date:** 2026-04-06

## APIs & External Services

**Backend API:**
- myuze.app - Content delivery, subscription, authentication backend
  - Base URL: `https://tv.myuze.app/api` (env: `EXPO_PUBLIC_API_URL`)
  - Client: Axios with request/response interceptors (`api/client.js`)
  - Auth: Bearer token in Authorization header (via `getAuthToken()`)

**CDN (Image Delivery):**
- myuze.app CDN - Serves drama images, thumbnails, banners
  - Base URL: `https://tv.myuze.app` (default) or `EXPO_PUBLIC_CDN_URL`
  - Resolver: `resolveImageUrl()` in `api/mappers.js` handles relative/absolute/protocol-relative URLs
  - Fallback: Placeholder images via `placehold.co` if no image found

## Data Storage

**Databases:**
- Backend (myuze.app) - Primary source
  - Connection: REST API over HTTPS
  - No direct client access; all queries go through backend endpoints
  - User tokens required for authenticated endpoints

**Local Storage:**
- AsyncStorage (`@react-native-async-storage/async-storage 2.2.0`)
  - Used on: Web, iOS, Android
  - Stores: User auth tokens, user profile data (cached)
  - Access: `lib/auth-storage.js` (getUserToken, setUserToken, getAuthToken)

**Secure Storage (Native):**
- expo-secure-store 15.0.8
  - Used on: iOS, Android only
  - Stores: User auth tokens in platform keystore
  - Access: `lib/auth-storage.js` (fallback on mobile platforms)

**Client-Side Caching:**
- React Query (`@tanstack/react-query 5.90.21`)
  - Cache keys: `["dramas"]`, `["rails"]`, `["drama", slug]`, `["watchlist"]`, `["continue-watching"]`
  - Managed by QueryClientProvider in `app/_layout.tsx`

**File Storage:**
- Local filesystem only (for app assets like images, splash screens)
- No cloud file storage integration

**Caching:**
- React Query client-side caching with stale-while-revalidate strategy
- No Redis or distributed caching

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - SDK: `firebase 12.9.0` (web), `@react-native-firebase/app 23.8.6` (native)
  - Config: `lib/firebase.js` (web config) + `google-services.json` (Android) + `GoogleService-Info.plist` (iOS)
  - Supported methods:
    - Phone OTP (primary via Firebase Phone Auth)
    - Google Sign-In
  - Firebase UID flows through `AuthContext.tsx` → login to backend

**Dual-Token Auth System:**
- **API Key** (app-level): `EXPO_PUBLIC_AUTH_TOKEN` env var or `window.__MYUZE_AUTH_TOKEN__` on web
  - Injected at build time by `scripts/inject-config.js`
  - Used for unauthenticated API access on web deploy
  - Priority: Takes precedence over user tokens in `getAuthToken()`

- **User Token** (per-user JWT): Issued by backend `/auth/login` or `/auth/register`
  - Stored in secure storage (native) or AsyncStorage (web)
  - Cleared on logout via `setUserToken(null)`
  - Fallback auth if API key not available

**Test Accounts (Dev Only):**
- Phone `+10000000001` → Free user (no backend call)
- Phone `+10000000002` → Premium user (no backend call)
- OTP: `123456` (hardcoded in `AuthContext.tsx`, TEST_ACCOUNTS)

## Monitoring & Observability

**Error Tracking:**
- Crashlytics (`@react-native-firebase/crashlytics 23.8.6`)
  - Captures unhandled exceptions on iOS/Android
  - Configured in `lib/analytics-service.native.ts`
  - Not used on web (Firebase Analytics instead)

**Logs:**
- `console.log` / `console.warn` / `console.error` - Primary logging mechanism
  - Logged to browser console (web) or system logs (native)
  - [AuthContext] - Auth state changes
  - [auth-storage] - Token operations
  - [Analytics] - Analytics service lifecycle
  - [saveProgress] - Video playback progress errors (caught silently)

**Analytics:**
- See "Analytics & Event Tracking" section below

## Analytics & Event Tracking

**Web Platform:**
- **Mixpanel** - Event tracking via CDN snippet injection
  - Token: `34e09017988589702619950f0b9ebe7e`
  - SDK: Snippet-based (script tag injected into `<head>`)
  - Implementation: `lib/analytics-service.web.ts`
  - Tracks: User identification, events, user properties

- **MoEngage** - User engagement and push notifications (web)
  - App ID: `P571B1CH9BHEN2GUQTM75EZ1`
  - SDK: Snippet-based (script tag injected into `<head>`)
  - Implementation: `lib/analytics-service.web.ts`
  - Tracks: User identification, events, user attributes

- **Firebase Analytics** - Event tracking via Firebase SDK
  - SDK: `firebase 12.9.0` (web)
  - Implementation: `lib/analytics-service.web.ts`
  - Tracks: User identification, events, user properties
  - Configuration: Embedded in `lib/firebase.js`

**Native Platform (iOS/Android):**
- **Mixpanel** - Event tracking
  - SDK: `mixpanel-react-native 3.3.0`
  - Token: `34e09017988589702619950f0b9ebe7e`
  - Implementation: `lib/analytics-service.native.ts`
  - Tracks: User identification, events, user properties

- **MoEngage** - User engagement and push notifications
  - SDK: `react-native-moengage 12.5.0` (core) + `react-native-expo-moengage 1.1.0` (Expo plugin)
  - App ID: `P571B1CH9BHEN2GUQTM75EZ1`
  - Implementation: `lib/analytics-service.native.ts`
  - Tracks: User identification, events, user attributes
  - Plugin config: `app.json` with dataCenter: `DC_1`

- **Firebase Analytics** - Event tracking
  - SDK: `@react-native-firebase/analytics 23.8.6`
  - Implementation: `lib/analytics-service.native.ts`
  - Tracks: Screen views, events, user properties
  - Requires: google-services.json (Android), GoogleService-Info.plist (iOS)

**Unified Analytics Service:**
- `AnalyticsService` singleton in `lib/analytics-service.*`
- Methods: `init()`, `identify(userId, properties)`, `trackEvent(name, properties)`, `screenView(screenName)`, `reset()`
- Platform routing: `.web.ts` for web, `.native.ts` for iOS/Android
- Initialization: Called after auth check in `AuthContext.tsx`

## API Endpoints

**Authentication:**
- `POST /auth/login` - Login with Firebase UID, returns user token
  - Body: `{ firebase_uid, country_code? }`
  - Response: User object with token
  - Error 404: UserNotFoundError (new user, redirect to register)
  - Implementation: `api/auth.js` → `loginWithBackend()`

- `POST /auth/register` - Register new user
  - Body: `{ firebase_uid, email?, phone?, name?, profile_image?, country_code? }`
  - Response: User object with token
  - Implementation: `api/auth.js` → `registerWithBackend()`

**Dramas & Content:**
- `GET /dramas` - List all dramas with metadata
  - Returns: Array of drama objects
  - Fields: title, thumbnail_url, genre, episode, progress, etc.
  - Implementation: `api/dramas.js` → `fetchDramas()`

- `GET /dramas/{slug}` - Fetch full drama detail with episodes
  - Returns: Drama detail with full episode list
  - Fields: title, banner, genre, episodes[], free_episodes, etc.
  - Implementation: `api/dramas.js` → `fetchDramaDetail(slug)`

- `GET /rails` - Curated content rails (hero carousel, genre rails)
  - Returns: Array of rail objects sorted by display_order
  - Used by: Home screen for horizontal scrolling content
  - Implementation: `api/rails.js` → `fetchRails()`

- `GET /continue-watching` - User's watched progress list (authenticated)
  - Returns: Array of dramas with watch progress
  - Requires: User token or API key
  - Implementation: `api/dramas.js` → `fetchContinueWatching()`

**Watch Progress & Interaction:**
- `POST /episodes/{episodeId}/progress` - Save playback position (fire-and-forget)
  - Body: `{ progress_seconds, is_completed }`
  - Errors: Caught silently to not interrupt playback
  - Implementation: `api/dramas.js` → `saveProgress()`

- `POST /dramas/{dramaId}/like` - Toggle like on drama
  - Returns: `{ liked, total_likes }`
  - Implementation: `api/dramas.js` → `likeDrama()`

**Watchlist:**
- `GET /watchlist` - User's watchlist (authenticated)
  - Returns: Array of watchlisted dramas
  - Implementation: `api/watchlist.js` → `fetchWatchlist()`

- `POST /watchlist/{dramaId}` - Add to watchlist
  - Returns: Updated watchlist
  - Implementation: `api/watchlist.js` → `addToWatchlist()`

- `DELETE /watchlist/{dramaId}` - Remove from watchlist
  - Implementation: `api/watchlist.js` → `removeFromWatchlist()`

**Subscriptions:**
- `GET /subscription/plans?platform={platform}` - List subscription plans
  - Params: platform = "ios" | "android" | "web"
  - Returns: Array of plan objects
  - Implementation: `api/subscription.js` → `fetchSubscriptionPlans(platform)`

- `GET /subscription/status` - Check current user's subscription
  - Returns: `{ subscription_status, subscription_expires_at }`
  - Requires: User token or API key
  - Implementation: `api/subscription.js` → `checkSubscriptionStatus()`

## Environment Configuration

**Required Environment Variables:**
- `EXPO_PUBLIC_API_URL` - Backend API base URL (default: `https://tv.myuze.app/api`)
- `EXPO_PUBLIC_AUTH_TOKEN` - App-level API key for web auth (injected at build time)
- `EXPO_PUBLIC_CDN_URL` (optional) - Override image CDN base URL

**Firebase Configuration:**
- `app.json` - Firebase project ID, auth domain, storage bucket, etc.
- `google-services.json` - Android Firebase configuration (generated from Firebase console)
- `GoogleService-Info.plist` - iOS Firebase configuration (generated from Firebase console)
- `lib/firebase.js` - Web Firebase config with API keys and measurement ID

**MoEngage Configuration:**
- `app.json` - MoEngage app ID (`P571B1CH9BHEN2GUQTM75EZ1`) and dataCenter
- App ID also hardcoded in `lib/analytics-service.web.ts` and `.native.ts`

**Secrets Location:**
- `.env` file - Contains `EXPO_PUBLIC_AUTH_TOKEN` (dev only, injected into `dist/config.js` on web)
- `google-services.json` - Contains Firebase service account details (commited to repo)
- `GoogleService-Info.plist` - Contains Firebase service details (commited to repo)

## Webhooks & Callbacks

**Incoming:**
- None detected. All communication is request-response via REST API.

**Outgoing:**
- None detected. Analytics events are sent via SDK HTTP calls, not webhooks.

---

*Integration audit: 2026-04-06*
