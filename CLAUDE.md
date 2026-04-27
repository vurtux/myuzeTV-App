# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

myuzeTV is a cross-platform short-form drama streaming app built with React Native 0.81 + Expo SDK 54 + expo-router v6 (file-based routing). Targets iOS, Android, and web from a single codebase.

## Development Commands

```bash
npm start                    # Expo dev server (all platforms)
npm run web                  # Web dev server
npm run build:web            # Export static web build to dist/
npm run build:deploy         # Build web + inject auth token config

# Testing
npm test                     # Jest unit tests (jest-expo/web preset)
npm run test:watch           # Jest in watch mode
npm run test:e2e             # Playwright E2E tests (requires web server on :8082)
npm run test:e2e:headed      # Playwright with visible browser
npm run test:e2e:ui          # Playwright interactive UI mode
```

Jest config is in `package.json` (preset: `jest-expo/web`). Playwright config is in `playwright.config.ts` — tests live in `e2e-playwright/`, targets mobile Chrome (Pixel 5 viewport), auto-starts Expo web on port 8082.

## Environment Setup

Copy `.env.example` to `.env`:
- `EXPO_PUBLIC_API_URL` — Backend API base URL (default: `https://tv.myuze.app/api`)
- `EXPO_PUBLIC_CDN_URL` — Optional CDN for images
- `EXPO_PUBLIC_AUTH_TOKEN` — App-level API key for web auth (NOT a user token)

## Architecture

### Routing (`app/`)
- `_layout.tsx` — Root: QueryClientProvider → AuthProvider → AuthGate → Slot
- `(tabs)/` — Authenticated tab group: `index.tsx` (home), `watchlist.tsx`, `profile.tsx`
- `drama/[slug].tsx` — Drama detail page
- `watch/[episodeId].tsx` — Full-screen video player (ByteDance-style vertical feed)
- `login.tsx` — Login with `?redirect=` support for post-auth navigation
- `subscribe.tsx` — Subscription paywall with `?episode=` context for post-subscribe playback

### Dual-Token Auth System (`lib/auth-storage.js`, `context/AuthContext.tsx`)

Two distinct tokens — confusing them causes auth bugs:

1. **API Key** (`getApiKey()`) — App-level client auth. Set via `window.__MYUZE_AUTH_TOKEN__` (web deploy) or `EXPO_PUBLIC_AUTH_TOKEN` env var. Always takes priority in `getAuthToken()`.
2. **User Token** (`getUserToken()`) — Per-user JWT from backend login. Stored in SecureStore (native) or AsyncStorage (web). Set/cleared on login/logout.

`getAuthToken()` returns API key first, user token as fallback. The `api/client.js` interceptor calls `getAuthToken()` for every request. On 401, `triggerAuthInvalid()` fires → AuthContext checks if API key exists before clearing user session (API key 401 = server issue, not user auth failure).

**Test accounts**: Phone numbers `+10000000001` (free) and `+10000000002` (premium) bypass Firebase entirely. OTP is `123456`. Defined inline in `AuthContext.tsx`.

### API Field Mapping Pattern

The backend returns inconsistent field names across endpoints. Every `api/*.js` file has mapper functions that try multiple field names with fallback chains:
- Image: `thumbnail_url → banner_url → thumbnail → image → poster → poster_url → cover → cover_image → cover_url → media.thumbnail_url → media.banner_url`
- ID: `slug → id → drama_id`
- Title: `title → name`
- Genre: `genre → category`
- Response envelope: `data (array) → data.data → data.dramas`

`resolveImageUrl()` handles relative/absolute/protocol-relative URLs and prepends CDN_BASE. `placeholderFor()` generates placeholder images when no image URL exists. This pattern is duplicated across `dramas.js`, `rails.js`, and `watchlist.js`.

### Video Player (`watch/[episodeId].tsx` → `EpisodeFeed` → `SingleEpisodePlayer`)

Episode IDs follow the format `{drama-slug}-{episode-number}` (e.g., `love-in-accra-3`). The watch route parses this to extract `dramaId` and episode number.

`EpisodeFeed` is a FlatList-based vertical scroll (TikTok/ByteDance-style) with:
- `pagingEnabled` + `snapToInterval` for full-screen snapping
- ±1 momentum clamping (prevents skipping episodes)
- Only renders ±1 items from current index for performance
- Auto-advances to next episode on completion (redirects to subscribe if next is locked)
- URL silently updates via `history.replaceState` on web

### Playback Request Flow (`hooks/usePlaybackRequest.ts`)

Centralizes the auth → subscribe → play decision tree:
- Free episode + no token → login → play
- Free episode + token → play directly
- Locked episode + no subscription → login (if needed) → subscribe page → play
- Subscribed users bypass all lock checks

### Home Screen Data Flow

Home (`app/(tabs)/index.tsx`) fetches three parallel queries:
- `["dramas"]` → `fetchDramas()` — all dramas for hero carousel + fallback rail
- `["rails"]` → `fetchRails()` — curated content rails, sorted by `display_order`, hero rails filtered out
- `["continue-watching"]` → `fetchContinueWatching()` — only when authenticated with token

Client-side genre filtering via `GenreChips` component filters rails without re-fetching.

### React Query Cache Keys

- `["dramas"]` — All dramas list
- `["rails"]` — Content rails
- `["drama", slug]` — Drama detail (shared between detail page and player)
- `["watchlist"]` — User's watchlist
- `["continue-watching"]` — Continue watching list

### Styling

NativeWind (Tailwind for RN) configured in `babel.config.js`. Dark-only theme defined in `global.css` with CSS custom properties (HSL format). Primary color: red `0 84% 60%`. Custom utilities: `.glass-dark`, `.vignette-bottom`, `.text-display`, `.text-title`.

`global.css` also applies web-app-like behavior: disables text selection, prevents pull-to-refresh/overscroll, hides native video controls, and locks body to `position: fixed`.

### Platform-Specific Files

Uses Expo platform file extensions (`.web.ts` / `.native.ts`):
- `lib/analytics-service.{web,native}.ts` — Mixpanel + MoEngage + Firebase Analytics
- `components/DramaImage.{web,tsx}.tsx` — Image rendering (expo-image)

### Web Deploy

`build:deploy` → `scripts/inject-config.js` → creates `dist/config.js` with `window.__MYUZE_AUTH_TOKEN__` and injects `<script>` tag into HTML files. This is how the web build gets its API key at runtime without build-time env vars.

### Reference Design

`v0-reference/` contains the original Next.js/shadcn v0 prototype. Used as visual reference only — not imported by the app. Excluded from Jest via `testPathIgnorePatterns`.
