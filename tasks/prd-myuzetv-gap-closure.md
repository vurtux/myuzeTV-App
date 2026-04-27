# PRD: myuzeTV Gap Closure

## Introduction

myuzeTV is a micro-drama streaming app built with React Native (Expo SDK 54) and a Laravel 12 backend. After competitive analysis against market leaders (ReelShort: 370M+ downloads, DramaBox: 100M+ downloads, MyDrama: 40M+ users), critical gaps were identified in the video player, drama detail page, backend integration, and standard streaming features.

This PRD covers 4 phases of work to bring myuzeTV to competitive parity. The app uses a **subscription-only model** (no coins, no gamification, no pay-per-episode) — this is the primary competitive differentiator.

**Payment integration is deferred** — the existing subscribe screen UI will be kept as-is. Onboarding genre selection is also deferred.

## Goals

- Fix broken video player swipe gestures and screen fitting so episode transitions are seamless and predictable
- Redesign the drama detail page to match best-in-market UX (DramaBox/ReelShort quality)
- Wire up existing but unused backend endpoints (watch progress, likes, subscription status, real drama data)
- Add missing table-stakes features (skeleton loading, genre browsing, search filters, account deletion)
- Achieve comprehensive test coverage with Jest (unit/integration) and Maestro (UI/E2E simulator tests)

## Tech Stack

- **Frontend:** React Native 0.81 + Expo SDK 54 + expo-router v6 + NativeWind (Tailwind)
- **Backend:** Laravel 12 + PHP 8.2 + MySQL + Bunny Stream (HLS)
- **Testing:** Jest + React Native Testing Library (unit/integration), Maestro (UI/E2E)
- **State:** TanStack React Query (server), React Context (auth)

---

## Phase 1: Video Player Overhaul

### US-101: Fix swipe gesture detection
**Description:** As a user, I want swipe up/down to reliably change episodes and never be confused with a tap, so that I can binge episodes without frustration.

**Acceptance Criteria:**
- [ ] Swipe UP (dy < -50 AND vy < -0.3) navigates to next episode
- [ ] Swipe DOWN (dy > 50 AND vy > 0.3) navigates to previous episode
- [ ] Diagonal swipes (where `|dx| > |dy| * 0.5`) are rejected (no episode change)
- [ ] Movements between 15-50px vertically do NOT toggle controls (dead zone eliminated)
- [ ] Rapid consecutive swipes are debounced (300ms) — only the last swipe fires
- [ ] `isSwiping` flag uses a `useRef` instead of closure variable
- [ ] `onPanResponderTerminate` handler cancels any pending swipe
- [ ] Swipe threshold scales with screen height: `Math.max(50, screenHeight * 0.05)`
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`

### US-102: Fix video screen fitting
**Description:** As a user, I want the video to display correctly on any screen size without cropping important content.

**Acceptance Criteria:**
- [ ] Video uses `ResizeMode.CONTAIN` (shows full frame, black letterbox if needed)
- [ ] Video container fills entire screen (`flex: 1`, no fixed dimensions)
- [ ] Aspect ratio is read from `onLoad` event (`naturalSize.width / naturalSize.height`)
- [ ] Works correctly on iPhone SE (375px), iPhone 15 Pro Max (430px), iPad, and web browser
- [ ] No content cropping on any standard aspect ratio (9:16, 16:9, 4:3)
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/VideoPlayer.tsx`

### US-103: Add episode transition loading state
**Description:** As a user, I want to see a loading indicator during episode transitions instead of a black screen.

**Acceptance Criteria:**
- [ ] Spinner overlay appears when transitioning between episodes
- [ ] Spinner shows within 100ms of swipe completion
- [ ] Spinner disappears when new video starts playing
- [ ] Previous episode frame stays visible during load (no black flash)
- [ ] If load takes > 5 seconds, show "Slow connection" message
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/VideoPlayer.tsx`

### US-104: Prevent race conditions on rapid swipes
**Description:** As a user, I want rapid swipes to always land on the correct episode without loading stale streams.

**Acceptance Criteria:**
- [ ] Each episode load has a unique request ID (incrementing counter or UUID)
- [ ] When a new load starts, the previous load is cancelled via AbortController or query cancellation
- [ ] The loaded stream always matches the current `currentEpNumber` state
- [ ] `activeStreamUrlRef` check validates against current episode, not just URL
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`

### US-105: Disable gestures over control buttons
**Description:** As a user, I want tapping Like/Share/Episode buttons to work without accidentally triggering a swipe.

**Acceptance Criteria:**
- [ ] When controls are visible, the PanResponder gesture layer is disabled
- [ ] Tapping any control button (play, seek, like, share, episodes) works reliably
- [ ] Swiping is only active when controls are hidden
- [ ] Controls auto-hide timer (3.5s) still works normally
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`

### US-106: Add controls fade animation
**Description:** As a user, I want controls to fade in/out smoothly instead of appearing/disappearing instantly.

**Acceptance Criteria:**
- [ ] Controls fade in over 200ms when shown
- [ ] Controls fade out over 300ms when hidden
- [ ] Uses React Native `Animated.timing` or `Reanimated` opacity animation
- [ ] Fade animation doesn't block touch events during transition
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/VideoPlayer.tsx`

### US-107: Add skip intro button
**Description:** As a user, I want to skip the intro of an episode to get straight to the content.

**Acceptance Criteria:**
- [ ] "Skip Intro" button appears in bottom-right area after 2 seconds of playback
- [ ] Button auto-hides after 10 seconds of playback (configurable)
- [ ] Tapping the button seeks to the skip point (default: 10 seconds)
- [ ] Button has semi-transparent dark background for visibility over content
- [ ] Button does not appear if episode is shorter than 30 seconds
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/VideoPlayer.tsx`

### US-108: Add last-episode boundary feedback
**Description:** As a user, I want clear feedback when I've reached the last episode so I know there's nothing more to swipe to.

**Acceptance Criteria:**
- [ ] Swiping up on the last episode shows a toast: "You've reached the last episode"
- [ ] Swiping down on the first episode shows a toast: "This is the first episode"
- [ ] Toast appears at center of screen, fades out after 2 seconds
- [ ] No episode transition is attempted on boundary swipes
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`

### US-109: Wire like button to backend
**Description:** As a user, I want my likes to persist so I can see them when I return to a drama.

**Acceptance Criteria:**
- [ ] Like button calls `POST /dramas/{id}/like` API on tap
- [ ] Initial liked state is loaded from API when episode loads
- [ ] Like count updates optimistically in UI (increments/decrements immediately)
- [ ] Like state persists across episode changes within the same drama
- [ ] Error on like API call shows subtle error indicator (not a crash)
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`, `api/dramas.js`

### US-110: Add web mouse wheel support
**Description:** As a web user, I want to use mouse scroll wheel to navigate between episodes.

**Acceptance Criteria:**
- [ ] Scroll wheel down = next episode (matches swipe up direction)
- [ ] Scroll wheel up = previous episode
- [ ] Wheel events are debounced (500ms) to prevent rapid firing
- [ ] Only active on web platform (`Platform.OS === 'web'`)
- [ ] Does not interfere with episode drawer scrolling
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`

### US-111: Fix episode ID parsing
**Description:** As a developer, I need robust episode ID parsing that handles all formats without silent failures.

**Acceptance Criteria:**
- [ ] Episode ID parsing handles format `drama-slug-123` (slug + episode number)
- [ ] Episode ID parsing handles format `123` (plain episode ID)
- [ ] Invalid formats show error screen instead of silently defaulting to episode 1
- [ ] `dramaId` and `episodeNumber` are validated as non-empty strings / valid numbers
- [ ] Typecheck passes

**Files:** `app/watch/[episodeId].tsx`, `components/VideoPlayer.tsx`

---

## Phase 2: Drama Detail Page Redesign

### US-201: Replace mock data with real API
**Description:** As a developer, I need the detail page to use real backend data instead of the mock `getDramaDetail()` function.

**Acceptance Criteria:**
- [ ] Detail page calls `GET /dramas/{slug}` API endpoint
- [ ] React Query cache key is `["drama", slug]`
- [ ] All fields map correctly: title, banner, genre, total_episodes, free_episodes, rating (total_likes-derived), year (release_date), country, description, episodes
- [ ] Episode status derived from: `episode.number <= drama.free_episodes ? "free" : "locked"` (with subscription check)
- [ ] `getDramaDetail()` mock function and `lib/drama-detail-data.ts` are deleted
- [ ] Typecheck passes

**Files:** `app/drama/[slug].tsx`, `components/DramaDetailScreen.tsx`, `api/dramas.js`, `lib/drama-detail-data.ts` (delete)

### US-202: Make hero section responsive
**Description:** As a user, I want the hero banner to look good on any screen size.

**Acceptance Criteria:**
- [ ] Hero height is 55% of screen height (not fixed 450px)
- [ ] Minimum hero height: 300px (for very small screens)
- [ ] Maximum hero height: 500px (for tablets)
- [ ] Gradient overlay uses 4-stop gradient: `from-black/30 via-black/10 via-transparent to-background`
- [ ] Back button and share button positioned with safe area insets
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro (test on iPhone SE + iPad)

**Files:** `components/DramaDetailScreen.tsx`

### US-203: Show all genres as chips
**Description:** As a user, I want to see all genres of a drama displayed as tappable chips.

**Acceptance Criteria:**
- [ ] All genres from `drama.genre` array are displayed as chips
- [ ] Genre chips use `bg-primary/20 border-primary/30` styling
- [ ] Text is 11px, uppercase, tracking-wide
- [ ] Chips wrap to multiple rows if needed (flex-wrap)
- [ ] If genre is a string (not array), split by comma
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/DramaDetailScreen.tsx`

### US-204: Add visual star rating
**Description:** As a user, I want to see a visual star rating (not just a number) so I can quickly gauge quality.

**Acceptance Criteria:**
- [ ] Rating displays as filled/half/empty stars (e.g., ★★★★☆ for 4.0)
- [ ] Numeric rating shown next to stars: "4.5"
- [ ] Review count shown in parentheses: "(5.1K reviews)"
- [ ] Stars use primary color for filled, muted for empty
- [ ] Half-star supported (e.g., 4.5 shows 4 filled + 1 half)
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/DramaDetailScreen.tsx`

### US-205: Consolidate duplicate description
**Description:** As a developer, I need to remove the duplicate description display and keep only the About section.

**Acceptance Criteria:**
- [ ] Description appears only once in the "About" section
- [ ] About section shows 3 lines by default with "Read more" toggle
- [ ] "Read more" expands to full description with "Show less" toggle
- [ ] Description text removed from the meta/title area above the CTA
- [ ] Typecheck passes

**Files:** `components/DramaDetailScreen.tsx`

### US-206: Remove redundant hero play button
**Description:** As a designer, I want a single clear CTA to start watching, not two competing play buttons.

**Acceptance Criteria:**
- [ ] Large play button removed from hero center
- [ ] "Start Watching" CTA button kept below action bar
- [ ] CTA text shows: "Start Watching - Episode 1 Free" (if free episodes exist)
- [ ] CTA text shows: "Continue Watching - Episode N" (if user has progress)
- [ ] CTA text shows: "Subscribe to Watch" (if no free episodes and not subscribed)
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/DramaDetailScreen.tsx`

### US-207: Show all episodes in scrollable virtualized grid
**Description:** As a user, I want to see all episodes without tapping "+N more", with smooth scrolling.

**Acceptance Criteria:**
- [ ] All episodes displayed in a 2-column grid (3-column on tablets/web >768px)
- [ ] Grid uses FlashList or FlatList for virtualization (not static render)
- [ ] Episode cards show: thumbnail, episode number, duration, lock/free/watched status
- [ ] Free episodes show "FREE" badge (top-left, rose-500)
- [ ] Locked episodes show dimmed image + lock icon + "Premium" label
- [ ] Watched episodes show check badge (top-right)
- [ ] Progress bar shown on partially-watched episodes
- [ ] "+N more" card removed
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/DramaDetailScreen.tsx`

### US-208: Add skeleton loading state for detail page
**Description:** As a user, I want to see content-shaped placeholders while the detail page loads instead of a spinner.

**Acceptance Criteria:**
- [ ] Skeleton shows shimmer effect for: hero banner, genre chips, title, description, episode grid
- [ ] Skeleton layout matches actual content layout (same dimensions)
- [ ] Skeleton appears within 100ms of page navigation
- [ ] Skeleton replaced by real content without layout shift
- [ ] Uses a reusable `SkeletonBox` component with configurable width/height/borderRadius
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/DramaDetailScreen.tsx`, `components/SkeletonBox.tsx` (new)

### US-209: Improve "More Like This" section
**Description:** As a user, I want "More Like This" recommendations to show dramas of the same genre, not random ones.

**Acceptance Criteria:**
- [ ] Dramas filtered by matching genre (at least one genre overlap)
- [ ] Falls back to all dramas if fewer than 3 genre-matched results
- [ ] Maximum 10 dramas shown
- [ ] FlashList `estimatedItemSize` prop set correctly (prevents scroll jank)
- [ ] Card shows: poster image (110x196), title (1 line), genre (1 line)
- [ ] Typecheck passes

**Files:** `app/drama/[slug].tsx`, `components/DramaDetailScreen.tsx`

### US-210: Remove Edit Profile button
**Description:** As a product owner, I want the Edit Profile button removed since we don't collect user info.

**Acceptance Criteria:**
- [ ] "Edit Profile" button removed from ProfileScreen
- [ ] No empty space left where button was (layout adjusts)
- [ ] Profile still shows user name, email/phone (from auth)
- [ ] Typecheck passes

**Files:** `components/ProfileScreen.tsx`

---

## Phase 3: Wire Up Backend Features

### US-301: Track watch progress on playback
**Description:** As a user, I want my watch progress saved so I can resume where I left off.

**Acceptance Criteria:**
- [ ] `POST /episodes/{id}/progress` called at 25%, 50%, 75%, and 100% playback milestones
- [ ] Request body: `{ progress_seconds: number, is_completed: boolean }`
- [ ] Progress call is fire-and-forget (doesn't block playback)
- [ ] Progress only sent if user is authenticated (not guest)
- [ ] Debounced: won't re-send same milestone within 5 seconds
- [ ] Typecheck passes

**Files:** `components/VideoPlayer.tsx`, `api/dramas.js` (add `saveProgress` function)

### US-302: Add Continue Watching rail to home screen
**Description:** As a user, I want to see my in-progress dramas at the top of the home screen so I can quickly resume watching.

**Acceptance Criteria:**
- [ ] "Continue Watching" rail displayed as first rail on home screen (position 0)
- [ ] Only shown when user is authenticated AND has watch progress
- [ ] Calls new backend endpoint `GET /continue-watching`
- [ ] Each card shows: poster, title, episode number, progress bar
- [ ] Tapping a card navigates to the video player at the last watched episode
- [ ] Rail hidden if empty (no layout gap)
- [ ] React Query cache key: `["continue-watching"]`
- [ ] Cache invalidated when returning from video player
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Backend work:**
- [ ] Create `GET /api/continue-watching` endpoint in Laravel
- [ ] Query: `WatchProgress` where `is_completed = false`, ordered by `last_watched_at DESC`
- [ ] Join with Drama and Episode to return drama info + current episode info
- [ ] Limit to 20 results
- [ ] Requires auth (Sanctum middleware)

**Files:**
- Frontend: `app/(tabs)/index.tsx`, `components/ContinueWatchingRail.tsx`, `api/dramas.js`
- Backend: `app/Http/Controllers/API/WatchProgressController.php` (new), `routes/api.php`

### US-303: Fetch real subscription plans from backend
**Description:** As a developer, I need the subscribe screen to show real plans from the API instead of hardcoded values.

**Acceptance Criteria:**
- [ ] Subscribe screen calls `GET /subscription/plans` on mount
- [ ] Plans displayed dynamically: name, price, currency, billing period, features
- [ ] Plans filtered by platform (`web`, `ios`, `android`, or `all`)
- [ ] Loading state while fetching plans
- [ ] Error state if fetch fails ("Unable to load plans. Try again.")
- [ ] React Query cache key: `["subscription-plans"]`
- [ ] Typecheck passes

**Files:** `components/SubscribeScreen.tsx`, `api/subscription.js` (new)

### US-304: Check subscription status on app load
**Description:** As a developer, I need the app to know if the user is subscribed so locked episodes and premium features work correctly.

**Acceptance Criteria:**
- [ ] `GET /auth/me` response includes `subscription_status` and `subscription_expires_at`
- [ ] AuthContext stores `isSubscribed: boolean` and `subscriptionExpiresAt: string | null`
- [ ] Subscription status checked on initial auth load and on app foreground
- [ ] Episode lock/unlock UI uses real subscription status (not hardcoded)
- [ ] Profile screen shows real subscription status and expiry date
- [ ] Typecheck passes

**Files:** `context/AuthContext.tsx`, `components/ProfileScreen.tsx`, `components/DramaDetailScreen.tsx`

### US-305: Wire drama detail to real API endpoint
**Description:** As a developer, I need drama detail pages to fetch from `GET /dramas/{slug}` instead of mock data.

**Acceptance Criteria:**
- [ ] Detail page calls `GET /dramas/{slug}` with the slug from route params
- [ ] Response mapped to DramaDetail interface (title, banner, genre, episodes, etc.)
- [ ] Episodes sorted by `episode_number` ascending
- [ ] Free episode count from `drama.free_episodes` determines lock status
- [ ] Stream URL from `episode.video.hls_playlist_url` or `episode.youtube_url`
- [ ] Delete `lib/drama-detail-data.ts` (mock data file)
- [ ] Typecheck passes

**Files:** `app/drama/[slug].tsx`, `api/dramas.js`, `lib/drama-detail-data.ts` (delete)

### US-306: Wire like button on detail page to backend
**Description:** As a user, I want my likes on the detail page to persist.

**Acceptance Criteria:**
- [ ] Like button calls `POST /dramas/{id}/like` (toggle endpoint)
- [ ] Initial liked state loaded from drama data or a separate check
- [ ] Like count updates optimistically
- [ ] Like state shared between detail page and video player (same drama)
- [ ] Typecheck passes

**Files:** `components/DramaDetailScreen.tsx`, `api/dramas.js`

### US-307: Fetch real profile stats from API
**Description:** As a user, I want my profile stats (saved, watched, hours) to reflect my actual activity.

**Acceptance Criteria:**
- [ ] Profile stats fetched from `GET /auth/me` (enhanced response)
- [ ] Stats shown: watchlist count, completed dramas count, total hours watched
- [ ] Stats update on pull-to-refresh
- [ ] Animated number counters kept (existing animation)
- [ ] Typecheck passes

**Backend work:**
- [ ] Enhance `UserResource` to include computed stats: `watchlist_count`, `completed_dramas_count`, `total_watch_seconds`
- [ ] `watchlist_count`: count of user's watchlist entries
- [ ] `completed_dramas_count`: count of dramas where all episodes have `is_completed = true`
- [ ] `total_watch_seconds`: sum of `progress_seconds` from all `watch_progress` entries

**Files:**
- Frontend: `components/ProfileScreen.tsx`, `api/auth.js` (new or extend)
- Backend: `app/Http/Resources/UserResource.php`

### US-308: Create search API endpoint
**Description:** As a developer, I need a backend search endpoint so the frontend can search with filters.

**Acceptance Criteria:**
- [ ] `GET /dramas/search?q=&genre=` endpoint created
- [ ] `q` parameter: full-text search on title and description
- [ ] `genre` parameter: filter by genre enum value
- [ ] Returns paginated results (20 per page)
- [ ] Results sorted by relevance (matching title first, then description)
- [ ] Empty `q` with `genre` set returns all dramas in that genre
- [ ] Response uses same `DramaResource` format
- [ ] Typecheck passes (backend)

**Files:**
- Backend: `app/Http/Controllers/API/DramaController.php`, `routes/api.php`

### US-309: Create delete account endpoint and wire to frontend
**Description:** As a user, I want to delete my account as required by App Store and Play Store policies.

**Acceptance Criteria:**
- [ ] `DELETE /auth/account` endpoint created in Laravel
- [ ] Endpoint soft-deletes user record (or hard-deletes per policy)
- [ ] Revokes all Sanctum tokens
- [ ] Deletes watchlist, watch progress, likes, and subscriptions
- [ ] Frontend shows confirmation dialog before calling endpoint
- [ ] On success: clears local auth state, navigates to login
- [ ] Typecheck passes

**Files:**
- Frontend: `components/ProfileScreen.tsx`, `context/AuthContext.tsx`
- Backend: `app/Http/Controllers/API/AuthController.php`, `routes/api.php`

---

## Phase 4: Missing Table-Stakes Features

### US-401: Add skeleton loading components
**Description:** As a user, I want to see content-shaped shimmer placeholders while screens load.

**Acceptance Criteria:**
- [ ] Create reusable `SkeletonBox` component: configurable width, height, borderRadius
- [ ] Shimmer animation: light gradient sweeps left-to-right, 1.5s loop
- [ ] Create `SkeletonRail` component: mimics DramaRail layout (5 cards)
- [ ] Create `SkeletonHero` component: mimics HeroUnit layout
- [ ] Home screen uses skeletons instead of ActivityIndicator
- [ ] Watchlist screen uses skeletons instead of ActivityIndicator
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/SkeletonBox.tsx` (new), `components/SkeletonRail.tsx` (new), `components/SkeletonHero.tsx` (new), `app/(tabs)/index.tsx`, `app/(tabs)/watchlist.tsx`

### US-402: Add genre chips to home screen
**Description:** As a user, I want to filter the home feed by genre using tappable chips.

**Acceptance Criteria:**
- [ ] Horizontal scrollable genre chip bar below hero unit
- [ ] Chips: "All", "Romance", "Thriller", "Fantasy", "Comedy", "Family Drama" (from genre enum)
- [ ] "All" selected by default (no filter)
- [ ] Selecting a genre filters displayed rails to show only dramas matching that genre
- [ ] Active chip uses `bg-primary text-white`, inactive uses `bg-white/10 text-muted`
- [ ] Genre filter is client-side (filter existing rails data)
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `app/(tabs)/index.tsx`, `components/GenreChips.tsx` (new)

### US-403: Enhance search with genre filter
**Description:** As a user, I want to filter search results by genre.

**Acceptance Criteria:**
- [ ] SearchOverlay shows genre filter chips below the search input
- [ ] Genre chips: same set as home screen
- [ ] When genre is selected AND search query is entered: both filters apply
- [ ] When only genre is selected (no query): shows all dramas in that genre
- [ ] Search calls `GET /dramas/search?q={query}&genre={genre}` backend endpoint
- [ ] Results update in real-time as user types (300ms debounce)
- [ ] Typecheck passes
- [ ] Verify in simulator using Maestro

**Files:** `components/SearchOverlay.tsx`, `api/dramas.js`

### US-404: Show real app version
**Description:** As a user, I want to see the actual app version in my profile, not a hardcoded value.

**Acceptance Criteria:**
- [ ] App version read from `app.json` `expo.version` field
- [ ] Displayed in profile settings section
- [ ] Falls back to "1.0.0" if unable to read
- [ ] Uses `expo-constants` to access version at runtime
- [ ] Typecheck passes

**Files:** `components/ProfileScreen.tsx`

### US-405: Add pull-to-refresh on all list screens
**Description:** As a user, I want to pull-to-refresh on any screen to get the latest content.

**Acceptance Criteria:**
- [ ] Home screen: RefreshControl triggers re-fetch of rails + continue watching
- [ ] Watchlist screen: RefreshControl triggers re-fetch of watchlist
- [ ] Refresh indicator uses primary color
- [ ] Pull-to-refresh already exists on home/watchlist — verify it invalidates React Query caches properly
- [ ] Typecheck passes

**Files:** `app/(tabs)/index.tsx`, `app/(tabs)/watchlist.tsx`

---

## Functional Requirements

### Video Player
- FR-1: PanResponder must check both displacement (`dy > threshold`) AND velocity (`vy > 0.3`) for swipe detection
- FR-2: Diagonal swipes where `|dx| > |dy| * 0.5` must be rejected
- FR-3: Video must use `ResizeMode.CONTAIN` to prevent cropping
- FR-4: Episode transitions must show a loading spinner overlay
- FR-5: Pending stream loads must be cancelled when a new swipe occurs
- FR-6: Gesture layer must be disabled when controls are visible
- FR-7: Controls must fade in/out with opacity animation (200ms in, 300ms out)
- FR-8: "Skip Intro" button appears at 2s, disappears at 10s (configurable)
- FR-9: Boundary swipes (first/last episode) show toast feedback
- FR-10: Like button calls `POST /dramas/{id}/like` and persists state
- FR-11: Web platform supports mouse wheel for episode navigation (debounced 500ms)
- FR-12: Episode ID parsing validates format and shows error on invalid IDs

### Drama Detail Page
- FR-13: Detail page fetches from `GET /dramas/{slug}` (no mock data)
- FR-14: Hero height is `Math.min(Math.max(screenHeight * 0.55, 300), 500)` pixels
- FR-15: All genres from drama data displayed as chips (flex-wrap)
- FR-16: Rating shown as visual stars (filled/half/empty) + numeric value
- FR-17: Description appears once in "About" section with expand/collapse
- FR-18: Single "Start Watching" CTA (no hero play button)
- FR-19: All episodes shown in virtualized 2-column grid (3 on tablet)
- FR-20: Skeleton loading replaces ActivityIndicator
- FR-21: "More Like This" filtered by genre overlap
- FR-22: "Edit Profile" button removed from ProfileScreen

### Backend Integration
- FR-23: Watch progress sent to `POST /episodes/{id}/progress` at 25/50/75/100%
- FR-24: Continue Watching rail on home screen from `GET /continue-watching`
- FR-25: Subscription plans fetched from `GET /subscription/plans`
- FR-26: Subscription status loaded from `GET /auth/me` into AuthContext
- FR-27: Like toggle wired to `POST /dramas/{id}/like`
- FR-28: Profile stats from enhanced `GET /auth/me` response
- FR-29: Search endpoint: `GET /dramas/search?q=&genre=`
- FR-30: Account deletion: `DELETE /auth/account`

### Home & Discovery
- FR-31: Skeleton loading states replace all spinners
- FR-32: Genre chips on home screen filter displayed rails
- FR-33: Search overlay supports genre filter parameter
- FR-34: App version from `expo-constants` (not hardcoded)

---

## Non-Goals (Out of Scope)

- AI-based recommendations or personalization engine
- Offline episode downloads
- Video quality selection (auto-adaptive only)
- Cross-device watch progress sync
- Episode comments or social features
- User profile editing (no data collected)
- Subtitle support (no backend subtitle data exists)
- Payment integration (deferred — keep existing subscribe UI)
- Onboarding genre selection flow
- Push notification system
- Trailer video playback
- Parental controls / content ratings
- User-generated ratings or reviews

---

## Design Considerations

### Video Player
- Use `react-native-reanimated` for smooth fade animations (already in Expo SDK 54)
- Toast notifications: use a lightweight custom component (no heavy library)
- Skip intro timing should be configurable per-episode in future (for now: global 10s default)

### Drama Detail Page
- Skeleton shimmer: use `react-native-reanimated` for performance
- Star rating: custom component (5 star icons, support half-fill via clip)
- Genre chips: reuse same component between home screen and detail page

### Backend
- Continue Watching query should use Eloquent eager loading to avoid N+1
- Search should use MySQL FULLTEXT index (already exists on `dramas` table)
- Account deletion should be idempotent

---

## Technical Considerations

### Dependencies (existing, no new installs needed)
- `expo-av` — Video playback
- `react-native-reanimated` — Animations (included in Expo SDK 54)
- `@shopify/flash-list` — Virtualized lists
- `@tanstack/react-query` — Server state
- `lucide-react-native` — Icons
- `expo-constants` — App version

### Backend Endpoints to Create
1. `GET /api/continue-watching` — Returns dramas with active watch progress
2. `GET /api/dramas/search` — Full-text search with genre filter
3. `DELETE /api/auth/account` — Account deletion

### Backend Endpoints to Enhance
1. `GET /api/auth/me` — Add computed stats (watchlist_count, completed_dramas_count, total_watch_seconds)

### Performance
- Episode grid: virtualized with FlashList (estimatedItemSize: 200)
- Skeleton animations: native driver for 60fps
- Watch progress API calls: fire-and-forget (no await)
- Search: 300ms debounce on input
- Image loading: expo-image with transition animations (existing)

---

## Test Plan

### Unit Tests (Jest + React Native Testing Library)

**Video Player:**
- `VideoPlayer.test.tsx`
  - [ ] T-101: Swipe up with sufficient velocity triggers next episode callback
  - [ ] T-102: Swipe down with sufficient velocity triggers previous episode callback
  - [ ] T-103: Swipe with insufficient velocity (< 0.3) does not change episode
  - [ ] T-104: Swipe with insufficient displacement (< threshold) does not change episode
  - [ ] T-105: Diagonal swipe (|dx| > |dy| * 0.5) is rejected
  - [ ] T-106: Tap (no movement) toggles controls visibility
  - [ ] T-107: Controls hide after 3.5s timeout when playing
  - [ ] T-108: Controls do not hide when paused
  - [ ] T-109: Skip intro button appears at 2s and hides at 10s
  - [ ] T-110: Skip intro button not shown for episodes < 30s
  - [ ] T-111: Boundary swipe on last episode does not change episode
  - [ ] T-112: Boundary swipe on first episode does not change episode
  - [ ] T-113: Like toggle calls API and updates state
  - [ ] T-114: Rapid swipes debounce to single transition
  - [ ] T-115: Episode ID parsing handles "drama-slug-5" format
  - [ ] T-116: Episode ID parsing handles "123" plain format
  - [ ] T-117: Invalid episode ID shows error state

**Drama Detail Page:**
- `DramaDetailScreen.test.tsx`
  - [ ] T-201: Renders all genres as chips
  - [ ] T-202: Star rating renders correct filled/half/empty stars for 4.5
  - [ ] T-203: Star rating renders correct stars for 3.0
  - [ ] T-204: Star rating renders correct stars for 5.0
  - [ ] T-205: Description shows 3 lines by default
  - [ ] T-206: "Read more" expands description
  - [ ] T-207: "Show less" collapses description
  - [ ] T-208: CTA shows "Start Watching" for new drama
  - [ ] T-209: CTA shows "Continue Watching" for in-progress drama
  - [ ] T-210: Free episodes show "FREE" badge
  - [ ] T-211: Locked episodes show lock overlay
  - [ ] T-212: Watched episodes show check badge
  - [ ] T-213: All episodes rendered (not just 5)
  - [ ] T-214: "More Like This" filtered by genre
  - [ ] T-215: Skeleton shown while loading

**Skeleton Components:**
- `SkeletonBox.test.tsx`
  - [ ] T-301: Renders with correct width and height
  - [ ] T-302: Renders with custom borderRadius
  - [ ] T-303: Shimmer animation loops

**Genre Chips:**
- `GenreChips.test.tsx`
  - [ ] T-304: Renders all genre options plus "All"
  - [ ] T-305: "All" selected by default
  - [ ] T-306: Tapping genre calls onSelect callback
  - [ ] T-307: Active genre shows primary styling

**Search:**
- `SearchOverlay.test.tsx`
  - [ ] T-308: Genre chips displayed below search input
  - [ ] T-309: Search query debounced at 300ms
  - [ ] T-310: Genre filter applied to search results
  - [ ] T-311: Empty query with genre filter shows genre results

### Integration Tests (Jest)

**API Integration:**
- `api/dramas.test.js`
  - [ ] T-401: `fetchDramas()` returns array of dramas with correct shape
  - [ ] T-402: `fetchDramaDetail(slug)` returns drama with episodes
  - [ ] T-403: `searchDramas(query, genre)` returns filtered results
  - [ ] T-404: `likeDrama(id)` toggles like and returns updated count
  - [ ] T-405: `saveProgress(episodeId, seconds, completed)` sends correct payload

- `api/watchlist.test.js`
  - [ ] T-406: `fetchWatchlist()` returns user's watchlist
  - [ ] T-407: `addToWatchlist(dramaId)` adds and returns updated list
  - [ ] T-408: `removeFromWatchlist(dramaId)` removes and returns updated list

- `api/subscription.test.js`
  - [ ] T-409: `fetchPlans(platform)` returns plans filtered by platform
  - [ ] T-410: `checkSubscriptionStatus()` returns current status

**Auth Integration:**
- `context/AuthContext.test.tsx`
  - [ ] T-411: Auth context provides subscription status
  - [ ] T-412: Subscription status updates on re-auth
  - [ ] T-413: Delete account clears all local state

### UI/E2E Tests (Maestro — Simulator)

**Player Flows:**
- `e2e/player-swipe.yaml`
  - [ ] E-101: Open a drama → tap first episode → video starts playing
  - [ ] E-102: Swipe up → next episode loads and plays
  - [ ] E-103: Swipe down → previous episode loads and plays
  - [ ] E-104: Tap center of screen → controls appear
  - [ ] E-105: Wait 4 seconds → controls disappear with fade
  - [ ] E-106: Tap play/pause → video pauses/resumes
  - [ ] E-107: Tap skip intro button → video seeks forward
  - [ ] E-108: Swipe up on last episode → toast "last episode" appears
  - [ ] E-109: Tap like button → like count increments
  - [ ] E-110: Tap episode drawer → drawer opens with episode grid
  - [ ] E-111: Select episode from drawer → that episode loads

**Detail Page Flows:**
- `e2e/detail-page.yaml`
  - [ ] E-201: Navigate to drama detail → hero banner visible
  - [ ] E-202: Genre chips visible and show correct genres
  - [ ] E-203: Star rating visible with correct count
  - [ ] E-204: Tap "Start Watching" → navigates to video player
  - [ ] E-205: Tap watchlist button → drama added (button state changes)
  - [ ] E-206: Tap like button → like count increments
  - [ ] E-207: Scroll down → episodes grid visible with all episodes
  - [ ] E-208: Free episodes show "FREE" badge
  - [ ] E-209: Locked episodes show lock icon
  - [ ] E-210: Tap "Read more" → description expands
  - [ ] E-211: Scroll to bottom → "More Like This" section visible
  - [ ] E-212: Tap a "More Like This" drama → navigates to its detail page

**Home Screen Flows:**
- `e2e/home-screen.yaml`
  - [ ] E-301: Home screen loads with hero carousel
  - [ ] E-302: Hero auto-rotates between dramas
  - [ ] E-303: Genre chips visible below hero
  - [ ] E-304: Tapping genre chip filters visible rails
  - [ ] E-305: Continue Watching rail appears (if user has progress)
  - [ ] E-306: Tapping a drama card → navigates to detail page
  - [ ] E-307: Pull down → content refreshes
  - [ ] E-308: Tap search icon → search overlay opens
  - [ ] E-309: Type in search → results appear with debounce

**Watchlist Flows:**
- `e2e/watchlist.yaml`
  - [ ] E-401: Watchlist tab shows saved dramas in grid
  - [ ] E-402: Empty watchlist shows illustration + message
  - [ ] E-403: Tap remove (X) → confirmation → drama removed
  - [ ] E-404: Tap a watchlist card → navigates to detail page
  - [ ] E-405: Pull down → watchlist refreshes

**Profile Flows:**
- `e2e/profile.yaml`
  - [ ] E-501: Profile shows user name and email/phone
  - [ ] E-502: Stats section shows real numbers (saved, watched, hours)
  - [ ] E-503: "Edit Profile" button does NOT exist
  - [ ] E-504: Tap "Delete Account" → confirmation dialog
  - [ ] E-505: Confirm delete → logged out, navigated to login
  - [ ] E-506: Tap "Log Out" → confirmation → logged out
  - [ ] E-507: App version shown (not "1.0.0" hardcoded)

**Auth Flows:**
- `e2e/auth.yaml`
  - [ ] E-601: Login screen shows Google + Phone options
  - [ ] E-602: Guest mode available and navigates to home
  - [ ] E-603: Locked episode tap → subscribe screen shown
  - [ ] E-604: Subscribe screen shows real plans from API

---

## Success Metrics

- **Player reliability:** 0 swipe-related bug reports after release
- **Episode transition time:** < 500ms (measured from swipe to first frame of new episode)
- **Detail page load time:** < 2s from tap to fully rendered (including episodes)
- **Home screen load time:** < 2s with skeleton → content transition
- **Test coverage:** > 80% for modified files (Jest)
- **E2E pass rate:** 100% of Maestro flows pass on iOS simulator
- **No regressions:** All existing functionality preserved

---

## Open Questions

1. Should the "Continue Watching" rail show episode-level or drama-level entries? (Recommended: drama-level with "Episode N" subtitle)
2. Should the skip intro duration be configurable per-episode in the admin panel? (Recommended: yes, add `intro_duration_seconds` to Episode model, default 10)
3. What should happen when a guest user tries to like a drama? (Recommended: prompt login)
4. Should we add haptic feedback on swipe completion? (Recommended: yes, subtle vibration on native)
