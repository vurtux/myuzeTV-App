# Codebase Concerns

**Analysis Date:** 2026-04-06

## Tech Debt

### Duplicate Field Mapping Logic Across API Files

**Issue:** Image URL and ID field fallback chains are duplicated across three API files, creating maintenance burden and inconsistency risk.

**Files:** 
- `api/dramas.js` (lines 9-20, 162-172 for mapDramaItem and fetchDramaDetail)
- `api/rails.js` (lines 14-25 in nested mapping loop)
- `api/watchlist.js` (lines 14-24 in array mapping)

**Pattern:** Each file contains hardcoded fallback chains like:
```javascript
item.thumbnail_url ?? item.banner_url ?? item.thumbnail ?? item.image ?? 
item.poster ?? item.poster_url ?? item.cover ?? item.cover_image ?? 
item.cover_url ?? item.media?.thumbnail_url ?? item.media?.banner_url
```

**Impact:** 
- Code change requires updates in three places
- Risk of inconsistent field precedence across endpoints
- Makes API response schema changes painful

**Fix approach:** Extract to a shared utility like `mappers.js:extractImageUrl()` that accepts any item and returns resolved URL. Update all files to use this single function.

---

### Untyped API Responses Throughout codebase

**Issue:** JavaScript files (`api/` modules) lack JSDoc or TypeScript types, making response contracts implicit and hard to maintain. Each file manually handles multiple envelope formats with ad-hoc fallbacks.

**Files:** 
- `api/dramas.js`, `api/rails.js`, `api/watchlist.js` - Array envelope handling (lines checking `data.data ?? data.dramas ?? []`)
- `api/episodes.js` (line 11-12) - Stream URL with 4 fallback attempts: `data?.url ?? data?.hls_url ?? data?.hls ?? data?.stream_url`
- `api/subscription.js` (lines 14-20) - Subscription plans with nested fallbacks
- All files lack response types that document the API contract

**Impact:** 
- If backend changes field names, no compile-time detection
- Fallback chains mask API inconsistency rather than documenting it
- New developers don't know which fields are guaranteed vs. optional
- Tests must mock multiple response shapes to ensure coverage

**Fix approach:** Add JSDoc types to all `api/*.js` files documenting expected response shapes. Migrate to TypeScript `.ts` files with `interface` definitions for all API responses (e.g., `DrameListResponse`, `EpisodeStreamResponse`).

---

### Silent Error Swallowing in Progress Tracking

**Issue:** `saveProgress()` in `api/dramas.js` (lines 57-67) fire-and-forgets with only `console.warn()` on error. If progress fails silently, user progress is lost but they never know.

**Files:** `api/dramas.js:saveProgress()` (lines 59-66)

**Current code:**
```javascript
api.post(`/episodes/${episodeId}/progress`, { ... })
  .catch((err) => {
    console.warn('[saveProgress] Failed to save progress:', err?.message || err);
  });
```

**Impact:** 
- Network failures, 5xx errors, or 401s silently fail
- User progress lost without feedback
- No retry logic or queuing for offline sync
- `console.warn()` won't reach production users

**Fix approach:** Queue failed progress updates in localStorage and retry on next online event. Show toast/notification to user if multiple retries fail. Use a proper offline-first library or implement simple queue with exponential backoff.

---

## Known Bugs & Fragile Patterns

### Episode ID Parsing Brittle to Slug Format Changes

**Issue:** Episode ID format assumed to be `{drama-slug}-{episode-number}` (e.g., `"love-in-accra-3"`). Parser splits by `-` and assumes last segment is always a number, which breaks for slugs containing numbers or hyphens.

**Files:** 
- `app/watch/[episodeId].tsx` (lines 14-20) - `parts.slice(0, -1).join("-")` assumes slug has no numbers
- `components/EpisodeFeed.tsx` (line 108) - `episodeId.split("-").pop() || "1"` replicates the same brittle logic

**Example failures:**
- Slug `"episode-2-of-love-3"` with episode 5 formats as `"episode-2-of-love-3-5"`, incorrectly parsed as slug `"episode-2-of-love"`
- Slug without hyphens like `"love3"` for episode `3` becomes ambiguous

**Impact:** 
- Cannot support slugs with trailing numbers
- Wrong drama loaded if slug/episode number overlap
- Silent failures (wrong dramaId passed to API)

**Fix approach:** Change episode ID format to use explicit delimiter like `{slug}::${episodeNumber}` or include episode number in a queryParam. Update `[episodeId].tsx` and `EpisodeFeed.tsx` parsing logic.

---

### Dual-Token Auth System Confusion Risk

**Issue:** Two separate tokens with similar names cause subtle auth bugs. `getAuthToken()` returns API key first, then user token as fallback—but fallback behavior is fragile.

**Files:**
- `lib/auth-storage.js` (lines 73-80) - `getAuthToken()` priority logic
- `context/AuthContext.tsx` (lines 114-189) - 401 handling assumes API key presence means server issue
- `api/client.js` (lines 28-36) - Calls `triggerAuthInvalid()` without context about which token failed

**Risks:**
- If API key is set but expired/revoked at backend, 401 won't clear user session (line 175 of AuthContext says "don't clear user session")
- User token expiry also returns 401, but on web with API key present, user won't be logged out
- Test accounts and real auth flows use different code paths and can diverge

**Impact:** 
- Users with valid user tokens getting stuck in 401 loops on web if API key misconfigured
- Native apps (no API key) handle 401 correctly, but web apps might not
- Two separate token storage mechanisms (SecureStore vs AsyncStorage) increase surface area

**Fix approach:** Unify auth flow. Either:
1. Always prefer user token; remove API key from request headers and use it only for client validation
2. If using API key, make it truly separate from user auth (different header, different 401 handling)
3. Document the priority clearly in code comment with examples of when each token is used

---

### Episode Stream URL Fetch Disabled for Inactive Episodes Masks Real Issues

**Issue:** `SingleEpisodePlayer.tsx` disables stream URL fetching when episode is inactive (`enabled: isActive`, line 134). This was done to avoid "permanent spinner bug at EP3+" but masks why multiple video elements were being created.

**Files:** `components/SingleEpisodePlayer.tsx` (lines 131-137)

**Root cause not addressed:** Browser suspended videos due to resource limits when 3+ video elements created simultaneously. This is a browser behavior, not a caching issue.

**Current workaround:**
```typescript
const { data: streamUrl, isLoading: streamLoading } = useQuery({
  queryKey: ["episode-stream", effectiveEpisodeId],
  queryFn: () => fetchEpisodeStream(effectiveEpisodeId),
  enabled: isActive,  // <-- Prevents prefetch, hides real issue
  staleTime: 60 * 1000,
});
```

**Impact:** 
- Back-swipe to previous episode causes re-fetch (not instant)
- If user rapidly swipes, multiple fetches happen
- Next episode always takes 200ms+ to start (network round-trip)
- Real issue (video element lifecycle) not fixed, just worked around

**Fix approach:** Instead of disabling fetch, properly clean up video elements when episode becomes inactive. Investigate why `<Video ref={videoRef}>` elements are persisting across swipes. May need to unmount/remount video component or call `unloadAsync()` explicitly.

---

### Login Screen Hard-Coded Test Accounts in Production Code

**Issue:** Test account credentials hard-coded in `AuthContext.tsx` (lines 24-47) with specific phone numbers and tokens visible in source code.

**Files:** `context/AuthContext.tsx` (lines 24-47)

**Test accounts:**
- `+10000000001` (free user) with token `"test-free-token-myuze-dev-only"`
- `+10000000002` (premium user) with token `"test-premium-token-myuze-dev-only"`

**Impact:** 
- If source code is leaked, test accounts become publicly known
- Anyone can log in as test user to explore paid features
- In production builds, these accounts are still functional
- Token strings in source code violate secret management practices

**Fix approach:** Move test accounts to a separate `test-accounts.config.js` file that's `.gitignore`d in production. Load via environment variable in dev. Alternatively, remove test accounts entirely and use proper test fixtures/mocks for unit tests, real test API endpoints for E2E.

---

### Subscription Status Check Never Called

**Issue:** `fetchSubscriptionStatus()` exists in `api/subscription.js` (line 30) but is never imported or called anywhere in codebase. Subscription status is derived only from `user.subscription_status` field.

**Files:** 
- `api/subscription.js` (lines 30-33) - Function defined but unused
- `context/AuthContext.tsx` - Uses `user.subscription_status` directly, never calls API

**Impact:** 
- If user's subscription expires mid-session, status won't update (must refresh app)
- Dead code creates confusion about whether to trust `user.subscription_status`
- API endpoint exists but is unused (backend waste or legacy API?)

**Fix approach:** Either:
1. Remove the function if subscription is always synced during login
2. Call it periodically (e.g., on app resume, or in background task) to refresh status
3. Move subscription check to a separate React Query hook that user detail pages can use

---

## Security Considerations

### API Key Stored in Window Object on Web

**Issue:** `EXPO_PUBLIC_AUTH_TOKEN` env var becomes `window.__MYUZE_AUTH_TOKEN__` on web (injected by `scripts/inject-config.js`). Accessible to JavaScript and XSS payloads.

**Files:** 
- `lib/auth-storage.js` (lines 11-12) - Reads from window
- `scripts/inject-config.js` (assumed location) - Injects token into `<script>` tag

**Risk:** If page is served over HTTP or has XSS vulnerability, token is exposed.

**Mitigation:** Already present: `EXPO_PUBLIC_` prefix indicates this is a public, non-secret token (app-level, not user-specific). However, if this token is rate-limited per IP or carries meaningful API quota, XSS could allow DOS attacks.

**Fix approach:** Document that `EXPO_PUBLIC_AUTH_TOKEN` must be a low-sensitivity, rate-limited app key. Never use high-privilege backend credentials. Consider rotating key if XSS is discovered.

---

### Test Accounts Bypass Firebase Entirely

**Issue:** Test account OTP verification (line 231 in AuthContext) checks for hardcoded OTP `"123456"` without rate limiting or attempt counter.

**Files:** `context/AuthContext.tsx` (lines 229-244)

**Current code:**
```typescript
if (otpCode !== "123456") {
  throw new Error("Invalid OTP");
}
```

**Risk:** Brute-force attempts (6 digits = 1 million combinations) could crack real users if same mechanism used for Firebase fallback.

**Fix approach:** Rate limit OTP attempts (e.g., max 3 per minute per phone). Log all OTP verification attempts. Ensure Firebase OTP also has rate limiting on backend.

---

## Performance Bottlenecks

### Rapid Episode Swipe Causes Multiple Stream URL Fetches

**Issue:** Although `enabled: isActive` prevents concurrent fetches, rapid swipe-left-right-left still triggers multiple `fetchEpisodeStream()` calls across episodes. Each network request adds latency.

**Files:** `components/SingleEpisodePlayer.tsx` (lines 131-137)

**Root cause:** React Query cache has 60s staleTime but doesn't prevent fetching during rapid navigation. FlatList ±1 rendering means adjacent episodes constantly switch between active/inactive.

**Impact:** 
- Episode 3: fetch stream
- Swipe to 2: EP3 inactive, EP2 active, fetch new stream
- Swipe to 3: EP2 inactive, EP3 active, fetch EP3 stream AGAIN (cache miss if >5 sec elapsed)
- Swipe to 4: fetch EP4, then back to 3: fetch EP3 AGAIN

**Fix approach:** Increase `staleTime` to 5-10 minutes or implement prefetch for adjacent episodes (EP3 ±1). Cache should persist across swipes.

---

### EpisodeFeed Re-renders Entire FlatList on Every State Change

**Issue:** Large dependency arrays in `renderItem` callback may trigger unnecessary re-renders of adjacent episodes.

**Files:** `components/EpisodeFeed.tsx` (lines 300-342)

**Dependencies:** `[currentIndex, dramaData, dramaId, isSubscribed, onClose, handleEpisodeFinish, handleEpisodeSelect]` — any change re-creates all item renderers.

**Impact:** 
- Changing `isSubscribed` status re-renders ±1 episodes even if their content doesn't depend on subscription
- Scroll jank if re-renders happen during momentum scroll

**Fix approach:** Memoize `renderItem` with `useCallback` and ensure dependency array only includes properties that actually affect individual item rendering (not episode-wide props like `onClose`).

---

### Home Screen Fetches All Dramas on Every Mount

**Issue:** Home screen has three parallel queries (`dramas`, `rails`, `continue-watching`) with no staleTime configured. If user navigates away and back, all re-fetch.

**Files:** `app/(tabs)/index.tsx` (lines 145-150+)

**Default React Query staleTime:** 0 (fetches immediately on re-render if data is stale).

**Impact:** 
- Flicker/loading state on back/forward navigation
- Network bandwidth wasted
- User experience degradation if on slow connection

**Fix approach:** Set `staleTime: 5*60*1000` (5 minutes) on all home screen queries. Add manual refetch button if real-time updates needed.

---

## Missing Critical Features

### No Offline Support for Watchlist

**Issue:** Watchlist add/remove operations (`api/watchlist.js` lines 45-58) fire immediately to server with no local optimistic update or queuing.

**Files:** `api/watchlist.js` (lines 45-58)

**Impact:** 
- If user goes offline mid-update, watchlist state becomes inconsistent
- No visual feedback that operation succeeded or failed
- No retry on reconnection

**Fix approach:** Implement optimistic update (add/remove from local state immediately) with server sync in background. Queue failed operations and retry with exponential backoff.

---

### No Error Messages Shown to User for Failed Operations

**Issue:** API errors are caught but not surfaced to UI. `saveProgress()` only logs to console.

**Files:** Multiple API functions catch errors silently:
- `api/dramas.js:saveProgress()` (line 64)
- All async operations in components (caught but logged, not shown)

**Impact:** 
- User doesn't know if action succeeded or failed
- Silent failures (e.g., watchlist add fails but UI shows added)
- No guidance on how to retry

**Fix approach:** Create an error toast/notification system. Wrap all user-facing mutations with error handling that shows message to user.

---

## Test Coverage Gaps

### Unit Tests Only for API Mappers, No Integration Tests

**Issue:** `__tests__/api/dramas.test.js` covers happy paths but missing:
- Error scenarios (network failure, 5xx response)
- Edge cases (malformed data, missing fields)
- Integration with actual app flow

**Files:** 
- `__tests__/api/dramas.test.js` (460 lines) - Good coverage of happy path
- No error test cases for `saveProgress()`, `likeDrama()`, `fetchWatchlist()`
- No tests for subscription status flow

**Impact:** 
- Real failures only discovered by QA or users
- Silent errors (catch blocks) are untested

**Fix approach:** Add error test suite for each API file. Mock network errors, 5xx responses, timeout scenarios. Add integration tests for critical flows (login → view episode → save progress).

---

### No E2E Tests for Video Playback

**Issue:** `e2e-playwright/` directory exists with test files but video playback (the core feature) is not tested end-to-end.

**Files:** 
- `e2e-playwright/04-video-player.spec.ts` - Exists but may not cover actual playback
- No tests for episode switching, skip intro, progress tracking

**Impact:** 
- Video playback bugs only caught in production (EP3 stuck spinner was caught post-deploy)
- Cannot verify fixes with automated tests

**Fix approach:** Add E2E tests for:
1. Play episode → video loads and plays
2. Swipe to next episode → auto-advance
3. Video progress → save to server
4. Locked episode for non-subscriber → redirect to paywall

---

## Scaling Limits

### FlatList ±1 Rendering Limits Episode Count

**Issue:** EpisodeFeed only renders current ± 1 episodes to avoid memory bloat. Works for dramas with 100s of episodes but scales poorly for shows with 1000s.

**Files:** `components/EpisodeFeed.tsx` (lines 310-312)

**Current limit:** Only 3 episodes in memory at once. If drama has 5000 episodes, jump to EP2000 requires linear scroll through all 1999.

**Fix approach:** Use windowed FlatList with dynamic item sizing. Or implement search-to-episode feature to jump to specific episode number.

---

### Home Screen Carousel Re-renders All Rails on Genre Filter

**Issue:** Filtering by genre re-renders all rails even though most are unchanged. Client-side filter has no memoization.

**Files:** `app/(tabs)/index.tsx` - `railMatchesGenre()` called for every rail on every filter change.

**Impact:** 
- Jank on slow phones when filtering
- Network not the bottleneck, but render pipeline is

**Fix approach:** Memoize filtered rails with `useMemo` and only recompute when `selectedGenre` or `rails` change.

---

## Code Quality Issues

### Duplicated Utility Functions Across Components

**Issue:** `formatCompact()` and `parseCompact()` are defined in multiple files:
- `components/SingleEpisodePlayer.tsx` (lines 48-62)
- `components/DramaDetailScreen.tsx` (lines 22-26)
- `api/dramas.js` (lines 141-146)

**Files:** Three separate implementations.

**Impact:** 
- If number formatting changes, must update 3+ places
- Inconsistent rounding or precision across components

**Fix approach:** Extract to `lib/number-utils.ts` and import everywhere. Single source of truth.

---

### Long Component Files Lack Separation of Concerns

**Issue:** Several components exceed 600 lines and mix rendering, logic, and animations.

**Files:** 
- `components/LoginScreen.tsx` (872 lines) - Auth logic + UI rendering + animations
- `components/SingleEpisodePlayer.tsx` (694 lines) - Video control logic + progress tracking + drawer
- `components/DramaDetailScreen.tsx` (696 lines) - Detail rendering + playback logic + like/watchlist

**Impact:** 
- Hard to test individual concerns
- Difficult to reuse logic (e.g., like/watchlist logic locked in component)
- Cognitive load when reading

**Fix approach:** Extract:
- Auth flow logic from LoginScreen to custom hook (`usePhoneAuth()`)
- Video control logic from SingleEpisodePlayer to `useVideoPlayer()` hook
- Like/watchlist logic to custom hooks

---

### Missing Type Safety on API Response Envelopes

**Issue:** API responses use ad-hoc envelope unwrapping instead of documented types. No guarantee which field names the server will use.

**Files:** All `api/*.js` files

**Example from `dramas.js` line 40-41:**
```javascript
const raw = Array.isArray(data) ? data : data?.data ?? data?.dramas ?? [];
```

This says: "response could be array directly, or wrapped in `.data`, or wrapped in `.dramas`". Which one is correct?

**Impact:** 
- New API responses need guesswork
- If server changes, no compile error
- Tests must mock all envelope variants

**Fix approach:** Document API contract. Create `types/api.ts` with response shapes:
```typescript
interface DramasListResponse {
  data: Drama[] | { data: Drama[] } | { dramas: Drama[] }
}
```

Then add TypeScript files that enforce types.

---

*Concerns audit: 2026-04-06*
