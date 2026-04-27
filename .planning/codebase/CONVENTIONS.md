# Coding Conventions

**Analysis Date:** 2026-04-06

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `BottomNav.tsx`, `GenreChips.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `usePlaybackRequest.ts`, `useWatchlist.ts`)
- Utilities/API: camelCase (e.g., `auth-storage.js`, `date-utils.ts`, `firebase.js`)
- Test files: `{name}.test.{js,ts,tsx}` or `{name}.spec.ts`

**Functions:**
- Public functions: camelCase (e.g., `fetchDramas()`, `saveProgress()`, `usePlaybackRequest()`)
- Helper functions: camelCase, often prefixed with underscore if private-like (e.g., `mapDramaItem()`, `formatDuration()`)
- React components: PascalCase (e.g., `BottomNav`, `WatchlistCard`)
- Callback handlers: prefix with verb (e.g., `onPress`, `onSelect`, `onRemove`)

**Variables:**
- State hooks: camelCase (e.g., `const [selectedGenre, setSelectedGenre]`)
- Constants: UPPER_SNAKE_CASE for module-level constants (e.g., `USER_STORAGE_KEY`, `USER_TOKEN_KEY`)
- Record objects: camelCase keys (e.g., `TEST_ACCOUNTS`, `tabs`)
- DOM attributes: kebab-case where applicable (e.g., `data-testid`)

**Types:**
- Interfaces: PascalCase (e.g., `BottomNavProps`, `GenreChipsProps`, `User`, `AuthState`)
- Type unions/aliases: PascalCase (e.g., `TabId`, `Drama`)
- Export types and interfaces from `lib/types.ts`

## Code Style

**Formatting:**
- No explicit `.prettierrc` or `.eslintrc` files found — relies on Expo defaults
- Uses NativeWind (Tailwind for React Native) with class-based styling
- Babel configured with `nativewind/babel` preset for JSX transformation
- Class names use template literals for dynamic values

**Linting:**
- No custom ESLint configuration found
- Relies on Expo's defaults and Jest's preset (`jest-expo/web`)
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)

**Example style from `GenreChips.tsx`:**
```typescript
interface GenreChipsProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

export function GenreChips({ selectedGenre, onSelect }: GenreChipsProps) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      className={`rounded-full px-4 py-2 ${
        isActive ? "bg-primary" : "bg-white/10"
      }`}
    >
      <Text className={`text-sm font-medium ${
        isActive ? "text-white" : "text-muted-foreground"
      }`}>
        {label}
      </Text>
    </Pressable>
  );
}
```

## Import Organization

**Order:**
1. React/React Native core imports (e.g., `import React`, `import { View, Text }`)
2. Expo and navigation imports (e.g., `import { useRouter } from "expo-router"`)
3. Third-party libraries (e.g., `import { useMutation } from "@tanstack/react-query"`)
4. Local absolute imports using `@/*` alias (e.g., `import { useAuth } from "@/context/AuthContext"`)
5. Local relative imports for sibling files (e.g., `import { resolveImageUrl } from "./mappers"`)

**Path Aliases:**
- Configured in `tsconfig.json`: `@/*` maps to project root
- Used in test files: `import { BottomNav } from "../../components/BottomNav"`

**Example from `context/AuthContext.tsx`:**
```typescript
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserToken, setUserToken } from "../lib/auth-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
```

## Error Handling

**Patterns:**
- **Fire-and-forget for non-critical operations:** `saveProgress()` catches errors silently with `.catch()` to prevent playback interruption
- **Explicit error throws for validation:** `throw new Error("dramaId is required")` on missing required parameters
- **Fallback chains for optional data:** Use nullish coalescing (`??`) and optional chaining (`?.`) extensively
  ```javascript
  const title = item.title ?? item.name ?? "";
  const rawImage = item.thumbnail_url ?? item.banner_url ?? ... ?? item.media?.banner_url;
  ```
- **Try-catch for auth operations:** Used in `getUserToken()` and `setUserToken()` to handle platform-specific errors gracefully
- **Error messages with context:** Log prefixes identify the function (e.g., `[saveProgress]`, `[auth-storage]`)

**Error logging:**
- Uses `console.log()` for debug info (e.g., auth token truncation)
- Uses `console.warn()` for non-fatal issues (e.g., `[saveProgress] Failed to save progress`)
- No production error tracking configured in source (observability likely via external service)

## Logging

**Framework:** `console` directly (no logging library)

**Patterns:**
- **Debug logs:** Include function prefix in brackets, e.g., `[auth-storage]`, `[saveProgress]`
- **Token logging:** Truncate to first 20 chars for security, e.g., `"${token.substring(0, 20)}..."`
- **Warning level:** Used for expected failures that don't block execution
- **Platform-specific:** Some logs only appear on web (e.g., `[auth-storage] getUserToken`)

**Example from `api/dramas.js`:**
```javascript
api.post(`/episodes/${episodeId}/progress`, {...})
  .catch((err) => {
    console.warn('[saveProgress] Failed to save progress:', err?.message || err);
  });
```

## Comments

**When to Comment:**
- **JSDoc for public APIs:** Export functions have JSDoc blocks with `@param` and `@returns`
- **Decision documentation:** Comments explain non-obvious choices (e.g., fallback chains, test account logic)
- **Complex logic:** Comments mark sections with references to user stories (e.g., `// US-005: Watch progress`)
- **Platform-specific code:** Comments flag `.web.ts` vs `.native.ts` differences

**JSDoc/TSDoc:**
- Exported functions have JSDoc blocks:
  ```javascript
  /**
   * Save watch progress for an episode. Fire-and-forget — errors are caught
   * silently so playback is never interrupted.
   *
   * @param {string|number} episodeId
   * @param {number} progressSeconds - current playback position in seconds
   * @param {boolean} isCompleted - whether the episode finished
   */
  export function saveProgress(episodeId, progressSeconds, isCompleted) { ... }
  ```
- TypeScript types in interfaces have inline comments (e.g., `isNew?: boolean`)

## Function Design

**Size:** Generally under 50 lines; larger utility functions broken into helpers
- `mapDramaItem()`: ~25 lines
- `fetchDramaDetail()`: ~60 lines (includes mapping logic)
- `formatDuration()`: 5 lines
- Hooks: 10-20 lines

**Parameters:**
- Prefer objects for multiple parameters: `({ selectedGenre, onSelect }: GenreChipsProps)`
- Callback handlers use standard React naming: `onPress`, `onSelect`, `onRemove`
- Query parameters passed as second argument: `api.get("/dramas")`

**Return Values:**
- Async functions return promises: `async function fetchDramas(): Promise<Drama[]>`
- Hooks return functions or state: `usePlaybackRequest()` returns a function
- Data mappers return transformed objects: `mapDramaItem(item)` returns `{ id, title, image, ... }`
- Graceful fallbacks: Missing data returns empty strings, empty arrays, or placeholders (never `null`)

## Module Design

**Exports:**
- Named exports for functions and components: `export function BottomNav() { ... }`
- Interfaces exported separately: `export interface BottomNavProps { ... }`
- Constants exported as `as const` for type narrowing (e.g., `tabs = [...] as const`)
- No default exports (convention is named exports only)

**Barrel Files:**
- Not heavily used; most imports are direct
- Some domain models exported from `lib/types.ts`

**Component Props:**
- Props defined as separate interfaces: `interface BottomNavProps { activeTab: TabId }`
- Props destructured in function signature: `function BottomNav({ activeTab }: BottomNavProps)`
- All callback props typed explicitly: `onPress: () => void`, `onSelect: (genre: string) => void`

**Data Mapping Pattern (Field Fallbacks):**
- Every API file includes a field mapping strategy with fallback chains
- Example: Image fields (`thumbnail_url → banner_url → thumbnail → image → poster → ...`)
- Example: ID fields (`slug → id → drama_id → ""`)
- Example: Title fields (`title → name → ""`)
- This pattern is duplicated across `api/dramas.js`, `api/rails.js`, `api/watchlist.js` to handle inconsistent backend responses

## TypeScript Usage

**Strict Mode:** Enabled globally
- All functions have explicit parameter types
- Component props typed with interfaces
- Avoid `any` — use `unknown` and narrow with type guards
- Generic types used for flexibility (e.g., hooks, utilities)

**Example from `hooks/usePlaybackRequest.ts`:**
```typescript
export function usePlaybackRequest() {
  const router = useRouter();
  const { token, isSubscribed } = useAuth();

  return function requestPlayback(
    dramaId: string,
    episodeIndex: number,
    isLocked: boolean
  ) {
    // ...
  };
}
```

**Example from `components/GenreChips.tsx`:**
```typescript
interface GenreChipsProps {
  selectedGenre: string;
  onSelect: (genre: string) => void;
}

const GENRES = [
  { label: "All", value: "all" },
  // ...
] as const;

export function GenreChips({ selectedGenre, onSelect }: GenreChipsProps) {
  // ...
}
```

## React Native / NativeWind Patterns

**Styling:**
- All styling via NativeWind classes: `className="flex items-center gap-2"`
- Dynamic classes via template literals: `` className={`text-sm ${isActive ? "text-white" : "text-gray-400"}`} ``
- Avoid inline styles — use custom Tailwind utilities from `global.css` (e.g., `.glass-dark`, `.vignette-bottom`)

**Platform-specific Files:**
- Files ending in `.web.ts` or `.native.ts` loaded per platform
- Example: `analytics-service.web.ts` vs `analytics-service.native.ts`
- Imported as default: `import { analyticsService } from "../lib/analytics-service"`

## Immutability

- Spread operator used for updates: `{ ...user, name }`
- State updates via setter functions: `setSelectedGenre(value)`
- Array methods that return new arrays: `.map()`, `.filter()`, `.sort()`
- Avoid direct mutation of objects/arrays

---

*Convention analysis: 2026-04-06*
