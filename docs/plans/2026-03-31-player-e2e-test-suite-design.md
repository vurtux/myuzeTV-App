# Player E2E Test Suite Design

**Date:** 2026-03-31
**Context:** QA failures from 2026-03-30 session targeting the episode player (EpisodeFeed + SingleEpisodePlayer). Builds automated Playwright regression tests for all reported bugs.

## QA Bugs Being Targeted

| Bug | User Type | Root Cause Area |
|-----|-----------|----------------|
| Stuck at 3rd episode (forward E1→E2→E3) | Paid | `handleMomentumScrollEnd` clamping + `scrollStartIndexRef` staleness |
| Stuck at 3rd episode (reverse E5→E4→E3) | Paid | Same clamping logic in reverse direction |
| Pause didn't work | Paid | `handleTogglePlay` early return when `!status.isLoaded` + `needsPlayRef` auto-resume |
| Misses episodes in descending order | Paid | `disableIntervalMomentum` + `pagingEnabled` + `snapToInterval` interaction on web |
| Free user can play locked episodes from play mode | Free | No lock check on current episode during swipe in EpisodeFeed |

## Approach

Approach B: New dedicated spec files with robust helper layer. Percentage-based swipe coordinates (not hardcoded pixels). URL-based navigation where possible.

## Helper Layer (`helpers.ts` extensions)

```
goToEpisode(page, dramaSlug, epNum)     — direct URL navigation + wait for video
swipeUp(page) / swipeDown(page)          — viewport-percentage coordinates
waitForVideoPlaying(page, timeout)       — retry loop checking video state
waitForEpisodeBadge(page, expectedEpNum) — wait for EP badge text match
getCurrentEpisodeNumber(page)            — parse EP badge → number
loginAsFreeUser(page)                    — loginAsTestUser(page, "0000000001")
loginAsPaidUser(page)                    — loginAsTestUser(page, "0000000002")
getTestDrama(page)                       — discover drama slug from home screen
```

## Test Specs

### `07-player-episode-navigation.spec.ts` (11 tests, paid user)

1. Swipe forward E1→E2 plays E2
2. Swipe backward E2→E1 plays E1
3. Sequential forward E1→E2→E3 does not get stuck
4. Sequential backward E5→E4→E3 does not get stuck
5. Five-episode forward run E1→E5 without skipping
6. Five-episode backward run E5→E1 without skipping
7. Rapid consecutive swipes do not skip episodes
8. Swipe at first episode bounces (no negative index)
9. Swipe at last episode bounces (no overflow)
10. Episode from drawer plays correct episode
11. URL updates silently on swipe

### `08-player-controls.spec.ts` (10 tests, paid user)

1. Pause stops video playback
2. Resume after pause continues playback
3. Pause survives across 5 seconds (no auto-resume)
4. Seek forward 10s advances position
5. Seek backward 10s rewinds position
6. Speed change to 1.5x persists during playback
7. Controls auto-hide after 4 seconds
8. Tap toggles controls visibility
9. Progress bar advances during playback
10. Back button exits player

### `09-player-lock-enforcement.spec.ts` (7 tests, free + paid users)

1. Free user: locked episode from detail page redirects to subscribe
2. Free user: swipe from free to locked episode redirects
3. Free user: auto-advance from free to locked shows paywall
4. Free user: drawer tap on locked episode redirects
5. Free user: direct URL to locked episode redirects
6. Paid user: swipe to any episode plays normally
7. Paid user: drawer tap on any episode plays

## Test Data

Primary drama: `the-best-is-yet-to-come` (from QA report).
Fallback: first drama from home screen hero carousel.
Helper `getTestDrama(page)` discovers slug dynamically or reads `PLAYWRIGHT_TEST_DRAMA` env var.

## Total: 28 new E2E tests across 3 spec files
