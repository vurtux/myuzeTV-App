# myuzeTV Gap Closure Design Document

**Date:** 2026-03-21
**Status:** Approved
**Model:** Subscription-only (no coins/gamification/pay-per-episode)
**Market:** Global

---

## 1. Executive Summary

After competitive analysis of ReelShort (370M+ downloads, $490M revenue), DramaBox (100M+ downloads, $450M revenue), and MyDrama (40M+ users, Webby 2025 winner), we identified critical gaps in myuzeTV's current implementation. This design covers 5 phases to bring the app to competitive parity while leveraging our subscription-only model as a key differentiator.

## 2. Competitive Advantage

All three competitors use coin/pay-per-episode as their primary model — the #1 user complaint across review platforms. myuzeTV's clean subscription model ("Watch everything. No coins. No surprises.") is a significant competitive differentiator.

## 3. Design Phases

### Phase 1: Video Player Overhaul (Critical Priority)

**Problem:** The player has broken swipe gestures, screen fitting issues, and missing standard features. Users spend 70%+ of their time in the player — this is the core product.

**Fixes:**

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Swipe/tap ambiguity | 35px dead zone (15-50px) | Add velocity check (`vy`) + tighten thresholds |
| Slow swipes toggle controls | No velocity consideration | Require min velocity OR displacement |
| Diagonal swipes trigger episode change | No secondary direction validation | Validate `|dy| > 2*|dx|` on release |
| Gesture fires over buttons | PanResponder covers controls | Disable gesture when controls visible |
| Black screen during transitions | No loading state | Add spinner during `loadAsync()` |
| Race condition on rapid swipes | No debounce | Queue transitions, cancel pending loads |
| No "last episode" boundary | Silent no-op | Show toast feedback |
| Video cropping | `ResizeMode.COVER` | Use `CONTAIN` with black letterbox |
| Like state resets | Local state only | Wire to `POST /dramas/{id}/like` |
| Controls disappear instantly | No animation | Add opacity fade transition |
| No skip intro | Missing feature | Timer-based skip button (first 5-10s) |

**Target UX:**
- Swipe up/down = instant episode transition with loading indicator
- Tap center = play/pause
- Controls auto-hide with fade (3.5s timeout)
- Skip intro button (auto-shows during intro)
- Episode info badge always visible
- Last-episode boundary feedback
- Proper aspect ratio (CONTAIN mode)

### Phase 2: Drama Detail Page Redesign

**Problem:** Structural UX issues: duplicate description, redundant CTAs, single genre display, text-only rating, fixed hero height, limited episode display.

**Changes:**

| Current | Target |
|---------|--------|
| Description shown in 2 places | Single "About" section with expand/collapse |
| Hero play + "Start Watching" button | Single "Start Watching" CTA below hero |
| `genre[0]` only | All genres as chips |
| Text "4.5" rating | Visual stars ★★★★☆ + number |
| Fixed 450px hero | 55% screen height (responsive) |
| 5 episodes + "+N more" | Full scrollable virtualized grid |
| Spinner loading | Skeleton shimmer placeholders |
| Mock `getDramaDetail()` | Real `GET /dramas/{slug}` endpoint |
| Trailer fields unused | Show trailer if available |
| "More Like This" unfiltered | Genre-matched filtering |

**Target Layout:**
```
Hero Banner (55% screen height)
  ← Back                    Share →
  [Genre] [Genre] [Genre]
  Drama Title
  ★★★★☆ 4.5 · 2024 · Ghana
  45 Episodes

[♥ Like]  [+ Watchlist]

▶ Start Watching · Episode 1 Free

About
  Description (3 lines, expandable)

Episodes (45)
  [1] [2] [3] [4]  (scrollable grid)
  [5] [6🔒] [7🔒] [8🔒]

More Like This
  [Drama] [Drama] [Drama] →
```

### Phase 3: Wire Up Existing Backend Features

| Feature | Backend Endpoint | Current Status | Action |
|---------|-----------------|---------------|--------|
| Watch progress | `POST /episodes/{id}/progress` | Not called | Call on 25/50/75/100% playback |
| Continue Watching | `WatchProgress` model | Component exists, not used | Add to home screen position #1 |
| Subscription plans | `GET /subscription/plans` | Not fetched | Fetch real plans, replace hardcoded |
| Subscription status | `GET /subscription/status` | Not checked | Check on load, store in AuthContext |
| Like toggle | `POST /dramas/{id}/like` | Not called | Wire to like buttons |
| Drama detail | `GET /dramas/{slug}` | Uses mock data | Replace `getDramaDetail()` |
| User stats | `UserResource` | Hardcoded | Fetch from `GET /auth/me` |

**New backend endpoints needed:**
- `GET /continue-watching` — Dramas with active watch progress, sorted by `last_watched_at`
- `GET /dramas/search?q=&genre=` — Full-text search with genre filter
- `DELETE /auth/account` — Account deletion (App Store/Play Store requirement)

### Phase 4: Missing Table-Stakes Features

| Feature | Backend? | Scope |
|---------|---------|-------|
| Skeleton loading states | No | Replace all spinners with shimmer |
| Genre browsing | No | Genre chips on home, filter rails |
| Search with filters | Yes | Add genre/year filter params |
| Onboarding genre selection | Yes | Post-login genre picker |
| Delete account | Yes | Wire button to new endpoint |
| Remove Edit Profile button | No | Delete from ProfileScreen |
| Profile stats from API | Yes | Wire to `GET /auth/me` |
| Skip intro in player | No | Timer-based, configurable per episode |
| Controls fade animation | No | Opacity transition |
| App version from config | No | Read from `app.json` |

### Phase 5: Subscription Flow

- **Web:** Paystack (supports GHS + global cards, already referenced in backend)
- **iOS:** Apple In-App Purchases (StoreKit)
- **Android:** Google Play Billing

**Backend:** Implement 3 verify endpoints (currently 501), webhook handlers, subscription enforcement on locked episodes.

**Frontend:** Fetch real plans, platform-specific purchase flows, subscription status in profile, real gating on locked episodes.

## 4. Out of Scope

- AI Recommendations / Personalization
- Offline downloads
- Quality selection
- Cross-device sync
- Episode comments
- Edit profile (removing button)
- Subtitles (no backend support currently)

## 5. Success Criteria

- Player: Zero swipe/tap ambiguity, < 500ms episode transitions, proper aspect ratio
- Detail page: All genres shown, visual star rating, responsive hero, all episodes visible
- Backend wiring: Real data everywhere (no mocks), progress tracking working
- Subscription: End-to-end payment flow on at least web (Paystack)
- Performance: Skeleton loading, no spinners, < 2s initial page load
