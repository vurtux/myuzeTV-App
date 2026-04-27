# FlashList and FastImage Implementation Plan

**Document Version:** 1.0  
**Last Updated:** February 2025  
**Status:** Implemented

---

## Overview

This document describes the implementation of two performance optimizations in the myuzeTV app:

1. **FlashList** (`@shopify/flash-list`) — Replaces `ScrollView`/`FlatList` for efficient list rendering
2. **FastImage** (`react-native-fast-image`) — Replaces `expo-image` for cached image loading on native platforms

---

## 1. FlashList Implementation

### Purpose

FlashList provides view recycling, reduced memory usage, and smoother scrolling for long lists. It is a drop-in replacement for FlatList with superior performance.

### Components Updated

| Component | Location | Change |
|-----------|----------|--------|
| DramaRail | `components/DramaRail.tsx` | Horizontal ScrollView → FlashList |
| HeroUnit | `components/HeroUnit.tsx` | Horizontal ScrollView → FlashList (with scrollToOffset, snap) |
| ContinueWatchingRail | `components/ContinueWatchingRail.tsx` | Horizontal ScrollView → FlashList |
| SearchOverlay | `components/SearchOverlay.tsx` | Vertical ScrollView → FlashList |
| DramaDetailScreen | `components/DramaDetailScreen.tsx` | "More Like This" ScrollView → FlashList |

### Key Implementation Details

- **FlashList v2** does not require `estimatedItemSize` (auto-calculated)
- Horizontal lists use `horizontal={true}` and fixed item widths via `style`/`marginRight`
- HeroUnit retains `scrollToOffset`, `snapToInterval`, and auto-advance timer behavior
- Ref type: `FlashListRef<T>` from `@shopify/flash-list`

### Package

```json
"@shopify/flash-list": "^2.x"
```

---

## 2. FastImage Implementation

### Purpose

FastImage uses native caching (SDWebImage on iOS, Glide on Android) for faster image loads and reduced bandwidth on repeated views.

### Components Updated

| File | Platform | Implementation |
|------|----------|----------------|
| `components/DramaImage.tsx` | iOS, Android | Uses `react-native-fast-image` |
| `components/DramaImage.web.tsx` | Web | Uses `expo-image` (FastImage has no web support) |

### Key Implementation Details

- **Platform-specific files**: `.tsx` for native, `.web.tsx` for web (Expo/Metro resolves automatically)
- **Resize modes**: `cover`, `contain`, `fill` mapped to FastImage equivalents
- **Placeholder/error handling**: Unchanged from original DramaImage logic
- **Web fallback**: Required because `react-native-fast-image` is native-only

### Package

```json
"react-native-fast-image": "^8.6.3"
```

Installed with `--legacy-peer-deps` for React 19 compatibility.

---

## 3. Build Requirements

### FlashList

- Works with Expo managed workflow
- No native config changes required
- Compatible with React Native new architecture (`newArchEnabled: true`)

### FastImage

- **Requires native build**: Run `npx expo prebuild` or use EAS Build
- Not supported on web — use platform-specific `DramaImage.web.tsx`
- No Expo config plugin required; links automatically during prebuild

---

## 4. File Change Summary

```
components/
├── DramaImage.tsx          # Native: FastImage
├── DramaImage.web.tsx       # Web: expo-image
├── DramaRail.tsx            # FlashList
├── HeroUnit.tsx             # FlashList
├── ContinueWatchingRail.tsx # FlashList
├── SearchOverlay.tsx        # FlashList
└── DramaDetailScreen.tsx    # FlashList (More Like This)

package.json                # Added @shopify/flash-list, react-native-fast-image
```

---

## 5. Testing Checklist

- [ ] Home screen: DramaRail and HeroUnit scroll smoothly
- [ ] HeroUnit: Auto-advance and manual scroll work
- [ ] Search overlay: Trending and results list scroll correctly
- [ ] Drama detail: "More Like This" horizontal list works
- [ ] Images: Drama posters load and cache on iOS/Android
- [ ] Web: App runs without FastImage import errors (uses DramaImage.web.tsx)

---

## 6. Rollback (If Needed)

To revert:

1. Restore `ScrollView` in DramaRail, HeroUnit, ContinueWatchingRail, SearchOverlay, DramaDetailScreen
2. Restore `expo-image` in DramaImage.tsx and remove DramaImage.web.tsx
3. Uninstall: `npm uninstall @shopify/flash-list react-native-fast-image`
